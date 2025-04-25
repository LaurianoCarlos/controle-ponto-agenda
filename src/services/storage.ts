import AsyncStorage from '@react-native-async-storage/async-storage';
import { Cliente, Agendamento, Ponto } from '../types';

const STORAGE_KEYS = {
  CLIENTES: '@app_cachos:clientes',
  AGENDAMENTOS: '@app_cachos:agendamentos',
  PONTOS: '@app_cachos:pontos',
};

export const StorageService = {
  // Clientes
  getClientes: async (): Promise<Cliente[]> => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CLIENTES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      return [];
    }
  },

  saveCliente: async (cliente: Cliente): Promise<void> => {
    try {
      const clientes = await StorageService.getClientes();
      const index = clientes.findIndex(c => c.id === cliente.id);
      
      if (index >= 0) {
        clientes[index] = cliente;
      } else {
        clientes.push(cliente);
      }
      
      await AsyncStorage.setItem(STORAGE_KEYS.CLIENTES, JSON.stringify(clientes));
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      throw error;
    }
  },

  saveClientes: async (clientes: Cliente[]): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CLIENTES, JSON.stringify(clientes));
    } catch (error) {
      console.error('Erro ao salvar lista de clientes:', error);
      throw error;
    }
  },

  // Agendamentos
  getAgendamentos: async (): Promise<Agendamento[]> => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.AGENDAMENTOS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      return [];
    }
  },

  saveAgendamento: async (agendamento: Agendamento): Promise<void> => {
    try {
      const agendamentos = await StorageService.getAgendamentos();
      const index = agendamentos.findIndex(a => a.id === agendamento.id);
      
      if (index >= 0) {
        agendamentos[index] = agendamento;
      } else {
        agendamentos.push(agendamento);
      }
      
      await AsyncStorage.setItem(STORAGE_KEYS.AGENDAMENTOS, JSON.stringify(agendamentos));
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
      throw error;
    }
  },

  // Pontos
  getPontos: async (): Promise<Ponto[]> => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PONTOS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erro ao carregar pontos:', error);
      return [];
    }
  },

  savePonto: async (ponto: Ponto): Promise<void> => {
    try {
      const pontos = await StorageService.getPontos();
      const index = pontos.findIndex(p => p.data === ponto.data);
      
      if (index >= 0) {
        pontos[index] = ponto;
      } else {
        pontos.push(ponto);
      }
      
      await AsyncStorage.setItem(STORAGE_KEYS.PONTOS, JSON.stringify(pontos));
    } catch (error) {
      console.error('Erro ao salvar ponto:', error);
      throw error;
    }
  },

  deletePonto: async (data: string): Promise<void> => {
    try {
      const pontos = await StorageService.getPontos();
      const pontosAtualizados = pontos.filter(p => p.data !== data);
      await AsyncStorage.setItem(STORAGE_KEYS.PONTOS, JSON.stringify(pontosAtualizados));
    } catch (error) {
      console.error('Erro ao excluir ponto:', error);
      throw error;
    }
  },

  clearAllData: async (): Promise<void> => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.CLIENTES,
        STORAGE_KEYS.AGENDAMENTOS,
        STORAGE_KEYS.PONTOS,
      ]);
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
      throw error;
    }
  },
}; 