import { api } from './api';
import { mockMercosStatus, mockMercosLogs } from '@/data/mocks';
import { delay } from '@/utils';
import type { MercosStatus, MercosLog } from '@/types';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

export type MercosSyncType = 'products' | 'customers' | 'orders' | 'all';

export const mercosService = {
  getStatus: async (): Promise<MercosStatus> => {
    if (USE_MOCK) {
      await delay(400);
      return mockMercosStatus;
    }
    const { data } = await api.get<MercosStatus>('/mercos/status');
    return data;
  },

  getLogs: async (): Promise<MercosLog[]> => {
    if (USE_MOCK) {
      await delay(300);
      return mockMercosLogs;
    }
    const { data } = await api.get<MercosLog[]>('/mercos/logs');
    return data;
  },

  sync: async (type: MercosSyncType): Promise<{ success: boolean; message: string }> => {
    if (USE_MOCK) {
      await delay(2000);
      const labels: Record<MercosSyncType, string> = {
        products: 'produtos',
        customers: 'clientes',
        orders: 'pedidos',
        all: 'todos os dados',
      };
      return { success: true, message: `Sincronização de ${labels[type]} concluída com sucesso` };
    }
    const { data } = await api.post('/mercos/sincronizar', { type });
    return data;
  },

  testConnection: async (): Promise<{ ok: boolean; message: string; clientes?: number }> => {
    if (USE_MOCK) {
      await delay(800);
      return { ok: false, message: 'Modo mock ativo — configure VITE_USE_MOCK=false e o backend real' };
    }
    const { data } = await api.post<{ ok: boolean; message: string; clientes?: number }>('/mercos/testar-conexao');
    return data;
  },
};
