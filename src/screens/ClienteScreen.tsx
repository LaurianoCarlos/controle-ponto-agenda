import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Card } from '../components/Card';
import { StorageService } from '../services/storage';
import { Cliente } from '../types';
import { useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type ClienteScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Clientes'>;

interface Props {
  navigation: ClienteScreenNavigationProp;
}

export const ClienteScreen: React.FC<Props> = ({ navigation }) => {
  const [clientes, setClientes] = useState<Cliente[]>([]);

  const carregarClientes = async () => {
    const dados = await StorageService.getClientes();
    setClientes(dados);
  };

  useFocusEffect(
    React.useCallback(() => {
      carregarClientes();
    }, [])
  );

  const renderItem = ({ item }: { item: Cliente }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('ClienteDetalhe', { cliente: item })}
    >
      <Card style={styles.cardItem}>
        <Text style={styles.nome}>{item.nome}</Text>
        <Text style={styles.telefone}>{item.telefone}</Text>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Clientes</Text>
      <FlatList
        data={clientes}
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
  telefone: {
    fontSize: 14,
    color: '#666666',
  },
}); 