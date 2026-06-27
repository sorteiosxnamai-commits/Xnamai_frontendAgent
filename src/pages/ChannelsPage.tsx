import { ChannelBadge } from '@/components/ui/ChannelBadge';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Loading } from '@/components/ui/EmptyState';
import { useNotification } from '@/contexts/NotificationContext';
import { useChannels } from '@/hooks/usePlatform';
import { channelConfig } from '@/utils/channels';
import { formatDateTime } from '@/utils';
import { motion } from 'framer-motion';
import { Plus, RefreshCw, Settings } from 'lucide-react';

export function ChannelsPage() {
  const { data: channels, isLoading, refetch } = useChannels();
  const { addToast } = useNotification();

  if (isLoading) return <Loading />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Canais</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Todos os seus canais em uma só tela — WhatsApp, Instagram, Facebook e mais
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" /> Atualizar
          </Button>
          <Button onClick={() => addToast({ title: 'Novo canal', message: 'Assistente de conexão em breve', type: 'info' })}>
            <Plus className="h-4 w-4" /> Conectar canal
          </Button>
        </div>
      </div>

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
                <Badge variant={channel.connected ? 'success' : 'danger'}>
                  {channel.connected ? 'Conectado' : 'Desconectado'}
                </Badge>
              </div>
              <h3 className="mt-4 font-semibold text-gray-900 dark:text-white">{channel.name}</h3>
              <ChannelBadge channel={channel.type} className="mt-2" />
              {channel.phone && (
                <p className="mt-2 text-sm text-gray-500">{channel.phone}</p>
              )}
              <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{channel.messagesToday}</p>
                  <p className="text-xs text-gray-500">mensagens hoje</p>
                </div>
                {channel.lastActivity && (
                  <p className="text-xs text-gray-400">
                    Ativo {formatDateTime(channel.lastActivity)}
                  </p>
                )}
              </div>
              <Button variant="outline" size="sm" className="mt-4 w-full">
                <Settings className="h-4 w-4" /> Configurar
              </Button>
            </Card>
          );
        })}
      </div>
    </motion.div>
  );
}
