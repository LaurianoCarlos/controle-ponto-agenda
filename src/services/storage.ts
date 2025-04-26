import AsyncStorage from '@react-native-async-storage/async-storage';
import { Agendamento, Ponto } from '../types';

const STORAGE_KEYS = {
  AGENDAMENTOS: '@app_cachos:agendamentos',
  PONTOS: '@app_cachos:pontos',
};

export const StorageService = {
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

  deleteAgendamento: async (id: string): Promise<void> => {
    try {
      console.log('StorageService: Iniciando exclusão do agendamento', id);
      const agendamentos = await StorageService.getAgendamentos();
      console.log('StorageService: Total de agendamentos antes da exclusão:', agendamentos.length);
      
      const agendamentosFiltrados = agendamentos.filter(a => a.id !== id);
      console.log('StorageService: Total de agendamentos após filtro:', agendamentosFiltrados.length);
      
      if (agendamentos.length === agendamentosFiltrados.length) {
        console.log('StorageService: Nenhum agendamento foi removido, ID não encontrado');
        throw new Error('Agendamento não encontrado');
      }
      
      await AsyncStorage.setItem(STORAGE_KEYS.AGENDAMENTOS, JSON.stringify(agendamentosFiltrados));
      console.log('StorageService: Agendamento excluído com sucesso');
    } catch (error) {
      console.error('StorageService: Erro ao excluir agendamento:', error);
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

  clearAllData: async (): Promise<void> => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.AGENDAMENTOS,
        STORAGE_KEYS.PONTOS,
      ]);
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
      throw error;
    }
  },
}; 