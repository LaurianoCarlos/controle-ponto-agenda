import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, ScrollView, Modal } from 'react-native';
import { Card } from '../components/Card';
import { StorageService } from '../services/storage';
import { Ponto } from '../types';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles/PontoScreenStyles';

type PontoEdicaoScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PontoEdicao'>;
type PontoEdicaoScreenRouteProp = RouteProp<RootStackParamList, 'PontoEdicao'>;

export const PontoEdicaoScreen: React.FC = () => {
  const navigation = useNavigation<PontoEdicaoScreenNavigationProp>();
  const route = useRoute<PontoEdicaoScreenRouteProp>();
  const { ponto } = route.params;

  const [pontoEditado, setPontoEditado] = useState<Ponto>({
    ...ponto,
    entrada: new Date(ponto.entrada),
    saida: ponto.saida ? new Date(ponto.saida) : undefined,
    entradaAlmoco: ponto.entradaAlmoco ? new Date(ponto.entradaAlmoco) : undefined,
    saidaAlmoco: ponto.saidaAlmoco ? new Date(ponto.saidaAlmoco) : undefined,
  });

  const [modalHoraVisible, setModalHoraVisible] = useState<boolean>(false);
  const [tipoHoraSelecionada, setTipoHoraSelecionada] = useState<'entrada' | 'saida' | 'entradaAlmoco' | 'saidaAlmoco' | null>(null);
  const [horaTemporaria, setHoraTemporaria] = useState<Date | null>(null);

  const formatarData = (data: string) => {
    const [ano, mes, dia] = data.split('-').map(Number);
    return new Date(ano, mes - 1, dia).toLocaleDateString('pt-BR');
  };

  const formatarHora = (data: Date) => {
    return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const abrirModalHora = (tipo: 'entrada' | 'saida' | 'entradaAlmoco' | 'saidaAlmoco') => {
    setTipoHoraSelecionada(tipo);
    setHoraTemporaria(pontoEditado[tipo] || new Date());
    setModalHoraVisible(true);
  };

  const onHoraChange = (event: any, horaSelecionada?: Date) => {
    if (horaSelecionada) {
      setHoraTemporaria(horaSelecionada);
    }
  };

  const confirmarHora = () => {
    if (horaTemporaria && tipoHoraSelecionada) {
      const novaData = new Date(pontoEditado[tipoHoraSelecionada] || new Date());
      novaData.setHours(horaTemporaria.getHours());
      novaData.setMinutes(horaTemporaria.getMinutes());
      
      setPontoEditado({
        ...pontoEditado,
        [tipoHoraSelecionada]: novaData,
      });
    }
    setModalHoraVisible(false);
  };

  const cancelarHora = () => {
    setModalHoraVisible(false);
  };

  const salvarEdicao = async () => {
    try {
      await StorageService.savePonto(pontoEditado);
      Alert.alert('Sucesso', 'Registro atualizado com sucesso!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar o registro.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Editar Ponto</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      <ScrollView style={styles.content}>
        <Card style={styles.card}>
          <View style={styles.dateSection}>
            <View style={styles.dateHeader}>
              <Ionicons name="calendar" size={24} color="#00BCD4" />
              <Text style={styles.dateTitle}>{formatarData(pontoEditado.data)}</Text>
            </View>

            <View style={styles.horaEditContainer}>
              <Text style={styles.horaLabel}>Entrada:</Text>
              <TouchableOpacity
                style={styles.horaButton}
                onPress={() => abrirModalHora('entrada')}
              >
                <Text style={styles.horaText}>
                  {pontoEditado.entrada ? formatarHora(pontoEditado.entrada) : '--:--'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.horaEditContainer}>
              <Text style={styles.horaLabel}>Saída Almoço:</Text>
              <TouchableOpacity
                style={styles.horaButton}
                onPress={() => abrirModalHora('entradaAlmoco')}
              >
                <Text style={styles.horaText}>
                  {pontoEditado.entradaAlmoco ? formatarHora(pontoEditado.entradaAlmoco) : '--:--'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.horaEditContainer}>
              <Text style={styles.horaLabel}>Volta Almoço:</Text>
              <TouchableOpacity
                style={styles.horaButton}
                onPress={() => abrirModalHora('saidaAlmoco')}
              >
                <Text style={styles.horaText}>
                  {pontoEditado.saidaAlmoco ? formatarHora(pontoEditado.saidaAlmoco) : '--:--'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.horaEditContainer}>
              <Text style={styles.horaLabel}>Saída:</Text>
              <TouchableOpacity
                style={styles.horaButton}
                onPress={() => abrirModalHora('saida')}
              >
                <Text style={styles.horaText}>
                  {pontoEditado.saida ? formatarHora(pontoEditado.saida) : '--:--'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Card>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.actionButtonText}>Cancelar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.confirmButton]}
            onPress={salvarEdicao}
          >
            <Text style={styles.actionButtonText}>Salvar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={modalHoraVisible}
        transparent
        animationType="fade"
        onRequestClose={cancelarHora}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="time" size={32} color="#00BCD4" />
              <Text style={styles.modalTitle}>Selecionar Horário</Text>
            </View>

            <View style={styles.timePickerContainer}>
              <DateTimePicker
                value={horaTemporaria || new Date()}
                mode="time"
                is24Hour={true}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onHoraChange}
                style={styles.timePicker}
                textColor="#333333"
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={cancelarHora}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.modalConfirmButton]}
                onPress={confirmarHora}
              >
                <Text style={styles.modalButtonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}; 