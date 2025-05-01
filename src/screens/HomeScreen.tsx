import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { Card } from '../components/Card';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const navegarParaRegistroPonto = () => {
    navigation.navigate('PontoStack', { screen: 'Ponto' });
  };

  const navegarParaHistoricoPonto = () => {
    navigation.navigate('PontoStack', { screen: 'HistoricoPonto' });
  };

  const navegarParaAgendamentos = () => {
    navigation.navigate('Agendamentos');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6200ee" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>App Cachos</Text>
        <Text style={styles.headerSubtitle}>Gerencie seus agendamentos e ponto</Text>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="time-outline" size={24} color="#6200ee" />
            <Text style={styles.cardTitle}>Registro de Ponto</Text>
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.button}
              onPress={navegarParaRegistroPonto}
            >
              <View style={styles.buttonIconContainer}>
                <Ionicons name="time" size={24} color="#ffffff" />
              </View>
              <Text style={styles.buttonText}>Registrar Ponto</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.buttonSecondary]}
              onPress={navegarParaHistoricoPonto}
            >
              <View style={[styles.buttonIconContainer, styles.buttonIconContainerSecondary]}>
                <Ionicons name="bar-chart" size={24} color="#6200ee" />
              </View>
              <Text style={styles.buttonTextSecondary}>Histórico</Text>
            </TouchableOpacity>
          </View>
        </Card>

        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="calendar-outline" size={24} color="#6200ee" />
            <Text style={styles.cardTitle}>Agendamentos</Text>
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.button}
              onPress={navegarParaAgendamentos}
            >
              <View style={styles.buttonIconContainer}>
                <Ionicons name="calendar" size={24} color="#ffffff" />
              </View>
              <Text style={styles.buttonText}>Ver Agendamentos</Text>
            </TouchableOpacity>
          </View>
        </Card>

        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="grid-outline" size={24} color="#6200ee" />
            <Text style={styles.cardTitle}>Funcionalidades</Text>
          </View>
          
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#6200ee" />
              <Text style={styles.featureText}>Registro de ponto</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#6200ee" />
              <Text style={styles.featureText}>Histórico de pontos</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#6200ee" />
              <Text style={styles.featureText}>Agendamentos</Text>
            </View>
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
    padding: 24,
    paddingTop: 48,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#333333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
  },
  button: {
    backgroundColor: '#6200ee',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minWidth: 140,
    flexDirection: 'row',
  },
  buttonSecondary: {
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
  },
  buttonIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  buttonIconContainerSecondary: {
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonTextSecondary: {
    color: '#6200ee',
    fontSize: 16,
    fontWeight: 'bold',
  },
  featureList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 16,
    color: '#666666',
    marginLeft: 8,
  },
}); 