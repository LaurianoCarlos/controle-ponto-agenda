import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Agendamento, Cliente } from '../types';

export const AgendaScreen: React.FC = () => {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [clientes] = useState<Cliente[]>([]); // TODO: Integrar com a tela de clientes
  const [servico, setServico] = useState('');
  const [valor, setValor] = useState('');
  const [data, setData] = useState('');
  const [clienteSelecionado, setClienteSelecionado] = useState<string>('');

  const adicionarAgendamento = () => {
    if (!servico || !valor || !data || !clienteSelecionado) return;

    const novoAgendamento: Agendamento = {
      id: Date.now().toString(),
      clienteId: clienteSelecionado,
      data: new Date(data),
      servico,
      valor: Number(valor),
      status: 'agendado',
    };

    setAgendamentos(prev => [...prev, novoAgendamento]);
    setServico('');
    setValor('');
    setData('');
    setClienteSelecionado('');
  };

  const renderAgendamento = ({ item }: { item: Agendamento }) => {
    const cliente = clientes.find(c => c.id === item.clienteId);
    
    return (
      <Card style={styles.agendamentoCard}>
        <Text style={styles.agendamentoCliente}>
          Cliente: {cliente?.nome || 'Cliente não encontrado'}
        </Text>
        <Text style={styles.agendamentoInfo}>
          Serviço: {item.servico}
        </Text>
        <Text style={styles.agendamentoInfo}>
          Valor: R$ {item.valor.toFixed(2)}
        </Text>
        <Text style={styles.agendamentoInfo}>
          Data: {item.data.toLocaleDateString()}
        </Text>
        <Text style={[
          styles.agendamentoStatus,
          { color: item.status === 'agendado' ? '#6200ee' : '#03dac6' }
        ]}>
          Status: {item.status}
        </Text>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <Card>
        <Text style={styles.title}>Novo Agendamento</Text>
        
        <Input
          label="Serviço"
          value={servico}
          onChangeText={setServico}
          placeholder="Digite o serviço"
        />

        <Input
          label="Valor"
          value={valor}
          onChangeText={setValor}
          placeholder="Digite o valor"
          keyboardType="numeric"
        />

        <Input
          label="Data"
          value={data}
          onChangeText={setData}
          placeholder="DD/MM/AAAA"
        />

        <Input
          label="Cliente"
          value={clienteSelecionado}
          onChangeText={setClienteSelecionado}
          placeholder="Selecione o cliente"
        />

        <Button
          title="Adicionar Agendamento"
          onPress={adicionarAgendamento}
          disabled={!servico || !valor || !data || !clienteSelecionado}
        />
      </Card>

      <Text style={styles.subtitle}>Agendamentos</Text>
      
      <FlatList
        data={agendamentos}
        renderItem={renderAgendamento}
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
  agendamentoCard: {
    marginBottom: 8,
  },
  agendamentoCliente: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  agendamentoInfo: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  agendamentoStatus: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
}); 