import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Alert, Platform, Linking, StatusBar } from 'react-native';
import { Card } from '../components/Card';
import { StorageService } from '../services/storage';
import { Agendamento } from '../types';
import { useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';

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

  const abrirWhatsApp = (telefone: string) => {
    // Remove todos os caracteres não numéricos do telefone
    const numeroLimpo = telefone.replace(/\D/g, '');
    
    // Adiciona o código do país se não tiver
    const numeroCompleto = numeroLimpo.length <= 11 ? `55${numeroLimpo}` : numeroLimpo;
    
    // Cria o link do WhatsApp
    const url = `https://wa.me/${numeroCompleto}`;
    
    // Abre o WhatsApp
    Linking.openURL(url).catch(err => {
      Alert.alert('Erro', 'Não foi possível abrir o WhatsApp');
    });
  };

  const renderItem = ({ item }: { item: Agendamento }) => (
    <Card style={styles.cardItem}>
      <View style={styles.cardContent}>
        <View style={styles.cardInfo}>
          <View style={styles.nomeContainer}>
            <Ionicons name="person-circle-outline" size={20} color="#6200ee" />
            <Text style={styles.nome}>{item.nomeCliente}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={16} color="#666" style={styles.infoIcon} />
            <Text style={styles.telefone}>{item.telefone}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={16} color="#666" style={styles.infoIcon} />
            <Text style={styles.horario}>{item.hora}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="cut-outline" size={16} color="#666" style={styles.infoIcon} />
            <Text style={styles.servico}>{item.servico}</Text>
          </View>
        </View>
        
        <View style={styles.cardActions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.whatsappButton]}
            onPress={() => abrirWhatsApp(item.telefone)}
          >
            <Ionicons name="logo-whatsapp" size={18} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.detailsButton]}
            onPress={() => navigation.navigate('AgendamentoDetalhe', { agendamento: item })}
          >
            <Ionicons name="eye-outline" size={18} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleExcluirAgendamento(item.id)}
          >
            <Ionicons name="trash-outline" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6200ee" />
      
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Agendamentos</Text>
          <TouchableOpacity 
            style={styles.novoButton}
            onPress={() => navigation.navigate('Agendamentos')}
          >
            <Ionicons name="add-circle" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.novoButtonText}>Novo</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.dateSelector}>
        <TouchableOpacity 
          style={styles.dateButton}
          onPress={() => setShowCalendar(true)}
        >
          <Ionicons name="calendar" size={20} color="#6200ee" style={styles.dateIcon} />
          <Text style={styles.dateButtonText}>
            {dataSelecionada.toLocaleDateString()}
          </Text>
          <Ionicons name="chevron-down" size={16} color="#6200ee" style={styles.dateIcon} />
        </TouchableOpacity>
        
        <View style={styles.agendamentosCountContainer}>
          <Ionicons name="calendar-number" size={16} color="#6200ee" />
          <Text style={styles.agendamentosCount}>
            {agendamentosFiltrados.length} {agendamentosFiltrados.length === 1 ? 'agendamento' : 'agendamentos'}
          </Text>
        </View>
      </View>

      <FlatList
        data={agendamentosFiltrados}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>Nenhum agendamento para esta data</Text>
          </View>
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
            <View style={styles.calendarHeader}>
              <Text style={styles.calendarTitle}>Selecione a Data</Text>
              <TouchableOpacity 
                style={styles.closeIconButton}
                onPress={() => setShowCalendar(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
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
          <View style={styles.deleteModalContainer}>
            <View style={styles.deleteModalHeader}>
              <Ionicons name="warning" size={32} color="#ff4444" />
              <Text style={styles.deleteModalTitle}>Confirmar Exclusão</Text>
            </View>
            
            <Text style={styles.deleteModalText}>
              Tem certeza que deseja excluir este agendamento?
            </Text>
            
            <View style={styles.deleteModalButtons}>
              <TouchableOpacity 
                style={[styles.deleteModalButton, styles.cancelButton]}
                onPress={cancelarExclusao}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.deleteModalButton, styles.confirmButton]}
                onPress={confirmarExclusao}
              >
                <Text style={styles.confirmButtonText}>Excluir</Text>
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
  },
  header: {
    backgroundColor: '#6200ee',
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight,
    paddingBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  novoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  buttonIcon: {
    marginRight: 4,
  },
  novoButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  dateIcon: {
    marginRight: 4,
  },
  dateButtonText: {
    color: '#6200ee',
    fontWeight: '500',
    marginRight: 4,
  },
  agendamentosCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  agendamentosCount: {
    color: '#6200ee',
    fontWeight: '500',
    marginLeft: 4,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  cardItem: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardInfo: {
    flex: 1,
  },
  nomeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  nome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginLeft: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoIcon: {
    marginRight: 8,
  },
  telefone: {
    fontSize: 14,
    color: '#666666',
  },
  horario: {
    fontSize: 14,
    color: '#666666',
  },
  servico: {
    fontSize: 14,
    color: '#666666',
  },
  cardActions: {
    justifyContent: 'space-around',
    paddingLeft: 16,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  whatsappButton: {
    backgroundColor: '#25D366',
  },
  detailsButton: {
    backgroundColor: '#6200ee',
  },
  deleteButton: {
    backgroundColor: '#ff4444',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
    marginTop: 16,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  calendarContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  closeIconButton: {
    padding: 4,
  },
  closeButton: {
    backgroundColor: '#6200ee',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  closeButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteModalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    width: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  deleteModalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  deleteModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 8,
  },
  deleteModalText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
  },
  deleteModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  deleteModalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  confirmButton: {
    backgroundColor: '#ff4444',
  },
  cancelButtonText: {
    color: '#666666',
    fontWeight: 'bold',
  },
  confirmButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
}); 