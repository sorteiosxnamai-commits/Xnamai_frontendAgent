import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, StatCard } from '@/components/ui/Card';
import { Loading } from '@/components/ui/EmptyState';
import { useNotification } from '@/contexts/NotificationContext';
import { useMercosLogs, useMercosStatus } from '@/hooks/useQueries';
import { mercosService, type MercosSyncType } from '@/services/mercos.service';
import { formatDateTime } from '@/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CheckCircle, Package, RefreshCw, ShoppingCart, Users, XCircle } from 'lucide-react';
import { useState } from 'react';

export function MercosPage() {
  const { data: status, isLoading } = useMercosStatus();
  const { data: logs } = useMercosLogs();
  const { addToast } = useNotification();
  const queryClient = useQueryClient();
  const [syncing, setSyncing] = useState<MercosSyncType | null>(null);

  const syncMutation = useMutation({
    mutationFn: (type: MercosSyncType) => mercosService.sync(type),
    onMutate: (type) => setSyncing(type),
    onSuccess: (result) => {
      addToast({ title: 'Sincronização concluída', message: result.message, type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['mercos'] });
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Falha na sincronização';
      addToast({ title: 'Erro', message: typeof message === 'string' ? message : 'Falha na sincronização', type: 'error' });
    },
    onSettled: () => setSyncing(null),
  });

  if (isLoading) return <Loading />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mercos</h1>
        <p className="text-gray-500 dark:text-gray-400">Integração com a plataforma Mercos</p>
      </div>

      <Card title="Status da Conexão">
        <div className="flex items-center gap-4">
          {status?.connected ? (
            <>
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="font-semibold text-green-600 dark:text-green-400">Conectado</p>
                <p className="text-sm text-gray-500">
                  Última sincronização: {status.lastSync ? formatDateTime(status.lastSync) : '-'}
                </p>
              </div>
            </>
          ) : (
            <>
              <XCircle className="h-8 w-8 text-red-500" />
              <div>
                <p className="font-semibold text-red-600">Desconectado</p>
                <p className="text-sm text-gray-500">Verifique suas credenciais</p>
              </div>
            </>
          )}
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Produtos sincronizados" value={status?.syncedProducts ?? 0} icon={Package} variant="primary" />
        <StatCard title="Clientes sincronizados" value={status?.syncedCustomers ?? 0} icon={Users} variant="success" />
        <StatCard title="Pedidos sincronizados" value={status?.syncedOrders ?? 0} icon={ShoppingCart} />
      </div>

      <Card title="Sincronização">
        <div className="flex flex-wrap gap-3">
          {(['products', 'customers', 'orders', 'all'] as MercosSyncType[]).map((type) => {
            const labels = { products: 'Produtos', customers: 'Clientes', orders: 'Pedidos', all: 'Tudo' };
            return (
              <Button
                key={type}
                onClick={() => syncMutation.mutate(type)}
                loading={syncing === type}
                disabled={!!syncing}
              >
                <RefreshCw className="h-4 w-4" />
                Sincronizar {labels[type]}
              </Button>
            );
          })}
        </div>
      </Card>

      <Card title="Logs de Sincronização">
        <div className="space-y-3">
          {(logs ?? []).map((log) => (
            <div
              key={log.id}
              className="flex items-start justify-between rounded-lg border border-gray-100 p-3 dark:border-gray-800"
            >
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant={log.status === 'success' ? 'success' : log.status === 'error' ? 'danger' : 'info'}>
                    {log.type}
                  </Badge>
                  <span className="text-sm text-gray-900 dark:text-gray-100">{log.message}</span>
                </div>
              </div>
              <span className="shrink-0 text-xs text-gray-400">{formatDateTime(log.timestamp)}</span>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
