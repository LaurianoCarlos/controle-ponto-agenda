import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Alert, Platform, Linking, StatusBar, ScrollView, ActivityIndicator } from 'react-native';
import { Card } from '../components/Card';
import { StorageService } from '../services/storage';
import { Agendamento } from '../types';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles/AgendamentoListaScreenStyles';

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
  const [modalVisible, setModalVisible] = useState(false);
  const [agendamentoToDelete, setAgendamentoToDelete] = useState<Agendamento | null>(null);
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState<Agendamento | null>(null);
  const [loading, setLoading] = useState(false);

  const carregarDados = useCallback(async () => {
    try {
      setLoading(true);
      const dadosAgendamentos = await StorageService.getAgendamentos();
      setAgendamentos(dadosAgendamentos);
      
      // Marcar datas com agendamentos
      const datasMarcadas: any = {};
      dadosAgendamentos.forEach(agendamento => {
        try {
          const dataFormatada = new Date(agendamento.data).toISOString().split('T')[0];
          datasMarcadas[dataFormatada] = { marked: true, dotColor: '#6200ee' };
        } catch (error) {
          console.error('Erro ao formatar data do agendamento:', error);
        }
      });
      setMarkedDates(datasMarcadas);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      Alert.alert('Erro', 'Não foi possível carregar os agendamentos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [carregarDados])
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

  const mostrarModalExclusao = (agendamento: Agendamento) => {
    setAgendamentoToDelete(agendamento);
    setModalVisible(true);
  };

  const confirmarExclusao = async () => {
    if (agendamentoToDelete) {
      try {
        await StorageService.deleteAgendamento(agendamentoToDelete.id);
        setModalVisible(false);
        setAgendamentoToDelete(null);
        carregarDados();
      } catch (error) {
        console.error('Erro ao excluir agendamento:', error);
        Alert.alert('Erro', 'Não foi possível excluir o agendamento');
      }
    }
  };

  const cancelarExclusao = () => {
    setModalVisible(false);
    setAgendamentoToDelete(null);
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
            onPress={() => mostrarModalExclusao(item)}
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
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={[styles.headerButton, styles.pontoButton]}
              onPress={() => navigation.navigate('Ponto')}
            >
              <Ionicons name="time-outline" size={20} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.headerButtonText}>Ponto</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.headerButton, styles.novoButton]}
              onPress={() => navigation.navigate('NovoAgendamento')}
            >
              <Ionicons name="add-circle" size={20} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.headerButtonText}>Novo</Text>
            </TouchableOpacity>
          </View>
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

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200ee" />
        </View>
      ) : (
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
      )}

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
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={cancelarExclusao}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirmar Exclusão</Text>
            <Text style={styles.modalMessage}>
              Tem certeza que deseja excluir este agendamento?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={cancelarExclusao}
              >
                <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmarExclusao}
              >
                <Text style={[styles.buttonText, styles.confirmButtonText]}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}; 