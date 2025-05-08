import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, Alert, TouchableOpacity, Modal, Platform } from 'react-native';
import { Card } from '../components/Card';
import { StorageService } from '../services/storage';
import { Ponto } from '../types';
import { useFocusEffect } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles/PontoScreenStyles';

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

  const renderPontoItem = ({ item }: { item: Ponto }) => {
    const horasTrabalhadas = calcularHorasTrabalhadas(item);
    const status = horasTrabalhadas >= 8 ? 'Completo' : 'Incompleto';
    const statusColor = horasTrabalhadas >= 8 ? '#4CAF50' : '#FFA000';

    return (
      <Card style={styles.recordCard}>
        <View style={styles.recordCardContent}>
          <View style={styles.recordInfo}>
            <View style={styles.recordHeader}>
              <Ionicons name="calendar" size={20} color="#6200ee" />
              <Text style={styles.recordTitle}>{formatarData(item.data)}</Text>
            </View>
            
            <View style={[styles.recordStatus, { backgroundColor: status === 'Completo' ? '#E8F5E9' : '#FFF3E0' }]}>
              <Text style={[styles.recordStatusText, { color: statusColor }]}>{status}</Text>
            </View>

            <View style={styles.recordDetails}>
              <View style={styles.recordDetail}>
                <Text style={styles.recordDetailLabel}>Entrada</Text>
                <Text style={styles.recordDetailValue}>
                  {item.entrada ? new Date(item.entrada).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                </Text>
              </View>
              
              <View style={styles.recordDetail}>
                <Text style={styles.recordDetailLabel}>Saída Almoço</Text>
                <Text style={styles.recordDetailValue}>
                  {item.entradaAlmoco ? new Date(item.entradaAlmoco).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                </Text>
              </View>
              
              <View style={styles.recordDetail}>
                <Text style={styles.recordDetailLabel}>Volta Almoço</Text>
                <Text style={styles.recordDetailValue}>
                  {item.saidaAlmoco ? new Date(item.saidaAlmoco).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                </Text>
              </View>
              
              <View style={styles.recordDetail}>
                <Text style={styles.recordDetailLabel}>Saída</Text>
                <Text style={styles.recordDetailValue}>
                  {item.saida ? new Date(item.saida).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                </Text>
              </View>
            </View>

            <View style={styles.recordActions}>
              <TouchableOpacity 
                style={[styles.recordActionButton, styles.recordActionButtonEdit]}
                onPress={() => abrirModalEdicao(item)}
              >
                <Text style={styles.recordActionButtonEditText}>Editar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.recordActionButton, styles.recordActionButtonDelete]}
                onPress={() => mostrarModalExclusao(item)}
              >
                <Text style={styles.recordActionButtonDeleteText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Histórico de Pontos</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <Card style={styles.card}>
          <View style={styles.dateSection}>
            <View style={styles.dateHeader}>
              <Ionicons name="calendar" size={24} color="#6200ee" />
              <Text style={styles.dateTitle}>Calendário</Text>
            </View>
            
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
        </Card>

        <Card style={styles.card}>
          <View style={styles.dateSection}>
            <View style={styles.dateHeader}>
              <Ionicons name="time" size={24} color="#6200ee" />
              <Text style={styles.dateTitle}>Resumo do Mês</Text>
            </View>
            
            <View style={styles.recordDetails}>
              <View style={styles.recordDetail}>
                <Text style={styles.recordDetailLabel}>Total de Horas</Text>
                <Text style={styles.recordDetailValue}>{resumoHoras.totalHoras}h</Text>
              </View>
              
              <View style={styles.recordDetail}>
                <Text style={styles.recordDetailLabel}>Horas Extras</Text>
                <Text style={styles.recordDetailValue}>{resumoHoras.horasExtras}h</Text>
              </View>
            </View>
          </View>
        </Card>

        <FlatList
          data={pontos}
          renderItem={renderPontoItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      </ScrollView>

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