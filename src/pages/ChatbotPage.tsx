import { ChannelBadge } from '@/components/ui/ChannelBadge';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, StatCard } from '@/components/ui/Card';
import { Loading } from '@/components/ui/EmptyState';
import { useChatbots } from '@/hooks/usePlatform';
import { motion } from 'framer-motion';
import { Bot, Clock, MessageSquare, Plus, Zap } from 'lucide-react';

export function ChatbotPage() {
  const { data: flows, isLoading } = useChatbots();

  if (isLoading) return <Loading />;

  const totalResolved = (flows ?? []).reduce((s, f) => s + f.resolved, 0);
  const totalTriggers = (flows ?? []).reduce((s, f) => s + f.triggers, 0);
  const resolutionRate = totalTriggers > 0 ? Math.round((totalResolved / totalTriggers) * 100) : 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Robô de Atendimento</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Automatize o atendimento 24/7 com triagem inteligente e respostas instantâneas
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4" /> Novo fluxo
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Fluxos ativos" value={(flows ?? []).filter((f) => f.active).length} icon={Bot} variant="primary" />
        <StatCard title="Ativações" value={totalTriggers.toLocaleString('pt-BR')} icon={Zap} />
        <StatCard title="Resolvidos pelo bot" value={totalResolved.toLocaleString('pt-BR')} icon={MessageSquare} variant="success" />
        <StatCard title="Taxa de resolução" value={`${resolutionRate}%`} icon={Clock} variant="warning" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {(flows ?? []).map((flow) => (
          <Card key={flow.id}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-900/30">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{flow.name}</h3>
                  <ChannelBadge channel={flow.channel} className="mt-1" />
                </div>
              </div>
              <Badge variant={flow.active ? 'success' : 'default'}>
                {flow.active ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 dark:border-gray-800">
              <div>
                <p className="text-2xl font-bold">{flow.triggers}</p>
                <p className="text-xs text-gray-500">Ativações</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{flow.resolved}</p>
                <p className="text-xs text-gray-500">Resolvidos</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">Editar fluxo</Button>
              <Button variant="outline" size="sm" className="flex-1">Testar</Button>
            </div>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}
