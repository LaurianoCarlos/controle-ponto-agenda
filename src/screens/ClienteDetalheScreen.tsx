import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card } from '../components/Card';
import { Cliente } from '../types';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type ClienteDetalheScreenRouteProp = RouteProp<RootStackParamList, 'ClienteDetalhe'>;
type ClienteDetalheScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ClienteDetalhe'>;

interface Props {
  route: ClienteDetalheScreenRouteProp;
  navigation: ClienteDetalheScreenNavigationProp;
}

export const ClienteDetalheScreen: React.FC<Props> = ({ route }) => {
  const { cliente } = route.params;

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.title}>Detalhes do Cliente</Text>
        
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Nome:</Text>
          <Text style={styles.value}>{cliente.nome}</Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.label}>Telefone:</Text>
          <Text style={styles.value}>{cliente.telefone}</Text>
        </View>

        {cliente.email && (
          <View style={styles.infoContainer}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{cliente.email}</Text>
          </View>
        )}

        {cliente.endereco && (
          <View style={styles.infoContainer}>
            <Text style={styles.label}>Endereço:</Text>
            <Text style={styles.value}>{cliente.endereco}</Text>
          </View>
        )}

        {cliente.observacoes && (
          <View style={styles.infoContainer}>
            <Text style={styles.label}>Observações:</Text>
            <Text style={styles.value}>{cliente.observacoes}</Text>
          </View>
        )}
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