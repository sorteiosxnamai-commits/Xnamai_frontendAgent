import { ChatBubble } from '@/components/chat/ChatBubble';
import { MessageInput } from '@/components/chat/MessageInput';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, StatCard } from '@/components/ui/Card';
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

const aiTools = [
  { icon: FileText, title: 'Resumo inteligente', desc: 'Resume conversas longas automaticamente' },
  { icon: Mic, title: 'Transcrição de áudio', desc: 'Converte áudios em texto em tempo real' },
  { icon: Wand2, title: 'Texto mágico', desc: 'Gera respostas com tom de voz da empresa' },
  { icon: Sparkles, title: 'Sugestões', desc: 'Sugere respostas contextuais ao atendente' },
];

export function CopilotPage() {
  const { data: status, isLoading } = useAgentStatus();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      conversationId: 'copilot',
      content: 'Sou o Copiloto IA do PulseDesk. Posso resumir conversas, transcrever áudios e sugerir respostas.',
      sender: 'ai',
      timestamp: new Date().toISOString(),
      status: 'read',
    },
  ]);

  const chatMutation = useMutation({
    mutationFn: (content: string) => agentService.chat({ message: content }),
    onSuccess: (response, content) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `u-${Date.now()}`,
          conversationId: 'copilot',
          content,
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

  if (isLoading) return <Loading />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Copiloto IA</h1>
        <p className="text-gray-500 dark:text-gray-400">
          IA generativa que trabalha junto com seu time — resumos, transcrições e sugestões
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Status" value={status?.online ? 'Online' : 'Offline'} icon={Bot} variant={status?.online ? 'success' : 'warning'} />
        <StatCard title="Modelo" value={status?.model ?? '-'} icon={Sparkles} variant="primary" />
        <StatCard title="Tempo médio" value={status?.avgResponseTime ?? '-'} icon={Wand2} />
        <StatCard title="Interações" value={status?.questionsAnswered ?? 0} icon={FileText} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {aiTools.map(({ icon: Icon, title, desc }) => (
          <Card key={title} className="cursor-pointer transition-shadow hover:shadow-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-900/30">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="mt-3 font-semibold text-gray-900 dark:text-white">{title}</h3>
            <p className="mt-1 text-sm text-gray-500">{desc}</p>
          </Card>
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
            onSend={(c) => chatMutation.mutate(c)}
            disabled={chatMutation.isPending}
            placeholder="Peça um resumo, transcrição ou sugestão..."
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => chatMutation.mutate('Resuma a última conversa do Carlos Mendes')}>
            Resumir conversa
          </Button>
          <Button variant="outline" size="sm" onClick={() => chatMutation.mutate('Sugira resposta para pedido de orçamento')}>
            Sugerir resposta
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
