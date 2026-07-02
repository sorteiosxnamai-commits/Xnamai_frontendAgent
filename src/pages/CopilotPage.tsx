import { ChatBubble } from '@/components/chat/ChatBubble';
import { MessageInput } from '@/components/chat/MessageInput';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, StatCard } from '@/components/ui/Card';
import { Loading } from '@/components/ui/EmptyState';
import { useAgentStatus, useConversations } from '@/hooks/useQueries';
import { agentService } from '@/services/agent.service';
import type { Conversation, Message } from '@/types';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Bot,
  BarChart3,
  FileText,
  Mic,
  Sparkles,
  Wand2,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Select } from '@/components/ui/Select';
import { useNotification } from '@/contexts/NotificationContext';
import { aiSettingsStore } from '@/store/aiSettingsStore';

function buildQuickTools(conversations: Conversation[]) {
  const first = conversations[0];
  const second = conversations[1];
  const third = conversations[2];

  return [
    {
      icon: FileText,
      title: 'Resumo inteligente',
      desc: 'Resume a conversa ativa com dados reais',
      prompt: first
        ? `Resuma a conversa de ${first.customerName}`
        : 'Resuma a conversa mais recente',
      conversationId: first?.id,
    },
    {
      icon: Mic,
      title: 'Transcrição de áudio',
      desc: 'Analisa a última mensagem do cliente',
      prompt: second
        ? `Transcreva e analise a mensagem de ${second.customerName}`
        : 'Transcreva a última mensagem do cliente',
      conversationId: second?.id ?? first?.id,
    },
    {
      icon: Wand2,
      title: 'Texto mágico',
      desc: 'Gera resposta profissional com contexto real',
      prompt: first
        ? `Gere texto profissional para responder ${first.customerName}`
        : 'Gere texto profissional para o cliente',
      conversationId: first?.id,
    },
    {
      icon: Sparkles,
      title: 'Sugestões',
      desc: 'Sugere respostas com base na conversa',
      prompt: third
        ? `Sugira resposta para ${third.customerName}`
        : 'Sugira resposta para o cliente',
      conversationId: third?.id ?? first?.id,
    },
  ];
}

