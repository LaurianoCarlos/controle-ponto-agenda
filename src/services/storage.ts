import AsyncStorage from '@react-native-async-storage/async-storage';
import { Cliente, Agendamento, Ponto } from '../types';

const STORAGE_KEYS = {
  CLIENTES: '@app-cachos:clientes',
  AGENDAMENTOS: '@app-cachos:agendamentos',
  PONTOS: '@app-cachos:pontos',
};

export const StorageService = {
  // Clientes
  async getClientes(): Promise<Cliente[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CLIENTES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      return [];
    }
  },

  async saveCliente(cliente: Cliente): Promise<void> {
    try {
      const clientes = await this.getClientes();
      const updatedClientes = [...clientes, cliente];
      await AsyncStorage.setItem(STORAGE_KEYS.CLIENTES, JSON.stringify(updatedClientes));
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      throw error;
    }
  },

  // Agendamentos
  async getAgendamentos(): Promise<Agendamento[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.AGENDAMENTOS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      return [];
    }
  },

  async saveAgendamento(agendamento: Agendamento): Promise<void> {
    try {
      const agendamentos = await this.getAgendamentos();
      const updatedAgendamentos = [...agendamentos, agendamento];
      await AsyncStorage.setItem(STORAGE_KEYS.AGENDAMENTOS, JSON.stringify(updatedAgendamentos));
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
      throw error;
    }
  },

  // Pontos
  async getPontos(): Promise<Ponto[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PONTOS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erro ao buscar pontos:', error);
      return [];
    }
  },

  async savePonto(ponto: Ponto): Promise<void> {
    try {
      const pontos = await this.getPontos();
      const pontoExistente = pontos.findIndex(p => p.data === ponto.data);
      
      if (pontoExistente >= 0) {
        // Atualiza o ponto existente
        pontos[pontoExistente] = ponto;
      } else {
        // Adiciona novo ponto
        pontos.push(ponto);
      }
      
      await AsyncStorage.setItem(STORAGE_KEYS.PONTOS, JSON.stringify(pontos));
    } catch (error) {
      console.error('Erro ao salvar ponto:', error);
      throw error;
    }
  },

  async deletePonto(data: string): Promise<void> {
    try {
      const pontos = await this.getPontos();
      const pontosFiltrados = pontos.filter(p => p.data !== data);
      await AsyncStorage.setItem(STORAGE_KEYS.PONTOS, JSON.stringify(pontosFiltrados));
    } catch (error) {
      console.error('Erro ao deletar ponto:', error);
      throw error;
    }
  },

  async clearAllData(): Promise<void> {
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