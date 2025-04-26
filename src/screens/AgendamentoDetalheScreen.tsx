import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking, ScrollView, StatusBar, Platform } from 'react-native';
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
      <StatusBar barStyle="light-content" backgroundColor="#6200ee" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes do Agendamento</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="person-circle-outline" size={24} color="#6200ee" />
              <Text style={styles.sectionTitle}>Informações do Cliente</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Nome:</Text>
              <Text style={styles.value}>{agendamento.nomeCliente}</Text>
            </View>

            <View style={styles.infoRow}>
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
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="calendar-outline" size={24} color="#6200ee" />
              <Text style={styles.sectionTitle}>Data e Hora</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Data:</Text>
              <Text style={styles.value}>{new Date(agendamento.data).toLocaleDateString()}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Hora:</Text>
              <Text style={styles.value}>{agendamento.hora}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="cut-outline" size={24} color="#6200ee" />
              <Text style={styles.sectionTitle}>Serviço</Text>
            </View>

            <Text style={styles.servicoValue}>{agendamento.servico}</Text>

            {agendamento.observacoes && (
              <View style={styles.observacoesContainer}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="document-text-outline" size={24} color="#6200ee" />
                  <Text style={styles.sectionTitle}>Observações</Text>
                </View>
                <Text style={styles.observacoesText}>{agendamento.observacoes}</Text>
              </View>
            )}
          </View>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#6200ee',
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
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
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginLeft: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    color: '#666666',
    flex: 1,
  },
  value: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  telefoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 2,
  },
  whatsappButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(37, 211, 102, 0.1)',
    marginLeft: 8,
  },
  servicoValue: {
    fontSize: 16,
    color: '#333333',
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  observacoesContainer: {
    marginTop: 16,
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
  },
  observacoesText: {
    fontSize: 16,
    color: '#333333',
    marginTop: 8,
    lineHeight: 22,
  },
}); 