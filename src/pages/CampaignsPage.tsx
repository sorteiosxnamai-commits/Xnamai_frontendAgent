import { ChannelBadge } from '@/components/ui/ChannelBadge';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Loading } from '@/components/ui/EmptyState';
import { Table } from '@/components/ui/Table';
import { useCampaigns } from '@/hooks/usePlatform';
import { formatDateTime } from '@/utils';
import type { Campaign } from '@/types';
import { motion } from 'framer-motion';
import { Megaphone, Plus } from 'lucide-react';

const statusLabels: Record<Campaign['status'], string> = {
  draft: 'Rascunho',
  scheduled: 'Agendada',
  running: 'Em andamento',
  completed: 'Concluída',
};

const statusVariant: Record<Campaign['status'], 'default' | 'info' | 'success' | 'warning'> = {
  draft: 'default',
  scheduled: 'warning',
  running: 'info',
  completed: 'success',
};

export function CampaignsPage() {
  const { data: campaigns, isLoading } = useCampaigns();

  if (isLoading) return <Loading />;

  const columns = [
    { key: 'name', header: 'Campanha' },
    {
      key: 'channel',
      header: 'Canal',
      render: (c: Campaign) => <ChannelBadge channel={c.channel} />,
    },
    {
      key: 'status',
      header: 'Status',
      render: (c: Campaign) => (
        <Badge variant={statusVariant[c.status]}>{statusLabels[c.status]}</Badge>
      ),
    },
    { key: 'recipients', header: 'Destinatários', render: (c: Campaign) => c.recipients.toLocaleString('pt-BR') },
    { key: 'sent', header: 'Enviadas', render: (c: Campaign) => c.sent.toLocaleString('pt-BR') },
    {
      key: 'opened',
      header: 'Taxa abertura',
      render: (c: Campaign) =>
        c.sent > 0 ? `${Math.round((c.opened / c.sent) * 100)}%` : '-',
    },
    {
      key: 'scheduledAt',
      header: 'Agendamento',
      render: (c: Campaign) => (c.scheduledAt ? formatDateTime(c.scheduledAt) : '-'),
    },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Campanhas</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Dispare mensagens em massa com WhatsApp API Oficial e outros canais
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4" /> Nova campanha
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="!p-4">
          <p className="text-sm text-gray-500">Campanhas ativas</p>
          <p className="text-2xl font-bold">
            {(campaigns ?? []).filter((c) => c.status === 'running').length}
          </p>
        </Card>
        <Card className="!p-4">
          <p className="text-sm text-gray-500">Total enviadas</p>
          <p className="text-2xl font-bold">
            {(campaigns ?? []).reduce((s, c) => s + c.sent, 0).toLocaleString('pt-BR')}
          </p>
        </Card>
        <Card className="!p-4">
          <p className="text-sm text-gray-500">Agendadas</p>
          <p className="text-2xl font-bold">
            {(campaigns ?? []).filter((c) => c.status === 'scheduled').length}
          </p>
        </Card>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        {(campaigns ?? []).length === 0 ? (
          <div className="flex flex-col items-center py-16">
            <Megaphone className="h-12 w-12 text-gray-300" />
            <p className="mt-4 text-gray-500">Nenhuma campanha criada</p>
          </div>
        ) : (
          <Table columns={columns} data={campaigns ?? []} keyExtractor={(c) => c.id} />
        )}
      </div>
    </motion.div>
  );
}
