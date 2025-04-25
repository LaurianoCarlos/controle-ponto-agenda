import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { StorageService } from '../services/storage';
import { Cliente } from '../types';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type ClienteListaScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ClienteLista'>;

export const ClienteListaScreen: React.FC = () => {
  const navigation = useNavigation<ClienteListaScreenNavigationProp>();
  const [clientes, setClientes] = useState<Cliente[]>([]);

  const carregarClientes = async () => {
    try {
      const dados = await StorageService.getClientes();
      setClientes(dados);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os clientes');
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      carregarClientes();
    }, [])
  );

  const handleExcluir = async (id: string) => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir este cliente?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              const clientesAtualizados = clientes.filter(cliente => cliente.id !== id);
              await StorageService.saveClientes(clientesAtualizados);
              carregarClientes();
              Alert.alert('Sucesso', 'Cliente excluído com sucesso!');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir o cliente');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => navigation.navigate('ClienteCadastro')}
      >
        <Text style={styles.addButtonText}>+ Novo Cliente</Text>
      </TouchableOpacity>

      <ScrollView style={styles.list}>
        {clientes.map(cliente => (
          <View key={cliente.id} style={styles.clienteCard}>
            <View style={styles.clienteInfo}>
              <Text style={styles.clienteNome}>{cliente.nome}</Text>
              {cliente.apelido ? (
                <Text style={styles.clienteApelido}>({cliente.apelido})</Text>
              ) : null}
              <Text style={styles.clienteTelefone}>{cliente.telefone}</Text>
              {cliente.email ? (
                <Text style={styles.clienteEmail}>{cliente.email}</Text>
              ) : null}
              {cliente.observacoes ? (
                <Text style={styles.clienteObservacoes}>{cliente.observacoes}</Text>
              ) : null}
            </View>
            <TouchableOpacity
              style={styles.excluirButton}
              onPress={() => handleExcluir(cliente.id)}
            >
              <Text style={styles.excluirButtonText}>Excluir</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  addButton: {
    backgroundColor: '#6200ee',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  list: {
    padding: 16,
  },
  clienteCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clienteInfo: {
    flex: 1,
  },
  clienteNome: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  clienteApelido: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
    fontStyle: 'italic',
  },
  clienteTelefone: {
    fontSize: 16,
    color: '#666',
    marginBottom: 2,
  },
  clienteEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  clienteObservacoes: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  excluirButton: {
    backgroundColor: '#ff4444',
    padding: 8,
    borderRadius: 4,
  },
  excluirButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
}); 