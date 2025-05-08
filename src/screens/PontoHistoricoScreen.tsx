import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, Alert, TouchableOpacity, Modal, Platform } from 'react-native';
import { Card } from '../components/Card';
import { StorageService } from '../services/storage';
import { Ponto } from '../types';
import { useFocusEffect } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

interface ResumoHoras {
  totalHoras: number;
  horasExtras: number;
}

export const PontoHistoricoScreen: React.FC = () => {
  const [pontos, setPontos] = useState<Ponto[]>([]);
  const [mesSelecionado, setMesSelecionado] = useState<number>(new Date().getMonth());
  const [diasMarcados, setDiasMarcados] = useState<{[key: string]: {selected: boolean, marked: boolean, dotColor: string}}>({});
  const [resumoHoras, setResumoHoras] = useState<ResumoHoras>({ totalHoras: 0, horasExtras: 0 });
  const [modalEdicaoVisible, setModalEdicaoVisible] = useState<boolean>(false);
  const [pontoEmEdicao, setPontoEmEdicao] = useState<Ponto | null>(null);
  const [mostrarSeletorHora, setMostrarSeletorHora] = useState<boolean>(false);
  const [tipoHoraSelecionada, setTipoHoraSelecionada] = useState<'entrada' | 'saida' | 'entradaAlmoco' | 'saidaAlmoco' | null>(null);
  const [modalExclusaoVisible, setModalExclusaoVisible] = useState<boolean>(false);
  const [pontoParaExcluir, setPontoParaExcluir] = useState<Ponto | null>(null);

  const calcularHorasTrabalhadas = useCallback((ponto: Ponto): number => {
    if (!ponto.entrada || !ponto.saida) return 0;

    const entrada = new Date(ponto.entrada);
    const saida = new Date(ponto.saida);
    
    let horasTrabalhadas = (saida.getTime() - entrada.getTime()) / (1000 * 60 * 60);

    if (ponto.entradaAlmoco && ponto.saidaAlmoco) {
      const entradaAlmoco = new Date(ponto.entradaAlmoco);
      const saidaAlmoco = new Date(ponto.saidaAlmoco);
      const tempoAlmoco = (saidaAlmoco.getTime() - entradaAlmoco.getTime()) / (1000 * 60 * 60);
      horasTrabalhadas -= tempoAlmoco;
    }

    return horasTrabalhadas;
  }, []);

  const calcularResumoHoras = useCallback((pontos: Ponto[]): ResumoHoras => {
    let totalHoras = 0;
    let horasExtras = 0;

    pontos.forEach(ponto => {
      const horasTrabalhadas = calcularHorasTrabalhadas(ponto);
      totalHoras += horasTrabalhadas;
      
      if (horasTrabalhadas > 8) {
        horasExtras += horasTrabalhadas - 8;
      }
    });

    return {
      totalHoras: Number(totalHoras.toFixed(2)),
      horasExtras: Number(horasExtras.toFixed(2))
    };
  }, [calcularHorasTrabalhadas]);

  const carregarPontos = useCallback(async () => {
    const todosPontos = await StorageService.getPontos();
    const pontosFiltrados = todosPontos.filter(ponto => {
      const [ano, mes] = ponto.data.split('-').map(Number);
      return mes - 1 === mesSelecionado;
    });
    setPontos(pontosFiltrados);
    setResumoHoras(calcularResumoHoras(pontosFiltrados));

    const marcacoes: {[key: string]: {selected: boolean, marked: boolean, dotColor: string}} = {};
    todosPontos.forEach(ponto => {
      marcacoes[ponto.data] = {
        selected: false,
        marked: true,
        dotColor: '#6200ee'
      };
    });
    setDiasMarcados(marcacoes);
  }, [mesSelecionado, calcularResumoHoras]);

  useFocusEffect(
    useCallback(() => {
      carregarPontos();
    }, [carregarPontos])
  );

  const formatarData = useCallback((data: string) => {
    const [ano, mes, dia] = data.split('-').map(Number);
    return new Date(ano, mes - 1, dia).toLocaleDateString('pt-BR');
  }, []);

  const formatarHora = useCallback((data: Date) => {
    return new Date(data).toLocaleTimeString('pt-BR');
  }, []);

  const excluirPonto = async (data: string) => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir este registro de ponto?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.deletePonto(data);
              await carregarPontos();
              Alert.alert('Sucesso', 'Registro excluído com sucesso!');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir o registro.');
            }
          },
        },
      ],
    );
  };

  const abrirModalEdicao = (ponto: Ponto) => {
    setPontoEmEdicao({
      ...ponto,
      entrada: new Date(ponto.entrada),
      saida: ponto.saida ? new Date(ponto.saida) : undefined,
      entradaAlmoco: ponto.entradaAlmoco ? new Date(ponto.entradaAlmoco) : undefined,
      saidaAlmoco: ponto.saidaAlmoco ? new Date(ponto.saidaAlmoco) : undefined,
    });
    setModalEdicaoVisible(true);
  };

  const fecharModalEdicao = () => {
    setModalEdicaoVisible(false);
    setPontoEmEdicao(null);
  };

  const selecionarHora = (tipo: 'entrada' | 'saida' | 'entradaAlmoco' | 'saidaAlmoco') => {
    setTipoHoraSelecionada(tipo);
    setMostrarSeletorHora(true);
  };

  const onHoraChange = (event: any, horaSelecionada?: Date) => {
    setMostrarSeletorHora(false);
    if (horaSelecionada && pontoEmEdicao && tipoHoraSelecionada) {
      const novaData = new Date(pontoEmEdicao[tipoHoraSelecionada] || new Date());
      novaData.setHours(horaSelecionada.getHours());
      novaData.setMinutes(horaSelecionada.getMinutes());
      
      setPontoEmEdicao({
        ...pontoEmEdicao,
        [tipoHoraSelecionada]: novaData,
      });
    }
  };

  const salvarEdicao = async () => {
    if (!pontoEmEdicao) return;

    try {
      await StorageService.savePonto(pontoEmEdicao);
      await carregarPontos();
      fecharModalEdicao();
      Alert.alert('Sucesso', 'Registro atualizado com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar o registro.');
    }
  };

  const mostrarModalExclusao = (ponto: Ponto) => {
    setPontoParaExcluir(ponto);
    setModalExclusaoVisible(true);
  };

  const confirmarExclusao = async () => {
    if (!pontoParaExcluir) return;

    try {
      await StorageService.deletePonto(pontoParaExcluir.data);
      await carregarPontos();
      setModalExclusaoVisible(false);
      setPontoParaExcluir(null);
      Alert.alert('Sucesso', 'Registro excluído com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível excluir o registro.');
    }
  };

  const cancelarExclusao = () => {
    setModalExclusaoVisible(false);
    setPontoParaExcluir(null);
  };

  const renderItem = ({ item }: { item: Ponto }) => (
    <Card style={styles.cardItem}>
      <View style={styles.cardHeader}>
        <Text style={styles.data}>{formatarData(item.data)}</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={() => abrirModalEdicao(item)}
            style={[styles.actionButton, styles.editButton]}
          >
            <Ionicons name="create-outline" size={20} color="#ffffff" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => mostrarModalExclusao(item)}
            style={[styles.actionButton, styles.deleteButton]}
          >
            <Ionicons name="trash-outline" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.horariosContainer}>
        <Text style={styles.horario}>Entrada: {formatarHora(item.entrada)}</Text>
        {item.saida && (
          <Text style={styles.horario}>Saída: {formatarHora(item.saida)}</Text>
        )}
        {item.entradaAlmoco && (
          <Text style={styles.horario}>Entrada Almoço: {formatarHora(item.entradaAlmoco)}</Text>
        )}
        {item.saidaAlmoco && (
          <Text style={styles.horario}>Saída Almoço: {formatarHora(item.saidaAlmoco)}</Text>
        )}
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Histórico de Pontos</Text>
      
      <View style={styles.calendarContainer}>
        <Calendar
          markedDates={diasMarcados}
          markingType="dot"
          theme={{
            todayTextColor: '#6200ee',
            selectedDayBackgroundColor: '#6200ee',
            selectedDayTextColor: '#ffffff',
            dotColor: '#6200ee',
            arrowColor: '#6200ee',
            monthTextColor: '#000000',
            textDayFontWeight: '300',
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: '300',
            textDayFontSize: 16,
            textMonthFontSize: 16,
            textDayHeaderFontSize: 16
          }}
          onMonthChange={(month: { month: number }) => {
            setMesSelecionado(month.month - 1);
          }}
        />
      </View>

      <View style={styles.resumoContainer}>
        <Card style={styles.resumoCard}>
          <Text style={styles.resumoTitle}>Resumo do Mês</Text>
          <View style={styles.resumoItem}>
            <Text style={styles.resumoLabel}>Total de Horas:</Text>
            <Text style={styles.resumoValue}>{resumoHoras.totalHoras}h</Text>
          </View>
          <View style={styles.resumoItem}>
            <Text style={styles.resumoLabel}>Horas Extras:</Text>
            <Text style={[styles.resumoValue, resumoHoras.horasExtras > 0 ? styles.horasExtras : null]}>
              {resumoHoras.horasExtras}h
            </Text>
          </View>
        </Card>
      </View>

      <FlatList
        data={pontos}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={true}
      />

      <Modal
        visible={modalEdicaoVisible}
        transparent
        animationType="fade"
        onRequestClose={fecharModalEdicao}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Registro</Text>
            <Text style={styles.modalSubtitle}>{pontoEmEdicao ? formatarData(pontoEmEdicao.data) : ''}</Text>

            <View style={styles.horaEditContainer}>
              <Text style={styles.horaLabel}>Entrada:</Text>
              <TouchableOpacity
                style={styles.horaButton}
                onPress={() => selecionarHora('entrada')}
              >
                <Text style={styles.horaText}>
                  {pontoEmEdicao?.entrada ? formatarHora(pontoEmEdicao.entrada) : '--:--'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.horaEditContainer}>
              <Text style={styles.horaLabel}>Saída Almoço:</Text>
              <TouchableOpacity
                style={styles.horaButton}
                onPress={() => selecionarHora('entradaAlmoco')}
              >
                <Text style={styles.horaText}>
                  {pontoEmEdicao?.entradaAlmoco ? formatarHora(pontoEmEdicao.entradaAlmoco) : '--:--'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.horaEditContainer}>
              <Text style={styles.horaLabel}>Volta Almoço:</Text>
              <TouchableOpacity
                style={styles.horaButton}
                onPress={() => selecionarHora('saidaAlmoco')}
              >
                <Text style={styles.horaText}>
                  {pontoEmEdicao?.saidaAlmoco ? formatarHora(pontoEmEdicao.saidaAlmoco) : '--:--'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.horaEditContainer}>
              <Text style={styles.horaLabel}>Saída:</Text>
              <TouchableOpacity
                style={styles.horaButton}
                onPress={() => selecionarHora('saida')}
              >
                <Text style={styles.horaText}>
                  {pontoEmEdicao?.saida ? formatarHora(pontoEmEdicao.saida) : '--:--'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={fecharModalEdicao}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={salvarEdicao}
              >
                <Text style={styles.modalButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={modalExclusaoVisible}
        transparent
        animationType="fade"
        onRequestClose={cancelarExclusao}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="warning" size={32} color="#ff4444" />
              <Text style={styles.modalTitle}>Confirmar Exclusão</Text>
            </View>
            
            <Text style={styles.modalText}>
              Tem certeza que deseja excluir este registro de ponto?
            </Text>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={cancelarExclusao}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalDeleteButton]}
                onPress={confirmarExclusao}
              >
                <Text style={styles.modalButtonText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {mostrarSeletorHora && (
        <DateTimePicker
          value={pontoEmEdicao?.[tipoHoraSelecionada || 'entrada'] || new Date()}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={onHoraChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    padding: 16,
  },
  calendarContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    margin: 16,
    marginTop: 0,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  cardItem: {
    marginBottom: 12,
    elevation: 2,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  data: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editButton: {
    backgroundColor: '#4CAF50',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  horariosContainer: {
    gap: 4,
  },
  horario: {
    fontSize: 14,
    color: '#666666',
  },
  resumoContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  resumoCard: {
    padding: 16,
  },
  resumoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  resumoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resumoLabel: {
    fontSize: 16,
    color: '#666666',
  },
  resumoValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  horasExtras: {
    color: '#f44336',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 24,
    textAlign: 'center',
  },
  horaEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  horaLabel: {
    fontSize: 16,
    color: '#333333',
    flex: 1,
  },
  horaButton: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 4,
    minWidth: 100,
    alignItems: 'center',
  },
  horaText: {
    fontSize: 16,
    color: '#333333',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  modalButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 8,
  },
  modalDeleteButton: {
    backgroundColor: '#4A90E2',
  },
  modalCancelButton: {
    backgroundColor: '#f44336',
  },
  modalText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 24,
    textAlign: 'center',
  },
}); 