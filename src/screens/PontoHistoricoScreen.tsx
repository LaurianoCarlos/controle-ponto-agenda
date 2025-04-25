import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Card } from '../components/Card';
import { StorageService } from '../services/storage';
import { Ponto } from '../types';
import { useFocusEffect } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';

interface ResumoHoras {
  totalHoras: number;
  horasExtras: number;
}

export const PontoHistoricoScreen: React.FC = () => {
  const [pontos, setPontos] = useState<Ponto[]>([]);
  const [mesSelecionado, setMesSelecionado] = useState<number>(new Date().getMonth());
  const [diasMarcados, setDiasMarcados] = useState<{[key: string]: {selected: boolean, marked: boolean, dotColor: string}}>({});
  const [resumoHoras, setResumoHoras] = useState<ResumoHoras>({ totalHoras: 0, horasExtras: 0 });

  const calcularHorasTrabalhadas = (ponto: Ponto): number => {
    if (!ponto.entrada || !ponto.saida) return 0;

    const entrada = new Date(ponto.entrada);
    const saida = new Date(ponto.saida);
    
    let horasTrabalhadas = (saida.getTime() - entrada.getTime()) / (1000 * 60 * 60);

    // Se tiver horário de almoço, subtrai o tempo
    if (ponto.entradaAlmoco && ponto.saidaAlmoco) {
      const entradaAlmoco = new Date(ponto.entradaAlmoco);
      const saidaAlmoco = new Date(ponto.saidaAlmoco);
      const tempoAlmoco = (saidaAlmoco.getTime() - entradaAlmoco.getTime()) / (1000 * 60 * 60);
      horasTrabalhadas -= tempoAlmoco;
    }

    return horasTrabalhadas;
  };

  const calcularResumoHoras = (pontos: Ponto[]): ResumoHoras => {
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
  };

  const carregarPontos = async () => {
    const todosPontos = await StorageService.getPontos();
    const pontosFiltrados = todosPontos.filter(ponto => {
      const [ano, mes] = ponto.data.split('-').map(Number);
      return mes - 1 === mesSelecionado;
    });
    setPontos(pontosFiltrados);
    setResumoHoras(calcularResumoHoras(pontosFiltrados));

    // Prepara os dias marcados para o calendário
    const marcacoes: {[key: string]: {selected: boolean, marked: boolean, dotColor: string}} = {};
    todosPontos.forEach(ponto => {
      marcacoes[ponto.data] = {
        selected: false,
        marked: true,
        dotColor: '#6200ee'
      };
    });
    setDiasMarcados(marcacoes);
  };

  // Atualiza os dados quando a tela recebe foco
  useFocusEffect(
    React.useCallback(() => {
      carregarPontos();
    }, [mesSelecionado])
  );

  const formatarData = (data: string) => {
    const [ano, mes, dia] = data.split('-').map(Number);
    return new Date(ano, mes - 1, dia).toLocaleDateString('pt-BR');
  };

  const formatarHora = (data: Date) => {
    return new Date(data).toLocaleTimeString('pt-BR');
  };

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

  const renderItem = ({ item }: { item: Ponto }) => (
    <Card style={styles.cardItem}>
      <View style={styles.cardHeader}>
        <Text style={styles.data}>{formatarData(item.data)}</Text>
        <TouchableOpacity
          onPress={() => excluirPonto(item.data)}
          style={styles.deleteButton}
        >
          <Text style={styles.deleteButtonText}>Excluir</Text>
        </TouchableOpacity>
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
  deleteButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
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
}); 