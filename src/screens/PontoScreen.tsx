import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ScrollView, Modal, StatusBar, Platform } from 'react-native';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { StorageService } from '../services/storage';
import { Ponto } from '../types';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles/PontoScreenStyles';

type PontoScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Ponto'>;

export const PontoScreen: React.FC = () => {
  const navigation = useNavigation<PontoScreenNavigationProp>();
  const [registroPonto, setRegistroPonto] = useState<{
    entrada?: Date;
    saida?: Date;
    entradaAlmoco?: Date;
    saidaAlmoco?: Date;
  }>({});

  const [registroTemporario, setRegistroTemporario] = useState<{
    entrada?: Date;
    saida?: Date;
    entradaAlmoco?: Date;
    saidaAlmoco?: Date;
  }>({});

  const [dataSelecionada, setDataSelecionada] = useState<Date>(new Date());
  const [mostrarSeletorData, setMostrarSeletorData] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [tipoRegistro, setTipoRegistro] = useState<string>('');
  const [horarioRegistro, setHorarioRegistro] = useState<Date | null>(null);
  const [modalConfirmacaoVisible, setModalConfirmacaoVisible] = useState<boolean>(false);
  const [acaoConfirmacao, setAcaoConfirmacao] = useState<'confirmar' | 'cancelar'>('confirmar');

  const formatarDataParaString = (data: Date): string => {
    return data.toISOString().split('T')[0]; // Converte para YYYY-MM-DD
  };

  const formatarDataParaExibicao = (data: Date): string => {
    return data.toLocaleDateString('pt-BR');
  };

  const verificarRegistroExistente = async () => {
    const dataFormatada = formatarDataParaString(dataSelecionada);
    const pontoExistente = await StorageService.getPontoByData(dataFormatada);

    if (pontoExistente) {
      setRegistroPonto({
        entrada: new Date(pontoExistente.entrada),
        saida: pontoExistente.saida ? new Date(pontoExistente.saida) : undefined,
        entradaAlmoco: pontoExistente.entradaAlmoco ? new Date(pontoExistente.entradaAlmoco) : undefined,
        saidaAlmoco: pontoExistente.saidaAlmoco ? new Date(pontoExistente.saidaAlmoco) : undefined,
      });
      setRegistroTemporario({
        entrada: new Date(pontoExistente.entrada),
        saida: pontoExistente.saida ? new Date(pontoExistente.saida) : undefined,
        entradaAlmoco: pontoExistente.entradaAlmoco ? new Date(pontoExistente.entradaAlmoco) : undefined,
        saidaAlmoco: pontoExistente.saidaAlmoco ? new Date(pontoExistente.saidaAlmoco) : undefined,
      });
    } else {
      setRegistroPonto({});
      setRegistroTemporario({});
    }
  };

  // Verifica registros existentes quando a tela recebe foco
  useFocusEffect(
    React.useCallback(() => {
      verificarRegistroExistente();
    }, [dataSelecionada])
  );

  const onDataChange = (event: any, data?: Date) => {
    setMostrarSeletorData(false);
    if (data) {
      setDataSelecionada(data);
    }
  };

  const mostrarModalConfirmacao = (tipo: string, horario: Date) => {
    setTipoRegistro(tipo);
    setHorarioRegistro(horario);
    setModalVisible(true);
  };

  const confirmarRegistroModal = async () => {
    setModalVisible(false);
    if (!horarioRegistro) return;

    const dataFormatada = formatarDataParaString(dataSelecionada);
    let updateData: Partial<Ponto> = {};

    switch (tipoRegistro) {
      case 'entrada':
        updateData = { entrada: horarioRegistro };
        setRegistroTemporario(prev => ({
          ...prev,
          entrada: horarioRegistro,
        }));
        break;
      case 'saidaAlmoco':
        updateData = { entradaAlmoco: horarioRegistro };
        setRegistroTemporario(prev => ({
          ...prev,
          entradaAlmoco: horarioRegistro,
        }));
        break;
      case 'voltaAlmoco':
        updateData = { saidaAlmoco: horarioRegistro };
        setRegistroTemporario(prev => ({
          ...prev,
          saidaAlmoco: horarioRegistro,
        }));
        break;
      case 'saida':
        updateData = { saida: horarioRegistro };
        setRegistroTemporario(prev => ({
          ...prev,
          saida: horarioRegistro,
        }));
        break;
    }

    try {
      await StorageService.updatePonto(dataFormatada, updateData);
      setRegistroPonto(prev => ({
        ...prev,
        ...updateData
      }));
    } catch (error) {
      console.error('Erro ao salvar registro:', error);
      Alert.alert('Erro', 'Não foi possível salvar o registro');
    }
  };

  const registrarEntrada = () => {
    if (!registroTemporario.entrada) {
      mostrarModalConfirmacao('entrada', new Date());
    }
  };

  const registrarSaidaAlmoco = () => {
    if (!registroTemporario.entrada) {
      Alert.alert('Erro', 'É necessário registrar a entrada primeiro.');
      return;
    }
    if (!registroTemporario.entradaAlmoco) {
      mostrarModalConfirmacao('saidaAlmoco', new Date());
    }
  };

  const registrarVoltaAlmoco = () => {
    if (!registroTemporario.entradaAlmoco) {
      Alert.alert('Erro', 'É necessário registrar a saída para almoço primeiro.');
      return;
    }
    if (!registroTemporario.saidaAlmoco) {
      mostrarModalConfirmacao('voltaAlmoco', new Date());
    }
  };

  const registrarSaida = () => {
    if (!registroTemporario.saidaAlmoco) {
      Alert.alert('Erro', 'É necessário registrar a volta do almoço primeiro.');
      return;
    }
    if (!registroTemporario.saida) {
      mostrarModalConfirmacao('saida', new Date());
    }
  };

  const cancelarRegistro = () => {
    setRegistroTemporario({});
    Alert.alert('Aviso', 'Registro cancelado.');
  };

  const confirmarRegistro = async () => {
    if (!registroTemporario.entrada) {
      Alert.alert('Erro', 'É necessário registrar a entrada primeiro.');
      return;
    }

    if (!registroTemporario.entradaAlmoco) {
      Alert.alert('Erro', 'É necessário registrar a saída para almoço.');
      return;
    }

    if (!registroTemporario.saidaAlmoco) {
      Alert.alert('Erro', 'É necessário registrar a volta do almoço.');
      return;
    }

    if (!registroTemporario.saida) {
      Alert.alert('Erro', 'É necessário registrar a saída.');
      return;
    }

    const dataFormatada = formatarDataParaString(dataSelecionada);

    const novoPonto: Ponto = {
      id: Date.now().toString(),
      data: dataFormatada,
      entrada: registroTemporario.entrada,
      saida: registroTemporario.saida,
      entradaAlmoco: registroTemporario.entradaAlmoco,
      saidaAlmoco: registroTemporario.saidaAlmoco,
    };

    await StorageService.savePonto(novoPonto);
    setRegistroPonto(registroTemporario);
    setRegistroTemporario({});
    Alert.alert('Sucesso', 'Registro de ponto salvo com sucesso!');
  };

  const todosCamposPreenchidos = () => {
    return (
      registroTemporario.entrada &&
      registroTemporario.entradaAlmoco &&
      registroTemporario.saidaAlmoco &&
      registroTemporario.saida
    );
  };

  const mostrarModalConfirmacaoFinal = (acao: 'confirmar' | 'cancelar') => {
    setAcaoConfirmacao(acao);
    setModalConfirmacaoVisible(true);
  };

  const confirmarAcaoFinal = () => {
    setModalConfirmacaoVisible(false);
    if (acaoConfirmacao === 'confirmar') {
      confirmarRegistro();
    } else {
      cancelarRegistro();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4A90E2" />
      
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Registrar Ponto</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={[styles.headerButton, styles.historicoButton]}
              onPress={() => navigation.navigate('HistoricoPonto')}
            >
              <Ionicons name="time-outline" size={20} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.headerButtonText}>Histórico</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <Card style={styles.card}>
          <View style={styles.dateSection}>
            <View style={styles.dateHeader}>
              <Ionicons name="calendar" size={24} color="#4A90E2" />
              <Text style={styles.dateTitle}>Data do Registro</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.dateSelector}
              onPress={() => setMostrarSeletorData(true)}
            >
              <Text style={styles.dateText}>
                {formatarDataParaExibicao(dataSelecionada)}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>

            {mostrarSeletorData && (
              <DateTimePicker
                value={dataSelecionada}
                mode="date"
                display="default"
                onChange={onDataChange}
              />
            )}
          </View>

          <View style={styles.recordsSection}>
            <View style={styles.recordCard}>
              <View style={styles.recordHeader}>
                <Ionicons name="log-in" size={24} color="#4CAF50" />
                <Text style={styles.recordTitle}>Entrada</Text>
              </View>
              <Text style={styles.recordTime}>
                {registroTemporario.entrada
                  ? registroTemporario.entrada.toLocaleTimeString()
                  : registroPonto.entrada
                  ? registroPonto.entrada.toLocaleTimeString()
                  : '--:--'}
              </Text>
              <TouchableOpacity 
                style={[styles.recordButton, !registroTemporario.entrada && styles.recordButtonActive]}
                onPress={registrarEntrada}
              >
                <Text style={styles.recordButtonText}>
                  {registroTemporario.entrada ? 'Alterar' : 'Registrar'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.recordCard}>
              <View style={styles.recordHeader}>
                <Ionicons name="restaurant" size={24} color="#FF9800" />
                <Text style={styles.recordTitle}>Saída para Almoço</Text>
              </View>
              <Text style={styles.recordTime}>
                {registroTemporario.entradaAlmoco
                  ? registroTemporario.entradaAlmoco.toLocaleTimeString()
                  : registroPonto.entradaAlmoco
                  ? registroPonto.entradaAlmoco.toLocaleTimeString()
                  : '--:--'}
              </Text>
              <TouchableOpacity 
                style={[styles.recordButton, !registroTemporario.entradaAlmoco && styles.recordButtonActive]}
                onPress={registrarSaidaAlmoco}
              >
                <Text style={styles.recordButtonText}>
                  {registroTemporario.entradaAlmoco ? 'Alterar' : 'Registrar'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.recordCard}>
              <View style={styles.recordHeader}>
                <Ionicons name="return-up-back" size={24} color="#FF9800" />
                <Text style={styles.recordTitle}>Volta do Almoço</Text>
              </View>
              <Text style={styles.recordTime}>
                {registroTemporario.saidaAlmoco
                  ? registroTemporario.saidaAlmoco.toLocaleTimeString()
                  : registroPonto.saidaAlmoco
                  ? registroPonto.saidaAlmoco.toLocaleTimeString()
                  : '--:--'}
              </Text>
              <TouchableOpacity 
                style={[styles.recordButton, !registroTemporario.saidaAlmoco && styles.recordButtonActive]}
                onPress={registrarVoltaAlmoco}
              >
                <Text style={styles.recordButtonText}>
                  {registroTemporario.saidaAlmoco ? 'Alterar' : 'Registrar'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.recordCard}>
              <View style={styles.recordHeader}>
                <Ionicons name="log-out" size={24} color="#F44336" />
                <Text style={styles.recordTitle}>Saída</Text>
              </View>
              <Text style={styles.recordTime}>
                {registroTemporario.saida
                  ? registroTemporario.saida.toLocaleTimeString()
                  : registroPonto.saida
                  ? registroPonto.saida.toLocaleTimeString()
                  : '--:--'}
              </Text>
              <TouchableOpacity 
                style={[styles.recordButton, !registroTemporario.saida && styles.recordButtonActive]}
                onPress={registrarSaida}
              >
                <Text style={styles.recordButtonText}>
                  {registroTemporario.saida ? 'Alterar' : 'Registrar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.confirmButton]}
              onPress={() => mostrarModalConfirmacaoFinal('confirmar')}
            >
              <Text style={styles.actionButtonText}>Confirmar Registro</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => mostrarModalConfirmacaoFinal('cancelar')}
            >
              <Text style={styles.actionButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </Card>
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirmar Horário</Text>
            <Text style={styles.modalText}>
              Deseja registrar o horário atual?
            </Text>
            <Text style={styles.modalTime}>
              {horarioRegistro?.toLocaleTimeString()}
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalConfirmButton]}
                onPress={confirmarRegistroModal}
              >
                <Text style={styles.modalButtonText}>Confirmar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={modalConfirmacaoVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalConfirmacaoVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {acaoConfirmacao === 'confirmar' ? 'Confirmar Registro' : 'Cancelar Registro'}
            </Text>
            <Text style={styles.modalText}>
              {acaoConfirmacao === 'confirmar'
                ? 'Deseja confirmar o registro de ponto?'
                : 'Deseja cancelar o registro de ponto?'}
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalConfirmButton]}
                onPress={confirmarAcaoFinal}
              >
                <Text style={styles.modalButtonText}>Sim</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setModalConfirmacaoVisible(false)}
              >
                <Text style={styles.modalButtonText}>Não</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}; 