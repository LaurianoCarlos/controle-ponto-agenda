import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { StorageService } from '../services/storage';
import { Cliente } from '../types';
import { useFocusEffect } from '@react-navigation/native';

export const ClienteScreen: React.FC = () => {
  const [nome, setNome] = useState('');
  const [apelido, setApelido] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [observacoes, setObservacoes] = useState('');
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

  const handleCadastrar = async () => {
    if (!nome.trim() || !telefone.trim()) {
      Alert.alert('Erro', 'Nome e telefone são obrigatórios');
      return;
    }

    try {
      const novoCliente: Cliente = {
        id: Date.now().toString(),
        nome: nome.trim(),
        apelido: apelido.trim(),
        telefone: telefone.trim(),
        email: email.trim(),
        observacoes: observacoes.trim(),
      };

      await StorageService.saveCliente(novoCliente);
      Alert.alert('Sucesso', 'Cliente cadastrado com sucesso!');
      
      // Limpar campos
      setNome('');
      setApelido('');
      setTelefone('');
      setEmail('');
      setObservacoes('');
      
      // Recarregar lista
      carregarClientes();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível cadastrar o cliente');
    }
  };

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
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Nome *</Text>
        <TextInput
          style={styles.input}
          value={nome}
          onChangeText={setNome}
          placeholder="Digite o nome do cliente"
        />

        <Text style={styles.label}>Apelido</Text>
        <TextInput
          style={styles.input}
          value={apelido}
          onChangeText={setApelido}
          placeholder="Digite o apelido do cliente"
        />

        <Text style={styles.label}>Telefone *</Text>
        <TextInput
          style={styles.input}
          value={telefone}
          onChangeText={setTelefone}
          placeholder="Digite o telefone"
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Digite o email"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Observações</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={observacoes}
          onChangeText={setObservacoes}
          placeholder="Digite observações"
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity style={styles.button} onPress={handleCadastrar}>
          <Text style={styles.buttonText}>Cadastrar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.list}>
        <Text style={styles.sectionTitle}>Clientes Cadastrados</Text>
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
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  form: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#6200ee',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  list: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
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