import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking } from 'react-native';
import { Card } from '../components/Card';
import { StorageService } from '../services/storage';
import { Agendamento } from '../types';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

type AgendamentoDetalheScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AgendamentoDetalhe'>;
type AgendamentoDetalheScreenRouteProp = RouteProp<RootStackParamList, 'AgendamentoDetalhe'>;

interface Props {
  navigation: AgendamentoDetalheScreenNavigationProp;
  route: AgendamentoDetalheScreenRouteProp;
}

export const AgendamentoDetalheScreen: React.FC<Props> = ({ navigation, route }) => {
  const { agendamento } = route.params;

  const abrirWhatsApp = (telefone: string) => {
    // Remove todos os caracteres não numéricos do telefone
    const numeroLimpo = telefone.replace(/\D/g, '');
    
    // Adiciona o código do país se não tiver
    const numeroCompleto = numeroLimpo.length <= 11 ? `55${numeroLimpo}` : numeroLimpo;
    
    // Cria o link do WhatsApp
    const url = `https://wa.me/${numeroCompleto}`;
    
    // Abre o WhatsApp
    Linking.openURL(url).catch(err => {
      Alert.alert('Erro', 'Não foi possível abrir o WhatsApp');
    });
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.label}>Nome do Cliente:</Text>
        <Text style={styles.value}>{agendamento.nomeCliente}</Text>

        <Text style={styles.label}>Telefone:</Text>
        <View style={styles.telefoneContainer}>
          <Text style={styles.value}>{agendamento.telefone}</Text>
          <TouchableOpacity 
            style={styles.whatsappButton}
            onPress={() => abrirWhatsApp(agendamento.telefone)}
          >
            <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Data:</Text>
        <Text style={styles.value}>{new Date(agendamento.data).toLocaleDateString()}</Text>

        <Text style={styles.label}>Hora:</Text>
        <Text style={styles.value}>{agendamento.hora}</Text>

        <Text style={styles.label}>Serviço:</Text>
        <Text style={styles.value}>{agendamento.servico}</Text>

        {agendamento.observacoes && (
          <>
            <Text style={styles.label}>Observações:</Text>
            <Text style={styles.value}>{agendamento.observacoes}</Text>
          </>
        )}
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666666',
    marginBottom: 4,
    marginTop: 16,
  },
  value: {
    fontSize: 18,
    color: '#333333',
    marginBottom: 8,
  },
  telefoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  whatsappButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(37, 211, 102, 0.1)',
  },
}); 