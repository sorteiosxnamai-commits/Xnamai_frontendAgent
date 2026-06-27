import { mockProducts } from '@/data/mocks';
import type { AgentContext, AgentMode, ConversationSuggestion } from '@/types';
import { formatCurrency } from '@/utils';

function normalize(text: string) {
  return text.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

function findProductInText(text: string) {
  const norm = normalize(text);
  return mockProducts.find(
    (p) =>
      norm.includes(normalize(p.code)) ||
      norm.includes(normalize(p.name)) ||
      norm.includes(normalize(p.name.split(' ').pop() ?? '')),
  );
}

function extractQuantity(text: string): number | null {
  const match = text.match(/(\d+)\s*(unidades?|un\.?|pcs?|peças?)?/i);
  return match ? parseInt(match[1], 10) : null;
}

function summarizeConversation(ctx: AgentContext): string {
  const msgs = ctx.messages;
  if (!msgs.length && ctx.conversation) {
    return `**Resumo — ${ctx.conversation.customerName}**\n\n• Canal: ${ctx.conversation.channel}\n• Assunto: ${ctx.conversation.lastMessage}\n• Status: ${ctx.conversation.status}\n• ${ctx.customer?.notes ? `Nota: ${ctx.customer.notes}` : 'Sem observações no cadastro.'}`;
  }

  const customerMsgs = msgs.filter((m) => m.sender === 'customer');
  const topics = customerMsgs.map((m) => `• ${m.content}`).join('\n');

  return `**Resumo da conversa${ctx.customer ? ` — ${ctx.customer.name}` : ''}**\n\n**Demandas do cliente:**\n${topics || '• ' + (ctx.lastCustomerMessage ?? 'Sem mensagens')}\n\n**Contexto:** ${ctx.customer?.company ?? 'Empresa não informada'} | ${ctx.customer?.ordersCount ?? 0} pedidos | Total ${formatCurrency(ctx.customer?.totalSpent ?? 0)}\n\n**Recomendação:** Priorize resposta objetiva e proponha próximo passo claro (orçamento, rastreio ou agendamento).`;
}

function suggestReplies(ctx: AgentContext): string {
  const last = ctx.lastCustomerMessage ?? ctx.conversation?.lastMessage ?? '';
  const norm = normalize(last);
  const product = findProductInText(last);
  const qty = extractQuantity(last);

  if (norm.includes('orcamento') || norm.includes('cotacao') || norm.includes('preco')) {
    const p = product ?? mockProducts[0];
    const q = qty ?? 1;
    const total = p.price * q;
    return `**3 sugestões de resposta:**\n\n1️⃣ "Olá${ctx.customer ? `, ${ctx.customer.name.split(' ')[0]}` : ''}! Temos ${p.name} (${p.code}) com ${p.stock} unidades em estoque. Para ${q} unidades, o valor estimado é ${formatCurrency(total)}. Posso formalizar a proposta?"\n\n2️⃣ "Verifiquei o estoque: ${p.stock} unidades disponíveis. Envio a proposta comercial em até 2 horas úteis. Prefere pagamento à vista ou parcelado?"\n\n3️⃣ "Para agilizar, confirme o CNPJ e endereço de entrega. Já reservei as unidades por 48h enquanto preparamos o orçamento."`;
  }

  if (norm.includes('pedido') || norm.includes('entrega') || norm.includes('rastreio') || norm.includes('chega')) {
    const orderNum = last.match(/#?\d{4,}/)?.[0] ?? '#4521';
    return `**3 sugestões de resposta:**\n\n1️⃣ "Consultei o pedido ${orderNum}: status **em trânsito**, previsão de entrega em 2 dias úteis. Enviarei o código de rastreio por aqui."\n\n2️⃣ "Seu pedido ${orderNum} saiu do centro de distribuição ontem. Posso acionar logística para priorizar a entrega."\n\n3️⃣ "Peço desculpas pela demora. Vou escalar para o supervisor de logística e retorno em até 30 minutos com atualização."`;
  }

  if (norm.includes('estoque') || product) {
    const p = product ?? mockProducts.find((x) => x.code === 'XT-200')!;
    return `**3 sugestões de resposta:**\n\n1️⃣ "Sim! Temos ${p.stock} unidades do ${p.name} (${p.code}) disponíveis. Valor unitário: ${formatCurrency(p.price)}. Deseja reservar?"\n\n2️⃣ "O ${p.code} está em estoque. Para pedidos acima de 10 unidades, temos desconto de 8%. Posso enviar tabela?"\n\n3️⃣ "Temos ${p.stock} unidades. Se precisar de quantidade maior, consigo encomenda com prazo de 5 dias úteis."`;
  }

  if (norm.includes('visita') || norm.includes('tecnica') || norm.includes('agendar')) {
    return `**3 sugestões de resposta:**\n\n1️⃣ "Posso agendar visita técnica na próxima semana. Temos disponibilidade terça (14h) ou quinta (10h). Qual prefere?"\n\n2️⃣ "Nossa equipe técnica atende ${ctx.customer?.city ?? 'sua região'}. Informe o endereço e equipamentos para montarmos a visita."\n\n3️⃣ "Visita técnica incluída no plano de suporte anual. Confirma se deseja manutenção preventiva ou instalação?"`;
  }

  if (norm.includes('insatisfeito') || norm.includes('reclam') || norm.includes('atraso') || norm.includes('prazo')) {
    return `**3 sugestões de resposta:**\n\n1️⃣ "Entendo sua frustração e peço desculpas pelo transtorno. Vou resolver pessoalmente e retorno em até 1 hora com uma solução."\n\n2️⃣ "Você tem razão quanto ao prazo. Já acionei a gerência — oferecemos 10% de desconto na próxima compra como compensação."\n\n3️⃣ "Registrei sua reclamação no protocolo ${ctx.conversation?.protocol ?? 'PD-' + Date.now().toString().slice(-4)}. Prioridade máxima no acompanhamento."`;
  }

  return `**3 sugestões de resposta:**\n\n1️⃣ "Olá${ctx.customer ? `, ${ctx.customer.name.split(' ')[0]}` : ''}! Obrigado pelo contato. Como posso ajudá-lo hoje?"\n\n2️⃣ "Recebi sua mensagem e já estou verificando as informações. Retorno em instantes com os detalhes."\n\n3️⃣ "Para agilizar o atendimento, pode confirmar o produto ou pedido que deseja consultar?"`;
}

function handleStockAndQuote(ctx: AgentContext, message: string): string | null {
  const product = findProductInText(message) ?? findProductInText(ctx.lastCustomerMessage ?? '');
  const qty = extractQuantity(message) ?? extractQuantity(ctx.lastCustomerMessage ?? '');

  if (!product) return null;

  const q = qty ?? 1;
  const total = product.price * q;
  const discount = q >= 20 ? 0.08 : q >= 10 ? 0.05 : 0;
  const finalTotal = total * (1 - discount);

  return `Consultei o catálogo:\n\n**${product.name}** (${product.code})\n• Estoque: **${product.stock} unidades**\n• Preço unitário: ${formatCurrency(product.price)}\n• Quantidade solicitada: ${q}\n• Total estimado: ${formatCurrency(finalTotal)}${discount ? ` (desconto ${discount * 100}% aplicado)` : ''}\n\n${product.stock >= q ? '✅ Estoque suficiente — pode reservar e enviar proposta.' : '⚠️ Estoque parcial — sugira encomenda ou entrega fracionada.'}`;
}

function handleOrderTracking(ctx: AgentContext, message: string): string | null {
  const norm = normalize(message);
  if (!norm.includes('pedido') && !norm.includes('entrega') && !norm.includes('rastreio') && !norm.includes('chega')) {
    return null;
  }

  const orderNum = message.match(/#?\d{4,}/)?.[0] ?? ctx.customerDetail?.orders[0]?.number ?? 'TC-2024-001';
  const order = ctx.customerDetail?.orders.find((o) => o.number.includes(orderNum.replace('#', '')));

  return `**Rastreamento — ${orderNum}**\n\n• Cliente: ${ctx.customer?.name ?? 'N/A'}\n• Status: ${order?.status === 'delivered' ? '✅ Entregue' : '🚚 Em trânsito'}\n• Valor: ${formatCurrency(order?.total ?? 4500)}\n• Previsão: ${order?.status === 'delivered' ? 'Entregue em 12/06/2024' : '2 dias úteis'}\n\nSugestão: envie código de rastreio BR${Math.floor(Math.random() * 900000000 + 100000000)}BR e ofereça acompanhamento proativo.`;
}

function handleTranscription(_ctx: AgentContext): string {
  return `**Transcrição simulada do áudio:**\n\n"Olá, boa tarde. Estou ligando sobre o pedido que fiz semana passada. Ainda não recebi confirmação de entrega e preciso urgente das peças para uma instalação na sexta-feira. Podem verificar o status e me retornar ainda hoje?"\n\n**Análise:** Cliente com urgência | Tom: preocupado | Ação: verificar pedido + callback em 30min`;
}

function handleMagicText(ctx: AgentContext): string {
  const company = ctx.customer?.company ?? 'sua empresa';
  return `**Texto sugerido (tom profissional PulseDesk):**\n\nPrezado(a) ${ctx.customer?.name.split(' ')[0] ?? 'cliente'},\n\nAgradecemos o contato e a confiança depositada na ${company}. Analisamos sua solicitação e preparamos a melhor solução para atendê-lo com agilidade.\n\nPermanecemos à disposição para esclarecer qualquer dúvida.\n\nAtenciosamente,\nEquipe PulseDesk · Tironitech`;
}

export function generateIntelligentReply(
  message: string,
  ctx: AgentContext,
  mode: AgentMode = 'copilot',
): string {
  const norm = normalize(message);

  if (norm.includes('resum') || norm.includes('sumari')) {
    return summarizeConversation(ctx);
  }

  if (norm.includes('sugest') || norm.includes('sugira') || norm.includes('resposta')) {
    return suggestReplies(ctx);
  }

  if (norm.includes('transcri') || norm.includes('audio')) {
    return handleTranscription(ctx);
  }

  if (norm.includes('texto magic') || norm.includes('tom de voz') || norm.includes('profissional')) {
    return handleMagicText(ctx);
  }

  const stockReply = handleStockAndQuote(ctx, message);
  if (stockReply) return stockReply;

  const orderReply = handleOrderTracking(ctx, message);
  if (orderReply) return orderReply;

  if (norm.includes('estoque') || norm.includes('produto') || norm.includes('catalogo')) {
    const list = mockProducts
      .slice(0, 5)
      .map((p) => `• **${p.code}** — ${p.name}: ${formatCurrency(p.price)} (${p.stock} un.)`)
      .join('\n');
    return `**Catálogo disponível:**\n\n${list}\n\nPosso detalhar qualquer produto ou montar um orçamento. Qual item você precisa?`;
  }

  if (norm.includes('cliente') && ctx.customer) {
    return `**${ctx.customer.name}** (${ctx.customer.company})\n\n• ${ctx.customer.city}\n• ${ctx.customer.ordersCount} pedidos | ${formatCurrency(ctx.customer.totalSpent)} gastos\n• ${ctx.customer.synced ? 'Sincronizado' : 'Pendente sync'} Mercos\n${ctx.customer.notes ? `• Nota: ${ctx.customer.notes}` : ''}\n\nComo posso ajudar com este cliente?`;
  }

  if (mode === 'agent') {
    if (norm.match(/\b(oi|ola|bom dia|boa tarde|boa noite|hello|hey)\b/)) {
      return `Olá! Sou o agente IA do PulseDesk. Posso consultar produtos, estoque, pedidos e informações de clientes. Em que posso ajudar?`;
    }
    return `Entendi: "${message.slice(0, 80)}${message.length > 80 ? '...' : ''}"\n\n${ctx.customer ? `Contexto: atendimento de **${ctx.customer.name}** via ${ctx.conversation?.channel ?? 'canal'}.` : 'Sem conversa vinculada.'}\n\nPosso ajudar com orçamentos, estoque, rastreio de pedidos ou resumo de conversas. Seja mais específico ou peça "sugira resposta" / "resuma conversa".`;
  }

  return suggestReplies(ctx);
}

export function generateConversationSuggestion(ctx: AgentContext): ConversationSuggestion {
  const last = ctx.lastCustomerMessage ?? ctx.conversation?.lastMessage ?? '';
  const norm = normalize(last);
  const product = findProductInText(last);
  const qty = extractQuantity(last);

  if (norm.includes('orcamento') || norm.includes('cotacao') || (product && qty)) {
    const p = product ?? mockProducts[0];
    const q = qty ?? 50;
    const total = p.price * q * (q >= 20 ? 0.92 : 1);
    return {
      insight: `Cliente solicita orçamento de ${q}x ${p.name}. Estoque: ${p.stock} un. Cliente ${(ctx.customer?.ordersCount ?? 0) > 5 ? 'VIP' : 'recorrente'}.`,
      suggestion: `Olá ${ctx.customer?.name.split(' ')[0] ?? ''}! Confirmamos ${p.stock} unidades do ${p.name} (${p.code}) em estoque. Para ${q} unidades, valor estimado ${formatCurrency(total)}. Envio proposta formal em até 2h. Confirma CNPJ e endereço de entrega?`,
      priority: 'high',
    };
  }

  if (norm.includes('pedido') || norm.includes('entrega') || norm.includes('chega')) {
    return {
      insight: 'Cliente aguarda status de entrega. Risco de insatisfação se demorar.',
      suggestion: `Consultei seu pedido: está em trânsito com previsão de 2 dias úteis. Enviarei o rastreio agora. Posso priorizar a entrega se houver urgência?`,
      priority: 'high',
    };
  }

  if (norm.includes('estoque') || product) {
    const p = product ?? mockProducts[1];
    return {
      insight: `Consulta de estoque: ${p.code} — ${p.stock} unidades disponíveis.`,
      suggestion: `Sim! Temos ${p.stock} unidades do ${p.name} (${p.code}) por ${formatCurrency(p.price)}. Deseja que eu reserve ou envie tabela para volume?`,
      priority: 'medium',
    };
  }

  if (norm.includes('visita') || norm.includes('tecnica')) {
    return {
      insight: 'Solicitação de visita técnica. Cliente industrial com histórico de suporte.',
      suggestion: `Posso agendar visita técnica terça (14h) ou quinta (10h). Informe endereço e equipamentos para enviarmos o técnico adequado.`,
      priority: 'medium',
    };
  }

  if (norm.includes('urgente') || norm.includes('suporte')) {
    return {
      insight: 'Atendimento urgente na fila. Priorizar resposta imediata.',
      suggestion: `Recebi sua solicitação urgente e já estou verificando. Retorno em no máximo 15 minutos com uma solução. Protocolo: ${ctx.conversation?.protocol ?? 'PD-URG'}.`,
      priority: 'high',
    };
  }

  return {
    insight: `Conversa ativa via ${ctx.conversation?.channel ?? 'canal'}. Última mensagem: "${last.slice(0, 60)}..."`,
    suggestion: `Olá ${ctx.customer?.name.split(' ')[0] ?? ''}! Obrigado pelo contato. Analisei sua mensagem e estou preparando a melhor resposta. Posso ajudar com mais algum detalhe?`,
    priority: 'low',
  };
}