export function CopilotPage() {
  const { data: status, isLoading: statusLoading } = useAgentStatus();
  const { data: conversations, isLoading: convLoading } = useConversations();
  const { addToast } = useNotification();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      conversationId: 'copilot',
      content:
        'Sou o Copiloto IA Elite do PulseDesk. Resolvo dúvidas sobre preços, estoque, pedidos, prazos, pagamento, garantia, **métricas de venda** e suporte — com dados reais do Mercos e Supabase. Peça orçamentos, resumos, status de pedido, funil de vendas ou mensagens prontas para enviar ao cliente.',
      sender: 'ai',
      timestamp: new Date().toISOString(),
      status: 'read',
    },
  ]);

  const [contextConvId, setContextConvId] = useState<string>('');

  useEffect(() => {
    if (conversations?.[0]?.id && !contextConvId) {
      setContextConvId(conversations[0].id);
    }
  }, [conversations, contextConvId]);

  const contextConv = useMemo(
    () => (conversations ?? []).find((c) => c.id === contextConvId),
    [conversations, contextConvId],
  );

  const quickTools = useMemo(
    () => buildQuickTools(conversations ?? []),
    [conversations],
  );

  const chatMutation = useMutation({
    mutationFn: ({ message, conversationId }: { message: string; conversationId?: string }) => {
      const conv = (conversations ?? []).find((c) => c.id === conversationId);
      return agentService.chat({
        message,
        conversationId,
        customerId: conv?.customerId,
        mode: 'copilot',
        history: messages
          .filter((m) => m.id !== 'welcome')
          .map((m) => ({
            role: (m.sender === 'customer' ? 'user' : 'assistant') as 'user' | 'assistant',
            content: m.content,
          })),
      });
    },
    onSuccess: (response, { message }) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `u-${Date.now()}`,
          conversationId: 'copilot',
          content: message,
          sender: 'customer',
          timestamp: new Date().toISOString(),
          status: 'read',
        },
        {
          id: `a-${Date.now()}`,
          conversationId: 'copilot',
          content: response.reply,
          sender: 'ai',
          timestamp: new Date().toISOString(),
          status: 'read',
          aiSource: response.source,
        },
      ]);
    },
    onError: (err: unknown) => {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        (err as Error)?.message ??
        'Falha ao contactar o Copiloto';
      addToast({ title: 'Copiloto indisponível', message: String(detail), type: 'error' });
    },
  });

  const aiMode = agentService.getAiMode();
  const primaryConv = contextConv ?? conversations?.[0];
  const trackingConv = conversations?.find((c) =>
    c.lastMessage.toLowerCase().match(/pedido|entrega|chega/),
  ) ?? conversations?.[1];

  if (statusLoading || convLoading) return <Loading />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Copiloto IA</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Especialista comercial e de suporte — orçamentos, pedidos, estoque, pagamento, métricas de venda e garantia
        </p>
        <p className="mt-1 text-xs text-gray-400">
          Motor: {status?.openaiEnabled ? status.model : aiMode === 'openai' ? `OpenAI (${aiSettingsStore.get().model})` : `${status?.model ?? 'PulseDesk IA'} — configure OPENAI_API_KEY no Render para respostas GPT`}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Status" value={status?.online ? 'Online' : 'Offline'} icon={Bot} variant={status?.online ? 'success' : 'warning'} />
        <StatCard title="Modelo" value={status?.model ?? '-'} icon={Sparkles} variant="primary" />
        <StatCard title="Tempo médio" value={status?.avgResponseTime ?? '-'} icon={Wand2} />
        <StatCard title="Conversas" value={conversations?.length ?? 0} icon={FileText} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickTools.map(({ icon: Icon, title, desc, prompt, conversationId }) => (
          <div
            key={title}
            className="cursor-pointer"
            role="button"
            tabIndex={0}
            onClick={() => {
              if (!conversationId) {
                addToast({ title: 'Sem conversas', message: 'Abra Atendimento e crie conversas primeiro', type: 'warning' });
                return;
              }
              addToast({ title, message: 'Processando com Copiloto IA...', type: 'info' });
              chatMutation.mutate({ message: prompt, conversationId });
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && conversationId) {
                chatMutation.mutate({ message: prompt, conversationId });
              }
            }}
          >
            <Card className="transition-shadow hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-900/30">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-3 font-semibold text-gray-900 dark:text-white">{title}</h3>
              <p className="mt-1 text-sm text-gray-500">{desc}</p>
            </Card>
          </div>
        ))}
      </div>

      <Card title="Testar Copiloto" subtitle="Converse com a IA usando dados reais da plataforma">
        {conversations && conversations.length > 0 && (
          <div className="mb-4 max-w-md">
            <Select
              label="Contexto da conversa (cliente + histórico real)"
              value={contextConvId}
              onChange={(e) => setContextConvId(e.target.value)}
              options={conversations.map((c) => ({
                value: c.id,
                label: `${c.customerName} (${c.channel})`,
              }))}
            />
          </div>
        )}
        <div className="flex h-[380px] flex-col rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2 dark:border-gray-700">
            <span className="text-sm font-medium">Chat com Copiloto</span>
            <div className="flex items-center gap-2">
              {contextConv && (
                <span className="hidden text-xs text-gray-400 sm:inline">
                  Contexto: {contextConv.customerName}
                </span>
              )}
              <Badge variant={status?.online ? 'success' : 'danger'}>
                {status?.online ? 'IA Ativa' : 'Offline'}
              </Badge>
            </div>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-4 dark:bg-gray-950">
            {messages.map((msg) => (
              <div key={msg.id}>
                <ChatBubble message={msg} />
                {msg.sender === 'ai' && msg.aiSource && msg.id !== 'welcome' && (
                  <p className="mt-0.5 text-right text-[10px] text-gray-400">
                    {msg.aiSource === 'openai' ? 'GPT' : 'Modo local'}
                  </p>
                )}
              </div>
            ))}
            {chatMutation.isPending && <p className="text-sm text-gray-400">Processando...</p>}
          </div>
          <MessageInput
            onSend={(c) => chatMutation.mutate({ message: c, conversationId: contextConvId || primaryConv?.id })}
            disabled={chatMutation.isPending}
            placeholder="Peça métricas de venda, resumo, status de pedido ou sugestão..."
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => chatMutation.mutate({ message: 'Quantas vendas tivemos e qual o valor total vendido?' })}
          >
            <BarChart3 className="mr-1.5 h-4 w-4" />
            Métricas de venda
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              chatMutation.mutate({
                message: 'Quanto passou de dinheiro e quanto retemos na receita?',
              })
            }
          >
            Receita retida
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => chatMutation.mutate({ message: 'Como está o funil de vendas?' })}
          >
            Funil de vendas
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => chatMutation.mutate({ message: 'Liste produtos disponíveis no catálogo' })}
          >
            Catálogo
          </Button>
        </div>
        {primaryConv && (
          <div className="mt-2 flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                chatMutation.mutate({
                  message: `Resuma a conversa de ${primaryConv.customerName}`,
                  conversationId: primaryConv.id,
                })
              }
            >
              Resumo {primaryConv.customerName.split(' ')[0]}
            </Button>
            {trackingConv && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  chatMutation.mutate({
                    message: `Status do pedido de ${trackingConv.customerName}`,
                    conversationId: trackingConv.id,
                  })
                }
              >
                Rastrear pedido
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                chatMutation.mutate({
                  message: 'Qual o tom e urgência desta conversa?',
                  conversationId: primaryConv.id,
                })
              }
            >
              Analisar urgência
            </Button>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
