import { ChannelBadge } from '@/components/ui/ChannelBadge';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ComingSoonBadge, DemoNotice } from '@/components/ui/DemoNotice';
import { Input } from '@/components/ui/Input';
import { Loading } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Table } from '@/components/ui/Table';
import { useNotification } from '@/contexts/NotificationContext';
import { usePlatformMutations } from '@/hooks/usePlatformMutations';
import { useCampaigns } from '@/hooks/usePlatform';
import { CAMPAIGNS_DISPATCH_LIVE } from '@/utils/featureAvailability';
import { formatDateTime } from '@/utils';
import type { Campaign, ChannelType } from '@/types';
import { motion } from 'framer-motion';
import { Megaphone, Plus } from 'lucide-react';
import { useState } from 'react';

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
  const { createCampaign } = usePlatformMutations();
  const { addToast } = useNotification();
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<Campaign | null>(null);
  const [form, setForm] = useState({
    name: '',
    channel: 'whatsapp' as ChannelType,
    status: 'draft' as Campaign['status'],
    recipients: 100,
    scheduledAt: '',
  });

  const handleCreate = async () => {
    if (!form.name.trim()) {
      addToast({ title: 'Nome obrigatório', type: 'warning' });
      return;
    }
    if (!CAMPAIGNS_DISPATCH_LIVE && form.status !== 'draft') {
      addToast({
        title: 'Em breve',
        message: 'Agendamento e disparo de campanhas ainda não estão disponíveis. Salve como rascunho.',
        type: 'info',
      });
      return;
    }
    await createCampaign.mutateAsync({
      name: form.name.trim(),
      channel: form.channel,
      status: CAMPAIGNS_DISPATCH_LIVE ? form.status : 'draft',
      recipients: form.recipients,
      scheduledAt: CAMPAIGNS_DISPATCH_LIVE ? form.scheduledAt || undefined : undefined,
    });
    addToast({
      title: 'Rascunho salvo',
      message: CAMPAIGNS_DISPATCH_LIVE
        ? form.name
        : `${form.name} — o envio em massa será habilitado em breve.`,
      type: 'success',
    });
    setModalOpen(false);
    setForm({ name: '', channel: 'whatsapp', status: 'draft', recipients: 100, scheduledAt: '' });
  };

  if (isLoading) return <Loading />;

  const columns = [
    { key: 'name', header: 'Campanha' },
    { key: 'channel', header: 'Canal', render: (c: Campaign) => <ChannelBadge channel={c.channel} /> },
    {
      key: 'status',
      header: 'Status',
      render: (c: Campaign) => (
        <div className="flex items-center gap-2">
          <Badge variant={statusVariant[c.status]}>{statusLabels[c.status]}</Badge>
          {!CAMPAIGNS_DISPATCH_LIVE && c.status !== 'draft' && <ComingSoonBadge />}
        </div>
      ),
    },
    { key: 'recipients', header: 'Destinatários', render: (c: Campaign) => c.recipients.toLocaleString('pt-BR') },
    {
      key: 'sent',
      header: 'Enviadas',
      render: (c: Campaign) => (CAMPAIGNS_DISPATCH_LIVE ? c.sent.toLocaleString('pt-BR') : '—'),
    },
    {
      key: 'opened',
      header: 'Taxa abertura',
      render: (c: Campaign) =>
        CAMPAIGNS_DISPATCH_LIVE && c.sent > 0 ? `${Math.round((c.opened / c.sent) * 100)}%` : '—',
    },
    { key: 'scheduledAt', header: 'Agendamento', render: (c: Campaign) => (c.scheduledAt ? formatDateTime(c.scheduledAt) : '-') },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Campanhas</h1>
            {!CAMPAIGNS_DISPATCH_LIVE && <ComingSoonBadge />}
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            Planeje campanhas em rascunho — disparo em massa via WhatsApp em breve
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" /> Nova campanha
        </Button>
      </div>

      <DemoNotice variant="comingSoon" />

      <Card className="!p-4 text-sm text-gray-600 dark:text-gray-300">
        <p>
          <strong>Hoje:</strong> criar e listar rascunhos de campanha.
        </p>
        <p className="mt-1 text-gray-500">
          <strong>Em breve:</strong> agendamento, envio em massa e métricas reais de entrega/abertura.
        </p>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="!p-4">
          <p className="text-sm text-gray-500">Rascunhos</p>
          <p className="text-2xl font-bold">{(campaigns ?? []).filter((c) => c.status === 'draft').length}</p>
        </Card>
        <Card className="!p-4 opacity-75">
          <p className="text-sm text-gray-500">Disparos ativos</p>
          <p className="text-2xl font-bold">—</p>
          <p className="text-xs text-gray-400">Em breve</p>
        </Card>
        <Card className="!p-4 opacity-75">
          <p className="text-sm text-gray-500">Mensagens enviadas</p>
          <p className="text-2xl font-bold">—</p>
          <p className="text-xs text-gray-400">Em breve</p>
        </Card>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        {(campaigns ?? []).length === 0 ? (
          <div className="flex flex-col items-center py-16">
            <Megaphone className="h-12 w-12 text-gray-300" />
            <p className="mt-4 text-gray-500">Nenhuma campanha criada</p>
            <Button className="mt-4" onClick={() => setModalOpen(true)}>Criar primeiro rascunho</Button>
          </div>
        ) : (
          <Table columns={columns} data={campaigns ?? []} keyExtractor={(c) => c.id} onRowClick={setSelected} />
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Nova campanha (rascunho)"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate} loading={createCampaign.isPending}>Salvar rascunho</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Black Friday 2024" />
          <Select
            label="Canal"
            options={[
              { value: 'whatsapp', label: 'WhatsApp' },
              { value: 'sms', label: 'SMS (Em breve)', disabled: true },
              { value: 'email', label: 'E-mail (Em breve)', disabled: true },
            ]}
            value={form.channel}
            onChange={(e) => setForm({ ...form, channel: e.target.value as ChannelType })}
          />
          <Select
            label="Status"
            options={[
              { value: 'draft', label: 'Rascunho' },
              { value: 'scheduled', label: 'Agendada (Em breve)', disabled: !CAMPAIGNS_DISPATCH_LIVE },
              { value: 'running', label: 'Em andamento (Em breve)', disabled: !CAMPAIGNS_DISPATCH_LIVE },
            ]}
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as Campaign['status'] })}
          />
          <Input label="Destinatários (planejado)" type="number" value={form.recipients} onChange={(e) => setForm({ ...form, recipients: Number(e.target.value) })} />
          <Input
            label="Agendar para (Em breve)"
            type="datetime-local"
            value={form.scheduledAt}
            onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
            disabled={!CAMPAIGNS_DISPATCH_LIVE}
          />
        </div>
      </Modal>

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Detalhes da campanha"
        footer={<Button variant="outline" onClick={() => setSelected(null)}>Fechar</Button>}
      >
        {selected && (
          <div className="space-y-2 text-sm">
            <p><strong>Nome:</strong> {selected.name}</p>
            <p><strong>Status:</strong> {statusLabels[selected.status]}</p>
            <p><strong>Destinatários planejados:</strong> {selected.recipients}</p>
            {!CAMPAIGNS_DISPATCH_LIVE && (
              <p className="text-amber-700 dark:text-amber-300">
                Métricas de envio e abertura serão exibidas quando o disparo estiver ativo.
              </p>
            )}
            {CAMPAIGNS_DISPATCH_LIVE && (
              <>
                <p><strong>Enviadas:</strong> {selected.sent}</p>
                <p><strong>Aberturas:</strong> {selected.opened}</p>
              </>
            )}
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
