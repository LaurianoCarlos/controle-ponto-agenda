import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Alert, Platform } from 'react-native';
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [agendamentoParaExcluir, setAgendamentoParaExcluir] = useState<string | null>(null);

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
    // Criar uma nova data usando a string da data selecionada
    // Isso evita problemas de fuso horário
    const [ano, mes, dia] = day.dateString.split('-').map(Number);
    const selectedDate = new Date(ano, mes - 1, dia);
    setDataSelecionada(selectedDate);
    setShowCalendar(false);
  };

  // Função para formatar a data para comparação (YYYY-MM-DD)
  const formatarDataParaComparacao = (data: Date): string => {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  };

  const agendamentosFiltrados = agendamentos.filter(agendamento => {
    // Converter a string de data do agendamento para um objeto Date
    const dataAgendamento = new Date(agendamento.data);
    
    // Formatar ambas as datas para comparação
    const dataFormatadaAgendamento = formatarDataParaComparacao(dataAgendamento);
    const dataFormatadaSelecionada = formatarDataParaComparacao(dataSelecionada);
    
    // Comparar as strings formatadas
    return dataFormatadaAgendamento === dataFormatadaSelecionada;
  });

  const handleExcluirAgendamento = async (id: string) => {
    setAgendamentoParaExcluir(id);
    setShowDeleteModal(true);
  };

  const confirmarExclusao = async () => {
    if (!agendamentoParaExcluir) return;

    try {
      await StorageService.deleteAgendamento(agendamentoParaExcluir);
      await carregarDados();
      setShowDeleteModal(false);
      setAgendamentoParaExcluir(null);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível excluir o agendamento');
    }
  };

  const cancelarExclusao = () => {
    setShowDeleteModal(false);
    setAgendamentoParaExcluir(null);
  };

  const renderItem = ({ item }: { item: Agendamento }) => (
    <Card style={styles.cardItem}>
      <View style={styles.cardContent}>
        <View style={styles.cardInfo}>
          <Text style={styles.nome}>{item.nomeCliente}</Text>
          <Text style={styles.telefone}>{item.telefone}</Text>
          <Text style={styles.horario}>{item.hora}</Text>
          <Text style={styles.servico}>{item.servico}</Text>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('AgendamentoDetalhe', { agendamento: item })}
          >
            <Text style={styles.actionButtonText}>Detalhes</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleExcluirAgendamento(item.id)}
          >
            <Text style={styles.actionButtonText}>Excluir</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
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

      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelarExclusao}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirmar Exclusão</Text>
            <Text style={styles.modalText}>
              Tem certeza que deseja excluir este agendamento?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={cancelarExclusao}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.deleteButton]} 
                onPress={confirmarExclusao}
              >
                <Text style={styles.modalButtonText}>Excluir</Text>
              </TouchableOpacity>
            </View>
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
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    backgroundColor: '#6200ee',
    padding: 8,
    borderRadius: 4,
    minWidth: 80,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#ff4444',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 10,
  },
  modalButton: {
    padding: 12,
    borderRadius: 6,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#666666',
  },
  deleteButton: {
    backgroundColor: '#ff4444',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 