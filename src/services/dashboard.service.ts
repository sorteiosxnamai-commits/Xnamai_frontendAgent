import { api } from './api';
import { mockDashboard } from '@/data/mocks';
import { delay } from '@/utils';
import type { DashboardData } from '@/types';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

export const dashboardService = {
  getDashboard: async (): Promise<DashboardData> => {
    if (USE_MOCK) {
      await delay(600);
      return mockDashboard;
    }
    const { data } = await api.get<DashboardData>('/dashboard');
    return data;
  },
};
