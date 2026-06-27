import {
  mockConversations,
  mockCustomers,
  mockMessages,
  mockProducts,
  getCustomerDetail,
} from '@/data/mocks';
import type { AgentContext, Message } from '@/types';
import { formatCurrency } from '@/utils';

export function buildAiContext(options: {
  conversationId?: string;
  customerId?: string;
  history?: Message[];
}): AgentContext {
  const conversation = options.conversationId
    ? mockConversations.find((c) => c.id === options.conversationId)
    : undefined;

  const customerId = options.customerId ?? conversation?.customerId;
  const customer = customerId
    ? mockCustomers.find((c) => c.id === customerId)
    : undefined;

  const detail = customerId ? getCustomerDetail(customerId) : undefined;

  const storedMessages = options.conversationId
    ? mockMessages[options.conversationId] ?? []
    : [];

  const history = options.history?.length ? options.history : storedMessages;

  const lastCustomerMsg = [...history]
    .reverse()
    .find((m) => m.sender === 'customer')?.content;

  const productsSummary = mockProducts
    .slice(0, 8)
    .map((p) => `${p.code} (${p.name}): ${formatCurrency(p.price)}, estoque ${p.stock}`)
    .join('\n');

  return {
    conversation,
    customer,
    customerDetail: detail,
    messages: history,
    lastCustomerMessage: lastCustomerMsg ?? conversation?.lastMessage,
    productsCatalog: productsSummary,
  };
}

export function contextToPrompt(ctx: AgentContext): string {
  const lines: string[] = [
    'Você é o Copiloto IA do PulseDesk (Tironitech), plataforma de atendimento omnichannel.',
    'Responda sempre em português do Brasil, de forma profissional, objetiva e útil ao atendente.',
    'Use os dados abaixo quando relevante. Se não souber algo, seja honesto.',
  ];

  if (ctx.conversation) {
    lines.push(
      '',
      '## Conversa ativa',
      `- Cliente: ${ctx.conversation.customerName}`,
      `- Canal: ${ctx.conversation.channel}`,
      `- Status: ${ctx.conversation.status}`,
      `- Protocolo: ${ctx.conversation.protocol ?? 'N/A'}`,
      `- Departamento: ${ctx.conversation.department ?? 'N/A'}`,
      `- Última mensagem: ${ctx.conversation.lastMessage}`,
    );
  }

  if (ctx.customer) {
    lines.push(
      '',
      '## Cliente',
      `- Nome: ${ctx.customer.name}`,
      `- Empresa: ${ctx.customer.company}`,
      `- Cidade: ${ctx.customer.city}`,
      `- Pedidos: ${ctx.customer.ordersCount} | Total: ${formatCurrency(ctx.customer.totalSpent)}`,
      ctx.customer.notes ? `- Observações: ${ctx.customer.notes}` : '',
    );
  }

  if (ctx.customerDetail?.orders.length) {
    lines.push('', '## Pedidos recentes');
    ctx.customerDetail.orders.forEach((o) => {
      lines.push(`- ${o.number}: ${o.status}, ${formatCurrency(o.total)}, ${o.items} itens`);
    });
  }

  if (ctx.messages.length) {
    lines.push('', '## Histórico recente');
    ctx.messages.slice(-8).forEach((m) => {
      const who = m.sender === 'customer' ? 'Cliente' : m.sender === 'ai' ? 'IA' : 'Atendente';
      lines.push(`${who}: ${m.content}`);
    });
  }

  lines.push('', '## Catálogo (amostra)', ctx.productsCatalog);

  return lines.filter(Boolean).join('\n');
}
