import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Card } from '../components/Card';
import { StorageService } from '../services/storage';
import { Agendamento } from '../types';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { RouteProp } from '@react-navigation/native';

type AgendamentoDetalheScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AgendamentoDetalhe'>;
type AgendamentoDetalheScreenRouteProp = RouteProp<RootStackParamList, 'AgendamentoDetalhe'>;

interface Props {
  navigation: AgendamentoDetalheScreenNavigationProp;
  route: AgendamentoDetalheScreenRouteProp;
}

export const AgendamentoDetalheScreen: React.FC<Props> = ({ navigation, route }) => {
  const { agendamento } = route.params;

  const handleExcluir = async () => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir este agendamento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.deleteAgendamento(agendamento.id);
              Alert.alert('Sucesso', 'Agendamento excluído com sucesso!');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir o agendamento');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.label}>Nome do Cliente:</Text>
        <Text style={styles.value}>{agendamento.nomeCliente}</Text>

        <Text style={styles.label}>Telefone:</Text>
        <Text style={styles.value}>{agendamento.telefone}</Text>

        <Text style={styles.label}>Data:</Text>
        <Text style={styles.value}>{new Date(agendamento.data).toLocaleDateString()}</Text>

        <Text style={styles.label}>Hora:</Text>
        <Text style={styles.value}>{agendamento.hora}</Text>

        <Text style={styles.label}>Serviço:</Text>
        <Text style={styles.value}>{agendamento.servico}</Text>

        {agendamento.observacoes && (
          <>
            <Text style={styles.label}>Observações:</Text>
            <Text style={styles.value}>{agendamento.observacoes}</Text>
          </>
        )}

        <TouchableOpacity 
          style={styles.excluirButton}
          onPress={handleExcluir}
        >
          <Text style={styles.excluirButtonText}>Excluir Agendamento</Text>
        </TouchableOpacity>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  card: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666666',
    marginBottom: 4,
    marginTop: 16,
  },
  value: {
    fontSize: 18,
    color: '#333333',
    marginBottom: 8,
  },
  excluirButton: {
    backgroundColor: '#ff4444',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  excluirButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 