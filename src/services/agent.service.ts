import { api } from './api';
import { mockAgentStatus } from '@/data/mocks';
import { delay } from '@/utils';
import type { AgentStatus, AgentChatRequest, AgentChatResponse } from '@/types';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

export const agentService = {
  getStatus: async (): Promise<AgentStatus> => {
    if (USE_MOCK) {
      await delay(400);
      return mockAgentStatus;
    }
    const { data } = await api.get<AgentStatus>('/agent/status');
    return data;
  },

  chat: async (payload: AgentChatRequest): Promise<AgentChatResponse> => {
    if (USE_MOCK) {
      await delay(1500);
      const responses = [
        'Posso ajudar com informações sobre produtos, pedidos e clientes.',
        'Com base nos dados disponíveis, recomendo verificar o estoque do item solicitado.',
        'Entendi sua solicitação. Vou analisar as opções disponíveis para você.',
        'O cliente possui 3 pedidos recentes. Deseja que eu detalhe algum deles?',
      ];
      const reply = responses[Math.floor(Math.random() * responses.length)];
      return {
        reply,
        conversationId: payload.conversationId ?? `conv-${Date.now()}`,
      };
    }
    const { data } = await api.post<AgentChatResponse>('/agent/chat', payload);
    return data;
  },
};
