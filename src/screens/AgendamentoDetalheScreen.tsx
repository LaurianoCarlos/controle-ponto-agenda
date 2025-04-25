import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card } from '../components/Card';
import { Agendamento, Cliente } from '../types';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type AgendamentoDetalheScreenRouteProp = RouteProp<RootStackParamList, 'AgendamentoDetalhe'>;
type AgendamentoDetalheScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AgendamentoDetalhe'>;

interface Props {
  route: AgendamentoDetalheScreenRouteProp;
  navigation: AgendamentoDetalheScreenNavigationProp;
}

export const AgendamentoDetalheScreen: React.FC<Props> = ({ route }) => {
  const { agendamento, cliente } = route.params;

  const formatarData = (data: string, hora: string) => {
    const [ano, mes, dia] = data.split('-').map(Number);
    return new Date(ano, mes - 1, dia).toLocaleDateString('pt-BR') + ' às ' + hora;
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.title}>Detalhes do Agendamento</Text>
        
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Cliente:</Text>
          <Text style={styles.value}>{cliente.nome}</Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.label}>Data e Hora:</Text>
          <Text style={styles.value}>{formatarData(agendamento.data, agendamento.hora)}</Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.label}>Serviço:</Text>
          <Text style={styles.value}>{agendamento.servico}</Text>
        </View>

        {agendamento.observacoes && (
          <View style={styles.infoContainer}>
            <Text style={styles.label}>Observações:</Text>
            <Text style={styles.value}>{agendamento.observacoes}</Text>
          </View>
        )}

        <View style={styles.infoContainer}>
          <Text style={styles.label}>Contato:</Text>
          <Text style={styles.value}>{cliente.telefone}</Text>
          {cliente.email && (
            <Text style={styles.value}>{cliente.email}</Text>
          )}
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#6200ee',
  },
  infoContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#000000',
  },
}); 