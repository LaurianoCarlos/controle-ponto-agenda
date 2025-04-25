import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { StorageService } from '../services/storage';
import { Cliente } from '../types';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type ClienteScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ClienteCadastro'>;

export const ClienteScreen: React.FC = () => {
  const navigation = useNavigation<ClienteScreenNavigationProp>();
  const [nome, setNome] = useState('');
  const [apelido, setApelido] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [observacoes, setObservacoes] = useState('');

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
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível cadastrar o cliente');
    }
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
}); 