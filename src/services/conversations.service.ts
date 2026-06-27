import { api } from './api';
import { mockConversations, mockMessages } from '@/data/mocks';
import { delay } from '@/utils';
import type { Conversation, Message } from '@/types';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

let messagesStore = { ...mockMessages };

export const conversationsService = {
  getConversations: async (): Promise<Conversation[]> => {
    if (USE_MOCK) {
      await delay(400);
      return mockConversations;
    }
    const { data } = await api.get<Conversation[]>('/conversas');
    return data;
  },

  getMessages: async (conversationId: string): Promise<Message[]> => {
    if (USE_MOCK) {
      await delay(300);
      return messagesStore[conversationId] ?? [];
    }
    const { data } = await api.get<Message[]>(
      `/conversas/${conversationId}/mensagens`,
    );
    return data;
  },

  sendMessage: async (
    conversationId: string,
    content: string,
    sender: 'agent' | 'ai' = 'agent',
  ): Promise<Message> => {
    if (USE_MOCK) {
      await delay(200);
      const message: Message = {
        id: `m-${Date.now()}`,
        conversationId,
        content,
        sender,
        timestamp: new Date().toISOString(),
        status: 'sent',
      };
      messagesStore = {
        ...messagesStore,
        [conversationId]: [...(messagesStore[conversationId] ?? []), message],
      };
      return message;
    }
    const { data } = await api.post<Message>(
      `/conversas/${conversationId}/mensagens`,
      { content, sender },
    );
    return data;
  },
};
