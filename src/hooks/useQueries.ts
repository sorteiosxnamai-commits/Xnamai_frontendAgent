import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard.service';
import { customersService, productsService, ordersService } from '@/services/data.service';
import { mercosService } from '@/services/mercos.service';
import { agentService } from '@/services/agent.service';
import { conversationsService } from '@/services/conversations.service';
import type { ListParams } from '@/types';

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardService.getDashboard,
  });
}

export function useCustomers(params: ListParams = {}) {
  return useQuery({
    queryKey: ['customers', params],
    queryFn: () => customersService.getCustomers(params),
  });
}

export function useCustomerDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: () => customersService.getCustomerDetail(id!),
    enabled: !!id,
  });
}

export function useProducts(params: ListParams = {}) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productsService.getProducts(params),
  });
}

export function useOrders(params: ListParams = {}) {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => ordersService.getOrders(params),
  });
}

export function useMercosStatus() {
  return useQuery({
    queryKey: ['mercos', 'status'],
    queryFn: mercosService.getStatus,
  });
}

export function useMercosLogs() {
  return useQuery({
    queryKey: ['mercos', 'logs'],
    queryFn: mercosService.getLogs,
  });
}

export function useAgentStatus() {
  return useQuery({
    queryKey: ['agent', 'status'],
    queryFn: agentService.getStatus,
  });
}

export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: conversationsService.getConversations,
  });
}

export function useMessages(conversationId: string | null) {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => conversationsService.getMessages(conversationId!),
    enabled: !!conversationId,
  });
}
