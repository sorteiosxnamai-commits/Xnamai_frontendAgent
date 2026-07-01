import { ChannelBadge } from '@/components/ui/ChannelBadge';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { DemoNotice, PageBetaBadge } from '@/components/ui/DemoNotice';
import { Input } from '@/components/ui/Input';
import { Loading } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { useNotification } from '@/contexts/NotificationContext';
import { usePlatformMutations } from '@/hooks/usePlatformMutations';
import { useChannels } from '@/hooks/usePlatform';
import { channelConfig } from '@/utils/channels';
import { formatDateTime } from '@/utils';
import type { Channel, ChannelType } from '@/types';
import { motion } from 'framer-motion';
import { Plus, RefreshCw, Settings } from 'lucide-react';
import { useState } from 'react';

const channelTypes: { value: ChannelType; label: string }[] = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'webchat', label: 'WebChat' },
  { value: 'sms', label: 'SMS' },
  { value: 'email', label: 'E-mail' },
];

export function ChannelsPage() {
  const { data: channels, isLoading, refetch, isFetching } = useChannels();
  const { connectChannel, updateChannel, toggleChannel } = usePlatformMutations();
  const { addToast } = useNotification();

  const [connectOpen, setConnectOpen] = useState(false);
  const [configChannel, setConfigChannel] = useState<Channel | null>(null);
  const [confirmToggle, setConfirmToggle] = useState<Channel | null>(null);
  const [newType, setNewType] = useState<ChannelType>('whatsapp');
  const [newName, setNewName] = useState('');
  const [configName, setConfigName] = useState('');
  const [configPhone, setConfigPhone] = useState('');

  const handleConnect = async () => {
    if (!newName.trim()) {
      addToast({ title: 'Nome obrigatório', message: 'Informe um nome para o canal', type: 'warning' });
      return;
    }
    await connectChannel.mutateAsync({ type: newType, name: newName.trim() });
    addToast({ title: 'Canal conectado', message: `${newName} foi adicionado com sucesso`, type: 'success' });
    setConnectOpen(false);
    setNewName('');
  };

  const openConfig = (channel: Channel) => {
    setConfigChannel(channel);
    setConfigName(channel.name);
    setConfigPhone(channel.phone ?? '');
  };

  const handleSaveConfig = async () => {
    if (!configChannel) return;
    await updateChannel.mutateAsync({
      id: configChannel.id,
      patch: { name: configName, phone: configPhone || undefined },
    });
    addToast({ title: 'Canal atualizado', message: 'Configurações salvas', type: 'success' });
    setConfigChannel(null);
  };

  const handleToggle = async () => {
    if (!confirmToggle) return;
    await toggleChannel.mutateAsync(confirmToggle.id);
    addToast({
      title: confirmToggle.connected ? 'Canal desconectado' : 'Canal conectado',
      message: confirmToggle.name,
      type: 'success',
    });
    setConfirmToggle(null);
  };

  if (isLoading) return <Loading />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
            Canais <PageBetaBadge />
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Todos os seus canais em uma só tela — WhatsApp, Instagram, Facebook e mais
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} /> Atualizar
          </Button>
          <Button onClick={() => setConnectOpen(true)}>
            <Plus className="h-4 w-4" /> Conectar canal
          </Button>
        </div>
      </div>

      <DemoNotice />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(channels ?? []).map((channel) => {
          const config = channelConfig[channel.type];
          const Icon = config.icon;
          return (
            <Card key={channel.id}>
              <div className="flex items-start justify-between">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${config.bg}`}>
                  <Icon className={`h-6 w-6 ${config.color}`} />
                </div>
                <button type="button" onClick={() => setConfirmToggle(channel)}>
                  <Badge variant={channel.connected ? 'success' : 'danger'} className="cursor-pointer">
                    {channel.connected ? 'Conectado' : 'Desconectado'}
                  </Badge>
                </button>
              </div>
              <h3 className="mt-4 font-semibold text-gray-900 dark:text-white">{channel.name}</h3>
              <ChannelBadge channel={channel.type} className="mt-2" />
              {channel.phone && <p className="mt-2 text-sm text-gray-500">{channel.phone}</p>}
              <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{channel.messagesToday}</p>
                  <p className="text-xs text-gray-500">mensagens hoje</p>
                </div>
                {channel.lastActivity && (
                  <p className="text-xs text-gray-400">Ativo {formatDateTime(channel.lastActivity)}</p>
                )}
              </div>
              <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => openConfig(channel)}>
                <Settings className="h-4 w-4" /> Configurar
              </Button>
            </Card>
          );
        })}
      </div>

      <Modal
        open={connectOpen}
        onClose={() => setConnectOpen(false)}
        title="Conectar novo canal"
        footer={
          <>
            <Button variant="outline" onClick={() => setConnectOpen(false)}>Cancelar</Button>
            <Button onClick={handleConnect} loading={connectChannel.isPending}>Conectar</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="Tipo de canal"
            options={channelTypes.map((t) => ({ value: t.value, label: t.label }))}
            value={newType}
            onChange={(e) => setNewType(e.target.value as ChannelType)}
          />
          <Input
            label="Nome do canal"
            placeholder="Ex: WhatsApp Vendas"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
        </div>
      </Modal>

      <Modal
        open={!!configChannel}
        onClose={() => setConfigChannel(null)}
        title="Configurar canal"
        footer={
          <>
            <Button variant="outline" onClick={() => setConfigChannel(null)}>Cancelar</Button>
            <Button onClick={handleSaveConfig} loading={updateChannel.isPending}>Salvar</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Nome" value={configName} onChange={(e) => setConfigName(e.target.value)} />
          <Input label="Telefone / identificador" value={configPhone} onChange={(e) => setConfigPhone(e.target.value)} />
        </div>
      </Modal>

      <ConfirmModal
        open={!!confirmToggle}
        onClose={() => setConfirmToggle(null)}
        onConfirm={handleToggle}
        loading={toggleChannel.isPending}
        title={confirmToggle?.connected ? 'Desconectar canal?' : 'Conectar canal?'}
        message={`Deseja ${confirmToggle?.connected ? 'desconectar' : 'conectar'} o canal "${confirmToggle?.name}"?`}
        confirmLabel={confirmToggle?.connected ? 'Desconectar' : 'Conectar'}
        variant={confirmToggle?.connected ? 'danger' : 'primary'}
      />
    </motion.div>
  );
}
