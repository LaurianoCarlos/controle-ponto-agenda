import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Cliente } from '../types';

export const ClientesScreen: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');

  const adicionarCliente = () => {
    if (!nome || !telefone) return;

    const novoCliente: Cliente = {
      id: Date.now().toString(),
      nome,
      telefone,
      email: email || undefined,
    };

    setClientes(prev => [...prev, novoCliente]);
    setNome('');
    setTelefone('');
    setEmail('');
  };

  const renderCliente = ({ item }: { item: Cliente }) => (
    <Card style={styles.clienteCard}>
      <Text style={styles.clienteNome}>{item.nome}</Text>
      <Text style={styles.clienteInfo}>Telefone: {item.telefone}</Text>
      {item.email && (
        <Text style={styles.clienteInfo}>Email: {item.email}</Text>
      )}
    </Card>
  );

  return (
    <View style={styles.container}>
      <Card>
        <Text style={styles.title}>Novo Cliente</Text>
        
        <Input
          label="Nome"
          value={nome}
          onChangeText={setNome}
          placeholder="Digite o nome do cliente"
        />

        <Input
          label="Telefone"
          value={telefone}
          onChangeText={setTelefone}
          placeholder="Digite o telefone"
          keyboardType="phone-pad"
        />

        <Input
          label="Email (opcional)"
          value={email}
          onChangeText={setEmail}
          placeholder="Digite o email"
          keyboardType="email-address"
        />

        <Button
          title="Adicionar Cliente"
          onPress={adicionarCliente}
          disabled={!nome || !telefone}
        />
      </Card>

      <Text style={styles.subtitle}>Clientes Cadastrados</Text>
      
      <FlatList
        data={clientes}
        renderItem={renderCliente}
        keyExtractor={item => item.id}
        style={styles.list}
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 16,
  },
  list: {
    flex: 1,
  },
  clienteCard: {
    marginBottom: 8,
  },
  clienteNome: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  clienteInfo: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
}); 