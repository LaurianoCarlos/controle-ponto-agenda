import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, Modal, Platform, ScrollView, StatusBar } from 'react-native';
import { Card } from '../components/Card';
import { StorageService } from '../services/storage';
import { Agendamento } from '../types';
import { useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';

type AgendamentoScreenNavigationProp = StackNavigationProp<RootStackParamList, 'NovoAgendamento'>;

interface Props {
  navigation: AgendamentoScreenNavigationProp;
}

const HORARIOS_DISPONIVEIS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30'
];

export const AgendamentoScreen: React.FC<Props> = ({ navigation }) => {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [nomeCliente, setNomeCliente] = useState('');
  const [telefone, setTelefone] = useState('');
  const [servico, setServico] = useState('');
  const [data, setData] = useState(new Date());
  const [hora, setHora] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimeList, setShowTimeList] = useState(false);
  const [markedDates, setMarkedDates] = useState<any>({});
  const [horariosOcupados, setHorariosOcupados] = useState<string[]>([]);

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

    // Verificar horários ocupados para a data selecionada
    const dataFormatada = data.toISOString().split('T')[0];
    const horariosOcupadosNaData = dadosAgendamentos
      .filter(a => new Date(a.data).toISOString().split('T')[0] === dataFormatada)
      .map(a => a.hora);
    setHorariosOcupados(horariosOcupadosNaData);
  };

  useFocusEffect(
    React.useCallback(() => {
      carregarDados();
    }, [data])
  );

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setData(selectedDate);
      // Atualizar horários ocupados quando a data muda
      const dataFormatada = selectedDate.toISOString().split('T')[0];
      const horariosOcupadosNaData = agendamentos
        .filter(a => new Date(a.data).toISOString().split('T')[0] === dataFormatada)
        .map(a => a.hora);
      setHorariosOcupados(horariosOcupadosNaData);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setHora(selectedTime);
    }
  };

  const handleCalendarDayPress = (day: any) => {
    // Criar uma nova data usando a string da data selecionada
    // Isso evita problemas de fuso horário
    const [ano, mes, dia] = day.dateString.split('-').map(Number);
    const selectedDate = new Date(ano, mes - 1, dia);
    setData(selectedDate);
    setShowCalendar(false);
    // Atualizar horários ocupados quando a data muda
    const horariosOcupadosNaData = agendamentos
      .filter(a => new Date(a.data).toISOString().split('T')[0] === day.dateString)
      .map(a => a.hora);
    setHorariosOcupados(horariosOcupadosNaData);
  };

  const handleTimeSelect = (horario: string) => {
    const [hours, minutes] = horario.split(':').map(Number);
    const newHora = new Date();
    newHora.setHours(hours, minutes, 0, 0);
    setHora(newHora);
    setShowTimeList(false);
  };

  const formatarTelefone = (text: string) => {
    // Remove tudo que não for número
    const numeros = text.replace(/\D/g, '');
    
    // Aplica a máscara do WhatsApp
    if (numeros.length <= 2) {
      return `(${numeros}`;
    } else if (numeros.length <= 7) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
    } else if (numeros.length <= 11) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
    } else {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7, 11)}`;
    }
  };

  const handleTelefoneChange = (text: string) => {
    const telefoneFormatado = formatarTelefone(text);
    setTelefone(telefoneFormatado);
  };

  const handleSalvar = async () => {
    if (!nomeCliente.trim() || !telefone.trim() || !servico.trim()) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios');
      return;
    }

    // Verifica se o telefone está no formato correto
    const telefoneNumeros = telefone.replace(/\D/g, '');
    if (telefoneNumeros.length < 10 || telefoneNumeros.length > 11) {
      Alert.alert('Erro', 'Por favor, insira um número de telefone válido');
      return;
    }

    // Formatar a data para evitar problemas de fuso horário
    const dataFormatada = new Date(data.getFullYear(), data.getMonth(), data.getDate());

    const novoAgendamento: Agendamento = {
      id: Date.now().toString(),
      nomeCliente: nomeCliente.trim(),
      telefone: telefone.trim(),
      data: dataFormatada.toISOString(),
      hora: hora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      servico: servico.trim(),
    };

    try {
      await StorageService.saveAgendamento(novoAgendamento);
      setNomeCliente('');
      setTelefone('');
      setServico('');
      setData(new Date());
      setHora(new Date());
      carregarDados();
      Alert.alert('Sucesso', 'Agendamento salvo com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o agendamento');
    }
  };

  const renderItem = ({ item }: { item: Agendamento }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('AgendamentoDetalhe', { agendamento: item })}
    >
      <Card style={styles.cardItem}>
        <Text style={styles.nome}>{item.nomeCliente}</Text>
        <Text style={styles.telefone}>{item.telefone}</Text>
        <Text style={styles.data}>{new Date(item.data).toLocaleDateString()}</Text>
        <Text style={styles.horario}>{item.hora}</Text>
        <Text style={styles.servico}>{item.servico}</Text>
      </Card>
    </TouchableOpacity>
  );

  const renderTimeItem = ({ item }: { item: string }) => {
    const isOcupado = horariosOcupados.includes(item);
    return (
      <TouchableOpacity
        style={[
          styles.timeItem,
          isOcupado && styles.timeItemOcupado,
          hora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) === item && styles.timeItemSelecionado
        ]}
        onPress={() => !isOcupado && handleTimeSelect(item)}
        disabled={isOcupado}
      >
        <Text style={[
          styles.timeItemText,
          isOcupado && styles.timeItemTextOcupado,
          hora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) === item && styles.timeItemTextSelecionado
        ]}>
          {item}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6200ee" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.title}>Novo Agendamento</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.formCard}>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#666666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Nome do Cliente"
              value={nomeCliente}
              onChangeText={setNomeCliente}
              placeholderTextColor="#999999"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="call-outline" size={20} color="#666666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Telefone (WhatsApp)"
              value={telefone}
              onChangeText={handleTelefoneChange}
              keyboardType="numeric"
              maxLength={15}
              placeholderTextColor="#999999"
            />
          </View>

          <View style={styles.dateTimeContainer}>
            <TouchableOpacity 
              style={styles.dateTimeButton}
              onPress={() => setShowCalendar(true)}
            >
              <Ionicons name="calendar-outline" size={20} color="#6200ee" style={styles.dateTimeIcon} />
              <Text style={styles.dateTimeButtonText}>
                {data.toLocaleDateString()}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.dateTimeButton}
              onPress={() => setShowTimeList(true)}
            >
              <Ionicons name="time-outline" size={20} color="#6200ee" style={styles.dateTimeIcon} />
              <Text style={styles.dateTimeButtonText}>
                {hora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="cut-outline" size={20} color="#666666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Serviço"
              value={servico}
              onChangeText={setServico}
              placeholderTextColor="#999999"
            />
          </View>

          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleSalvar}
          >
            <Ionicons name="save-outline" size={20} color="#ffffff" style={styles.saveIcon} />
            <Text style={styles.saveButtonText}>Salvar Agendamento</Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>

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
              current={data.toISOString()}
              onDayPress={handleCalendarDayPress}
              markedDates={{
                ...markedDates,
                [data.toISOString().split('T')[0]]: { 
                  selected: true, 
                  selectedColor: '#6200ee',
                  marked: markedDates[data.toISOString().split('T')[0]]?.marked,
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
        visible={showTimeList}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTimeList(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.timeListContainer}>
            <View style={styles.timeListHeader}>
              <Text style={styles.timeListTitle}>Selecione o Horário</Text>
              <TouchableOpacity 
                style={styles.closeIconButton}
                onPress={() => setShowTimeList(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={HORARIOS_DISPONIVEIS}
              renderItem={renderTimeItem}
              keyExtractor={item => item}
              numColumns={3}
              contentContainerStyle={styles.timeListContent}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>

      {Platform.OS === 'ios' && (
        <>
          {showDatePicker && (
            <DateTimePicker
              value={data}
              mode="date"
              display="spinner"
              onChange={handleDateChange}
            />
          )}
          {showTimePicker && (
            <DateTimePicker
              value={hora}
              mode="time"
              display="spinner"
              onChange={handleTimeChange}
            />
          )}
        </>
      )}
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
    paddingTop: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    elevation: 4,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  formCard: {
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
    height: 50,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333333',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flex: 1,
    marginHorizontal: 4,
  },
  dateTimeIcon: {
    marginRight: 8,
  },
  dateTimeButtonText: {
    color: '#6200ee',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#6200ee',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  saveIcon: {
    marginRight: 8,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
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
  timeListContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  timeListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  timeListContent: {
    paddingBottom: 16,
  },
  timeItem: {
    flex: 1,
    margin: 4,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
    alignItems: 'center',
  },
  timeItemOcupado: {
    backgroundColor: '#f0f0f0',
  },
  timeItemSelecionado: {
    backgroundColor: '#6200ee',
  },
  timeItemText: {
    color: '#6200ee',
    fontSize: 14,
    fontWeight: '500',
  },
  timeItemTextOcupado: {
    color: '#999999',
  },
  timeItemTextSelecionado: {
    color: '#ffffff',
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
  data: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
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
}); 