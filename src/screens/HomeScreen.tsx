import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Card } from '../components/Card';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const navegarParaRegistroPonto = () => {
    navigation.navigate('PontoStack', { screen: 'Ponto' });
  };

  const navegarParaHistoricoPonto = () => {
    navigation.navigate('PontoStack', { screen: 'HistoricoPonto' });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Bem-vindo ao App Cachos</Text>
      
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Registro de Ponto</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.button}
            onPress={navegarParaRegistroPonto}
          >
            <Text style={styles.buttonIcon}>⏰</Text>
            <Text style={styles.buttonText}>Registrar Ponto</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.button}
            onPress={navegarParaHistoricoPonto}
          >
            <Text style={styles.buttonIcon}>📊</Text>
            <Text style={styles.buttonText}>Histórico de Horas</Text>
          </TouchableOpacity>
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Funcionalidades</Text>
        <View style={styles.featureList}>
          <Text style={styles.featureItem}>• Registro de ponto</Text>
          <Text style={styles.featureItem}>• Histórico de pontos</Text>
          <Text style={styles.featureItem}>• Agendamentos</Text>
        </View>
      </Card>
    </ScrollView>
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
    textAlign: 'center',
    marginVertical: 24,
    color: '#6200ee',
  },
  card: {
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#6200ee',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
  },
  button: {
    backgroundColor: '#6200ee',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minWidth: 140,
  },
  buttonIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  featureList: {
    gap: 8,
  },
  featureItem: {
    fontSize: 16,
    color: '#666666',
  },
}); 