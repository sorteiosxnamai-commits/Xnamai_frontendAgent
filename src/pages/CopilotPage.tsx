import { ChatBubble } from '@/components/chat/ChatBubble';
import { MessageInput } from '@/components/chat/MessageInput';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, StatCard } from '@/components/ui/Card';
import { DemoNotice, PageBetaBadge } from '@/components/ui/DemoNotice';
import { Loading } from '@/components/ui/EmptyState';
import { useAgentStatus } from '@/hooks/useQueries';
import { agentService } from '@/services/agent.service';
import type { Message } from '@/types';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Bot,
  FileText,
  Mic,
  Sparkles,
  Wand2,
} from 'lucide-react';
import { useState } from 'react';
import { useNotification } from '@/contexts/NotificationContext';
import { aiSettingsStore } from '@/store/aiSettingsStore';

const aiTools = [
  { icon: FileText, title: 'Resumo inteligente', desc: 'Resume conversas longas automaticamente', prompt: 'Resuma a conversa do Carlos Mendes', conversationId: 'c1' },
  { icon: Mic, title: 'Transcrição de áudio', desc: 'Converte áudios em texto em tempo real', prompt: 'Transcreva o áudio do Roberto sobre pedido #4521', conversationId: 'c3' },
  { icon: Wand2, title: 'Texto mágico', desc: 'Gera respostas com tom de voz da empresa', prompt: 'Gere texto profissional para orçamento Pro-X500', conversationId: 'c1' },
  { icon: Sparkles, title: 'Sugestões', desc: 'Sugere respostas contextuais ao atendente', prompt: 'Sugira resposta para cliente insatisfeito com prazo', conversationId: 'c3' },
];

function resolveConversationId(message: string): string {
  const norm = message.toLowerCase();
  if (norm.includes('roberto') || norm.includes('4521') || norm.includes('entrega')) return 'c3';
  if (norm.includes('fernanda') || norm.includes('xt-200') || norm.includes('estoque')) return 'c4';
  if (norm.includes('joão') || norm.includes('joao') || norm.includes('visita')) return 'c5';
  if (norm.includes('lucas') || norm.includes('urgente')) return 'c7';
  return 'c1';
}

export function CopilotPage() {
  const { data: status, isLoading } = useAgentStatus();
  const { addToast } = useNotification();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      conversationId: 'copilot',
      content: 'Sou o Copiloto IA do PulseDesk. Conheço clientes, estoque, pedidos e conversas em tempo real. Peça resumos, sugestões de resposta, orçamentos ou transcrições.',
      sender: 'ai',
      timestamp: new Date().toISOString(),
      status: 'read',
    },
  ]);

  const chatMutation = useMutation({
    mutationFn: ({ message, conversationId }: { message: string; conversationId?: string }) =>
      agentService.chat({
        message,
        conversationId: conversationId ?? resolveConversationId(message),
        mode: 'copilot',
        history: messages
          .filter((m) => m.id !== 'welcome')
          .map((m) => ({
            role: (m.sender === 'customer' ? 'user' : 'assistant') as 'user' | 'assistant',
            content: m.content,
          })),
      }),
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
        },
      ]);
    },
  });

  const aiMode = agentService.getAiMode();

  if (isLoading) return <Loading />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
          Copiloto IA <PageBetaBadge />
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          IA generativa que trabalha junto com seu time — resumos, transcrições e sugestões
        </p>
        <p className="mt-1 text-xs text-gray-400">
          Motor: {aiMode === 'openai' ? `OpenAI (${aiSettingsStore.get().model})` : 'IA contextual PulseDesk (dados do app)'}
        </p>
      </div>

      <DemoNotice variant="ai" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Status" value={status?.online ? 'Online' : 'Offline'} icon={Bot} variant={status?.online ? 'success' : 'warning'} />
        <StatCard title="Modelo" value={status?.model ?? '-'} icon={Sparkles} variant="primary" />
        <StatCard title="Tempo médio" value={status?.avgResponseTime ?? '-'} icon={Wand2} />
        <StatCard title="Interações" value={status?.questionsAnswered ?? 0} icon={FileText} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {aiTools.map(({ icon: Icon, title, desc, prompt, conversationId }) => (
          <div
            key={title}
            className="cursor-pointer"
            role="button"
            tabIndex={0}
            onClick={() => {
              addToast({ title: title, message: 'Processando com Copiloto IA...', type: 'info' });
              chatMutation.mutate({ message: prompt, conversationId });
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                addToast({ title: title, message: 'Processando com Copiloto IA...', type: 'info' });
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

      <Card title="Testar Copiloto" subtitle="Converse com a IA generativa integrada">
        <div className="flex h-[380px] flex-col rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2 dark:border-gray-700">
            <span className="text-sm font-medium">Chat com Copiloto</span>
            <Badge variant={status?.online ? 'success' : 'danger'}>
              {status?.online ? 'IA Ativa' : 'Offline'}
            </Badge>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-4 dark:bg-gray-950">
            {messages.map((msg) => (
              <ChatBubble key={msg.id} message={msg} />
            ))}
            {chatMutation.isPending && <p className="text-sm text-gray-400">Processando...</p>}
          </div>
          <MessageInput
            onSend={(c) => chatMutation.mutate({ message: c })}
            disabled={chatMutation.isPending}
            placeholder="Peça um resumo, transcrição ou sugestão..."
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => chatMutation.mutate({ message: 'Resuma a conversa do Carlos Mendes', conversationId: 'c1' })}>
            Orçamento Carlos
          </Button>
          <Button variant="outline" size="sm" onClick={() => chatMutation.mutate({ message: 'Status do pedido #4521 do Roberto', conversationId: 'c3' })}>
            Rastrear pedido
          </Button>
          <Button variant="outline" size="sm" onClick={() => chatMutation.mutate({ message: 'Consultar estoque XT-200', conversationId: 'c4' })}>
            Estoque XT-200
          </Button>
          <Button variant="outline" size="sm" onClick={() => chatMutation.mutate({ message: 'Qual o tom e urgência desta conversa?', conversationId: 'c7' })}>
            Analisar urgência
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
