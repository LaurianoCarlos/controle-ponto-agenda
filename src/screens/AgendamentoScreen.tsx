import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Card } from '../components/Card';
import { StorageService } from '../services/storage';
import { Agendamento, Cliente } from '../types';
import { useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type AgendamentoScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Agendamentos'>;

interface Props {
  navigation: AgendamentoScreenNavigationProp;
}

export const AgendamentoScreen: React.FC<Props> = ({ navigation }) => {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);

  const carregarDados = async () => {
    const [dadosAgendamentos, dadosClientes] = await Promise.all([
      StorageService.getAgendamentos(),
      StorageService.getClientes()
    ]);
    setAgendamentos(dadosAgendamentos);
    setClientes(dadosClientes);
  };

  useFocusEffect(
    React.useCallback(() => {
      carregarDados();
    }, [])
  );

  const getClienteNome = (clienteId: string) => {
    const cliente = clientes.find(c => c.id === clienteId);
    return cliente ? cliente.nome : 'Cliente não encontrado';
  };

  const renderItem = ({ item }: { item: Agendamento }) => {
    const cliente = clientes.find(c => c.id === item.clienteId);
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('AgendamentoDetalhe', { 
          agendamento: item,
          cliente: cliente!
        })}
      >
        <Card style={styles.cardItem}>
          <Text style={styles.nome}>{getClienteNome(item.clienteId)}</Text>
          <Text style={styles.data}>{new Date(item.data).toLocaleDateString()}</Text>
          <Text style={styles.horario}>{item.hora}</Text>
          <Text style={styles.servico}>{item.servico}</Text>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agendamentos</Text>
      <FlatList
        data={agendamentos}
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
  listContainer: {
    padding: 16,
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