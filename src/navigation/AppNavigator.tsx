import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeScreen } from '../screens/HomeScreen';
import { AgendamentoScreen } from '../screens/AgendamentoScreen';
import { AgendamentoDetalheScreen } from '../screens/AgendamentoDetalheScreen';
import { AgendamentoListaScreen } from '../screens/AgendamentoListaScreen';
import { PontoScreen } from '../screens/PontoScreen';
import { PontoHistoricoScreen } from '../screens/PontoHistoricoScreen';
import { Agendamento } from '../types';

// Definição dos tipos para navegação
export type RootStackParamList = {
  Home: undefined;
  Agendamentos: undefined;
  AgendamentoDetalhe: { agendamento: Agendamento };
  AgendamentoLista: undefined;
  PontoStack: { screen: string };
  Ponto: undefined;
  HistoricoPonto: undefined;
  NovoAgendamento: undefined;
};

const Tab = createBottomTabNavigator<RootStackParamList>();
const Stack = createStackNavigator<RootStackParamList>();

const AgendamentoStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen 
      name="AgendamentoLista" 
      component={AgendamentoListaScreen}
      options={{ title: 'Agendamentos' }}
    />
    <Stack.Screen 
      name="NovoAgendamento" 
      component={AgendamentoScreen}
      options={{ title: 'Novo Agendamento' }}
    />
    <Stack.Screen 
      name="AgendamentoDetalhe" 
      component={AgendamentoDetalheScreen}
      options={{ title: 'Detalhes do Agendamento' }}
    />
  </Stack.Navigator>
);

const PontoStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen 
      name="Ponto" 
      component={PontoScreen}
      options={{ title: 'Registrar Ponto' }}
    />
    <Stack.Screen 
      name="HistoricoPonto" 
      component={PontoHistoricoScreen}
      options={{ title: 'Histórico de Pontos' }}
    />
  </Stack.Navigator>
);

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#6200ee',
          tabBarInactiveTintColor: '#666666',
          tabBarStyle: {
            paddingBottom: 5,
            paddingTop: 5,
          },
          headerShown: false,
        }}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeScreen}
          options={{
            tabBarLabel: 'Início',
            tabBarIcon: ({ color }) => (
              <Text style={{ fontSize: 24, color }}>🏠</Text>
            ),
          }}
        />
        <Tab.Screen 
          name="Agendamentos" 
          component={AgendamentoStack}
          options={{
            tabBarLabel: 'Agenda',
            tabBarIcon: ({ color }) => (
              <Text style={{ fontSize: 24, color }}>📅</Text>
            ),
          }}
        />
        <Tab.Screen 
          name="PontoStack" 
          component={PontoStack}
          options={{
            tabBarLabel: 'Ponto',
            tabBarIcon: ({ color }) => (
              <Text style={{ fontSize: 24, color }}>⏰</Text>
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}; 