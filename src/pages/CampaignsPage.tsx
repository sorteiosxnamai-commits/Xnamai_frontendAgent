import { ChannelBadge } from '@/components/ui/ChannelBadge';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DemoNotice, PageBetaBadge } from '@/components/ui/DemoNotice';
import { Input } from '@/components/ui/Input';
import { Loading } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Table } from '@/components/ui/Table';
import { useNotification } from '@/contexts/NotificationContext';
import { usePlatformMutations } from '@/hooks/usePlatformMutations';
import { useCampaigns } from '@/hooks/usePlatform';
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
    await createCampaign.mutateAsync({
      name: form.name.trim(),
      channel: form.channel,
      status: form.status,
      recipients: form.recipients,
      scheduledAt: form.scheduledAt || undefined,
    });
    addToast({ title: 'Campanha criada', message: form.name, type: 'success' });
    setModalOpen(false);
    setForm({ name: '', channel: 'whatsapp', status: 'draft', recipients: 100, scheduledAt: '' });
  };

  if (isLoading) return <Loading />;

  const columns = [
    { key: 'name', header: 'Campanha' },
    { key: 'channel', header: 'Canal', render: (c: Campaign) => <ChannelBadge channel={c.channel} /> },
    { key: 'status', header: 'Status', render: (c: Campaign) => <Badge variant={statusVariant[c.status]}>{statusLabels[c.status]}</Badge> },
    { key: 'recipients', header: 'Destinatários', render: (c: Campaign) => c.recipients.toLocaleString('pt-BR') },
    { key: 'sent', header: 'Enviadas', render: (c: Campaign) => c.sent.toLocaleString('pt-BR') },
    { key: 'opened', header: 'Taxa abertura', render: (c: Campaign) => (c.sent > 0 ? `${Math.round((c.opened / c.sent) * 100)}%` : '-') },
    { key: 'scheduledAt', header: 'Agendamento', render: (c: Campaign) => (c.scheduledAt ? formatDateTime(c.scheduledAt) : '-') },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
            Campanhas <PageBetaBadge />
          </h1>
          <p className="text-gray-500 dark:text-gray-400">Dispare mensagens em massa com WhatsApp API Oficial e outros canais</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" /> Nova campanha
        </Button>
      </div>

      <DemoNotice />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="!p-4">
          <p className="text-sm text-gray-500">Campanhas ativas</p>
          <p className="text-2xl font-bold">{(campaigns ?? []).filter((c) => c.status === 'running').length}</p>
        </Card>
        <Card className="!p-4">
          <p className="text-sm text-gray-500">Total enviadas</p>
          <p className="text-2xl font-bold">{(campaigns ?? []).reduce((s, c) => s + c.sent, 0).toLocaleString('pt-BR')}</p>
        </Card>
        <Card className="!p-4">
          <p className="text-sm text-gray-500">Agendadas</p>
          <p className="text-2xl font-bold">{(campaigns ?? []).filter((c) => c.status === 'scheduled').length}</p>
        </Card>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        {(campaigns ?? []).length === 0 ? (
          <div className="flex flex-col items-center py-16">
            <Megaphone className="h-12 w-12 text-gray-300" />
            <p className="mt-4 text-gray-500">Nenhuma campanha criada</p>
            <Button className="mt-4" onClick={() => setModalOpen(true)}>Criar primeira campanha</Button>
          </div>
        ) : (
          <Table columns={columns} data={campaigns ?? []} keyExtractor={(c) => c.id} onRowClick={setSelected} />
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nova campanha" footer={
        <>
          <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
          <Button onClick={handleCreate} loading={createCampaign.isPending}>Criar campanha</Button>
        </>
      }>
        <div className="space-y-4">
          <Input label="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Black Friday 2024" />
          <Select label="Canal" options={[{ value: 'whatsapp', label: 'WhatsApp' }, { value: 'sms', label: 'SMS' }, { value: 'email', label: 'E-mail' }]} value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value as ChannelType })} />
          <Select label="Status" options={[{ value: 'draft', label: 'Rascunho' }, { value: 'scheduled', label: 'Agendada' }, { value: 'running', label: 'Em andamento' }]} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Campaign['status'] })} />
          <Input label="Destinatários" type="number" value={form.recipients} onChange={(e) => setForm({ ...form, recipients: Number(e.target.value) })} />
          <Input label="Agendar para (opcional)" type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} />
        </div>
      </Modal>

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Detalhes da campanha" footer={
        <Button variant="outline" onClick={() => setSelected(null)}>Fechar</Button>
      }>
        {selected && (
          <div className="space-y-2 text-sm">
            <p><strong>Nome:</strong> {selected.name}</p>
            <p><strong>Status:</strong> {statusLabels[selected.status]}</p>
            <p><strong>Destinatários:</strong> {selected.recipients}</p>
            <p><strong>Enviadas:</strong> {selected.sent}</p>
            <p><strong>Aberturas:</strong> {selected.opened}</p>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
