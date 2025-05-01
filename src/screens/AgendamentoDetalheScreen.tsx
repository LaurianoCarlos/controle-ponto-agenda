import React from 'react';
import { View, Text, TouchableOpacity, Alert, Linking, ScrollView, StatusBar, Platform } from 'react-native';
import { Card } from '../components/Card';
import { StorageService } from '../services/storage';
import { Agendamento } from '../types';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles/AgendamentoDetalheScreenStyles';

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