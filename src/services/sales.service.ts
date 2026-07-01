import { api } from './api';
import { delay } from '@/utils';
import type { SalesMetrics } from '@/types';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

const mockSalesMetrics: SalesMetrics = {
  quantidadeVendas: 48,
  valorTotalVendido: 284500,
  volumeBruto: 312000,
  valorRetido: 198400,
  valorPipeline: 45200,
  valorCancelado: 12300,
  ticketMedio: 5927.08,
  taxaConversao: 24.5,
  taxaRetencao: 63.6,
  pipelineNegocios: 12,
  pipelineValor: 186500,
  funil: [
    { id: '1', label: 'Contatos / Conversas', quantidade: 196, valor: 186500, conversaoPct: 100, tipo: 'topo' },
    { id: '2', label: 'Lead', quantidade: 82, valor: 92000, conversaoPct: 41.8, tipo: 'funil' },
    { id: '3', label: 'Qualificação', quantidade: 54, valor: 68000, conversaoPct: 27.6, tipo: 'funil' },
    { id: '4', label: 'Proposta', quantidade: 38, valor: 52000, conversaoPct: 19.4, tipo: 'funil' },
    { id: '5', label: 'Negociação', quantidade: 29, valor: 41000, conversaoPct: 14.8, tipo: 'funil' },
    { id: '6', label: 'Pedidos em aberto', quantidade: 18, valor: 45200, conversaoPct: 9.2, tipo: 'pedido' },
    { id: '7', label: 'Enviados / em trânsito', quantidade: 12, valor: 86000, conversaoPct: 6.1, tipo: 'pedido' },
    { id: '8', label: 'Entregues (receita retida)', quantidade: 48, valor: 198400, conversaoPct: 24.5, tipo: 'receita' },
  ],
  porStatus: [
    { status: 'delivered', label: 'Entregues', quantidade: 48, valor: 198400 },
    { status: 'shipped', label: 'Enviados', quantidade: 12, valor: 86000 },
    { status: 'processing', label: 'Processando', quantidade: 8, valor: 28400 },
    { status: 'pending', label: 'Pendentes', quantidade: 10, valor: 16800 },
    { status: 'cancelled', label: 'Cancelados', quantidade: 3, valor: 12300 },
  ],
  vendasPorDia: [
    { name: '01/06', vendas: 2, valor: 8400 },
    { name: '05/06', vendas: 4, valor: 15200 },
    { name: '10/06', vendas: 3, valor: 12800 },
    { name: '15/06', vendas: 6, valor: 28400 },
    { name: '20/06', vendas: 5, valor: 22100 },
    { name: '25/06', vendas: 8, valor: 35600 },
  ],
};

export const salesService = {
  getMetrics: async (): Promise<SalesMetrics> => {
    if (USE_MOCK) {
      await delay(500);
      return mockSalesMetrics;
    }
    const { data } = await api.get<SalesMetrics>('/vendas/metricas');
    return data;
  },
};
