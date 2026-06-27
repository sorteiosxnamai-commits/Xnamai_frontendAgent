import { api } from './api';
import {
  mockChannels,
  mockFunnel,
  mockCampaigns,
  mockChatbots,
  mockIntegrations,
} from '@/data/mocks';
import { delay } from '@/utils';
import type { Channel, FunnelStage, Campaign, ChatbotFlow, Integration } from '@/types';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

export const channelsService = {
  getChannels: async (): Promise<Channel[]> => {
    if (USE_MOCK) {
      await delay(400);
      return mockChannels;
    }
    const { data } = await api.get<Channel[]>('/canais');
    return data;
  },
};

export const funnelService = {
  getFunnel: async (): Promise<FunnelStage[]> => {
    if (USE_MOCK) {
      await delay(400);
      return mockFunnel;
    }
    const { data } = await api.get<FunnelStage[]>('/funil');
    return data;
  },
};

export const campaignsService = {
  getCampaigns: async (): Promise<Campaign[]> => {
    if (USE_MOCK) {
      await delay(400);
      return mockCampaigns;
    }
    const { data } = await api.get<Campaign[]>('/campanhas');
    return data;
  },
};

export const chatbotService = {
  getFlows: async (): Promise<ChatbotFlow[]> => {
    if (USE_MOCK) {
      await delay(400);
      return mockChatbots;
    }
    const { data } = await api.get<ChatbotFlow[]>('/chatbot/fluxos');
    return data;
  },
};

export const integrationsService = {
  getIntegrations: async (): Promise<Integration[]> => {
    if (USE_MOCK) {
      await delay(400);
      return mockIntegrations;
    }
    const { data } = await api.get<Integration[]>('/integracoes');
    return data;
  },
};
