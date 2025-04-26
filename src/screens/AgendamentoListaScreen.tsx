import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal } from 'react-native';
import { Card } from '../components/Card';
import { StorageService } from '../services/storage';
import { Agendamento } from '../types';
import { useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Calendar } from 'react-native-calendars';

type AgendamentoListaScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AgendamentoLista'>;

interface Props {
  navigation: AgendamentoListaScreenNavigationProp;
}

export const AgendamentoListaScreen: React.FC<Props> = ({ navigation }) => {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [dataSelecionada, setDataSelecionada] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [markedDates, setMarkedDates] = useState<any>({});

  const carregarDados = async () => {
    const dadosAgendamentos = await StorageService.getAgendamentos();
    setAgendamentos(dadosAgendamentos);
    
    // Marcar datas com agendamentos
    const datasMarcadas: any = {};
    dadosAgendamentos.forEach(agendamento => {
      const dataFormatada = new Date(agendamento.data).toISOString().split('T')[0];
      datasMarcadas[dataFormatada] = { marked: true, dotColor: '#6200ee' };
    });
    setMarkedDates(datasMarcadas);
  };

  useFocusEffect(
    React.useCallback(() => {
      carregarDados();
    }, [])
  );

  const handleCalendarDayPress = (day: any) => {
    const selectedDate = new Date(day.dateString);
    setDataSelecionada(selectedDate);
    setShowCalendar(false);
  };

  const agendamentosFiltrados = agendamentos.filter(agendamento => {
    const dataAgendamento = new Date(agendamento.data);
    return dataAgendamento.toDateString() === dataSelecionada.toDateString();
  });

  const renderItem = ({ item }: { item: Agendamento }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('AgendamentoDetalhe', { agendamento: item })}
    >
      <Card style={styles.cardItem}>
        <Text style={styles.nome}>{item.nomeCliente}</Text>
        <Text style={styles.telefone}>{item.telefone}</Text>
        <Text style={styles.horario}>{item.hora}</Text>
        <Text style={styles.servico}>{item.servico}</Text>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Agendamentos</Text>
        <TouchableOpacity 
          style={styles.novoButton}
          onPress={() => navigation.navigate('Agendamentos')}
        >
          <Text style={styles.novoButtonText}>Novo Agendamento</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.dateButton}
        onPress={() => setShowCalendar(true)}
      >
        <Text style={styles.dateButtonText}>
          {dataSelecionada.toLocaleDateString()}
        </Text>
      </TouchableOpacity>

      <FlatList
        data={agendamentosFiltrados}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={true}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhum agendamento para esta data</Text>
        }
      />

      <Modal
        visible={showCalendar}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCalendar(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.calendarContainer}>
            <Text style={styles.calendarTitle}>Selecione a Data</Text>
            <Calendar
              current={dataSelecionada.toISOString()}
              onDayPress={handleCalendarDayPress}
              markedDates={{
                ...markedDates,
                [dataSelecionada.toISOString().split('T')[0]]: { 
                  selected: true, 
                  selectedColor: '#6200ee',
                  marked: markedDates[dataSelecionada.toISOString().split('T')[0]]?.marked,
                  dotColor: '#6200ee'
                }
              }}
              theme={{
                todayTextColor: '#6200ee',
                selectedDayBackgroundColor: '#6200ee',
                selectedDayTextColor: '#ffffff',
                dotColor: '#6200ee',
                arrowColor: '#6200ee',
                monthTextColor: '#6200ee',
                textDayFontWeight: '300',
                textMonthFontWeight: 'bold',
                textDayHeaderFontWeight: '300',
                textDayFontSize: 16,
                textMonthFontSize: 16,
                textDayHeaderFontSize: 16
              }}
            />
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowCalendar(false)}
            >
              <Text style={styles.closeButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  novoButton: {
    backgroundColor: '#6200ee',
    padding: 12,
    borderRadius: 8,
  },
  novoButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dateButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  listContainer: {
    paddingBottom: 16,
  },
  cardItem: {
    marginBottom: 12,
    padding: 16,
  },
  nome: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  telefone: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  horario: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  servico: {
    fontSize: 14,
    color: '#666666',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666666',
    marginTop: 32,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  calendarContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#6200ee',
  },
  closeButton: {
    backgroundColor: '#6200ee',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 