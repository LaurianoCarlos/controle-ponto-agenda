import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, Modal, Platform, ScrollView } from 'react-native';
import { Card } from '../components/Card';
import { StorageService } from '../services/storage';
import { Agendamento } from '../types';
import { useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar } from 'react-native-calendars';

type AgendamentoScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Agendamentos'>;

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
      <Text style={styles.title}>Novo Agendamento</Text>
      
      <Card style={styles.formCard}>
        <TextInput
          style={styles.input}
          placeholder="Nome do Cliente"
          value={nomeCliente}
          onChangeText={setNomeCliente}
        />

        <TextInput
          style={styles.input}
          placeholder="Telefone (WhatsApp)"
          value={telefone}
          onChangeText={handleTelefoneChange}
          keyboardType="numeric"
          maxLength={15}
        />

        <TouchableOpacity 
          style={styles.dateButton}
          onPress={() => setShowCalendar(true)}
        >
          <Text style={styles.dateButtonText}>
            Data: {data.toLocaleDateString()}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.dateButton}
          onPress={() => setShowTimeList(true)}
        >
          <Text style={styles.dateButtonText}>
            Hora: {hora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Serviço"
          value={servico}
          onChangeText={setServico}
        />

        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSalvar}
        >
          <Text style={styles.saveButtonText}>Salvar Agendamento</Text>
        </TouchableOpacity>
      </Card>

      <Text style={styles.subtitle}>Agendamentos</Text>
      <FlatList
        data={agendamentos}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={true}
      />

      {Platform.OS === 'ios' && showDatePicker && (
        <DateTimePicker
          value={data}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {Platform.OS === 'ios' && showTimePicker && (
        <DateTimePicker
          value={hora}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}

      {Platform.OS === 'android' && showDatePicker && (
        <DateTimePicker
          value={data}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {Platform.OS === 'android' && showTimePicker && (
        <DateTimePicker
          value={hora}
          mode="time"
          display="default"
          onChange={handleTimeChange}
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
            <Text style={styles.calendarTitle}>Selecione a Data</Text>
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
        visible={showTimeList}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTimeList(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.timeListContainer}>
            <Text style={styles.timeListTitle}>Selecione o Horário</Text>
            <Text style={styles.timeListSubtitle}>
              Horários disponíveis para {data.toLocaleDateString()}
            </Text>
            <FlatList
              data={HORARIOS_DISPONIVEIS}
              renderItem={renderTimeItem}
              keyExtractor={item => item}
              numColumns={2}
              contentContainerStyle={styles.timeListContent}
            />
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowTimeList(false)}
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 16,
  },
  formCard: {
    padding: 16,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  dateButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#6200ee',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
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
  timeListContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  timeListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
    color: '#6200ee',
  },
  timeListSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 15,
    color: '#666666',
  },
  timeListContent: {
    paddingVertical: 10,
  },
  timeItem: {
    flex: 1,
    margin: 5,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  timeItemOcupado: {
    backgroundColor: '#ffebee',
  },
  timeItemSelecionado: {
    backgroundColor: '#6200ee',
  },
  timeItemText: {
    fontSize: 16,
    color: '#333333',
  },
  timeItemTextOcupado: {
    color: '#999999',
    textDecorationLine: 'line-through',
  },
  timeItemTextSelecionado: {
    color: '#ffffff',
  },
}); 