import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Card } from '../components/Card';
import { StorageService } from '../services/storage';
import { Agendamento } from '../types';
import { useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type AgendamentoListaScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AgendamentoLista'>;

interface Props {
  navigation: AgendamentoListaScreenNavigationProp;
}

export const AgendamentoListaScreen: React.FC<Props> = ({ navigation }) => {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);

  const carregarDados = async () => {
    const dadosAgendamentos = await StorageService.getAgendamentos();
    setAgendamentos(dadosAgendamentos);
  };

  useFocusEffect(
    React.useCallback(() => {
      carregarDados();
    }, [])
  );

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
}); 