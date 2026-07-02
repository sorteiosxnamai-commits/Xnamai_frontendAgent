import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/Card';
import { DemoNotice } from '@/components/ui/DemoNotice';
import { Loading } from '@/components/ui/EmptyState';
import { useNotification } from '@/contexts/NotificationContext';
import { useMercosLogs, useMercosStatus } from '@/hooks/useQueries';
import { mercosService, type MercosSyncType } from '@/services/mercos.service';
import { formatCurrency, formatDateTime } from '@/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle, Package, RefreshCw, ShoppingCart, Users, XCircle } from 'lucide-react';
import { useState } from 'react';

export function MercosSettingsPanel() {
  const { data: status, isLoading } = useMercosStatus();
  const { data: logs } = useMercosLogs();
  const { addToast } = useNotification();
  const queryClient = useQueryClient();
  const [syncing, setSyncing] = useState<MercosSyncType | null>(null);

  const testMutation = useMutation({
    mutationFn: () => mercosService.testConnection(),
    onSuccess: (result) => {
      addToast({
        title: result.ok ? 'Conexão OK' : 'Falha na conexão',
        message: result.message,
        type: result.ok ? 'success' : 'error',
      });
      queryClient.invalidateQueries({ queryKey: ['mercos'] });
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Não foi possível conectar ao Mercos';
      addToast({ title: 'Falha na conexão', message: String(message), type: 'error' });
    },
  });

  const syncMutation = useMutation({
    mutationFn: (type: MercosSyncType) => mercosService.sync(type),
    onMutate: (type) => setSyncing(type),
    onSuccess: (result) => {
      addToast({ title: 'Sincronização concluída', message: result.message, type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['mercos'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['funnel'] });
      queryClient.invalidateQueries({ queryKey: ['sales-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
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
    <div className="space-y-6">
      <DemoNotice variant="sandbox" />

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
        <p className="font-medium">Pedidos permanentes (Etapa 4)</p>
        <ol className="mt-2 list-decimal space-y-1 pl-4 text-amber-800 dark:text-amber-200/90">
          <li>No sandbox Mercos, abra <strong>Pedidos</strong> e marque alguns como <strong>Enviado</strong> ou <strong>Entregue</strong>.</li>
          <li>Volte aqui e clique em <strong>Sincronizar Pedidos</strong> (ou Tudo).</li>
          <li>O funil e Relatórios passam a usar esses status — re-sync não apaga dados do Mercos.</li>
        </ol>
        <p className="mt-2 text-xs text-amber-700 dark:text-amber-300/80">
          Evite o script <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/50">demo_pedidos_status.py</code> — ele só patcha o Supabase e é sobrescrito no próximo sync.
        </p>
      </div>

      {status?.allOrdersProcessing && (status.syncedOrders ?? 0) > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-900/50 dark:bg-orange-950/20">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-orange-600" />
          <div className="text-sm text-orange-900 dark:text-orange-100">
            <p className="font-medium">Todos os pedidos estão em Processando</p>
            <p className="mt-1 text-orange-800 dark:text-orange-200/90">
              Relatórios e receita retida ficam zerados até você alterar status no Mercos sandbox e sincronizar de novo.
            </p>
          </div>
        </div>
      )}

      {(status?.orderStatusBreakdown?.length ?? 0) > 0 && (
        <div>
          <p className="mb-3 text-sm font-medium text-gray-900 dark:text-white">Status dos pedidos (Supabase)</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {status?.orderStatusBreakdown?.map((item) => (
              <div
                key={item.code}
                className="rounded-lg border border-gray-100 p-3 dark:border-gray-800"
              >
                <p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{item.count}</p>
                <p className="text-xs text-gray-500">{formatCurrency(item.value)}</p>
              </div>
            ))}
          </div>
          {(status?.retainedRevenue ?? 0) > 0 && (
            <p className="mt-3 text-sm text-green-700 dark:text-green-400">
              Receita retida (enviado + entregue): <strong>{formatCurrency(status?.retainedRevenue ?? 0)}</strong>
            </p>
          )}
        </div>
      )}

      <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900/40 dark:text-gray-400">
        <p className="font-medium text-gray-900 dark:text-gray-200">Tokens configurados no servidor</p>
        <p className="mt-1">
          Application Token, Company Token e URL da API ficam no backend (Render → Environment). Esta tela
          testa e sincroniza com as credenciais já deployadas — não é possível alterar tokens pelo navegador.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4 rounded-lg border border-gray-100 p-4 dark:border-gray-800">
        {status?.connected ? (
          <>
            <CheckCircle className="h-8 w-8 shrink-0 text-green-500" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-green-600 dark:text-green-400">Mercos configurado</p>
              <p className="text-sm text-gray-500">
                Última verificação: {status.lastSync ? formatDateTime(status.lastSync) : '—'}
              </p>
            </div>
            <Badge variant="success">Conectada</Badge>
          </>
        ) : (
          <>
            <XCircle className="h-8 w-8 shrink-0 text-red-500" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-red-600">Mercos não configurado</p>
              <p className="text-sm text-gray-500">Defina MERCOS_* no Render e faça redeploy</p>
            </div>
            <Badge variant="danger">Desconectada</Badge>
          </>
        )}
        <Button
          variant="outline"
          onClick={() => testMutation.mutate()}
          loading={testMutation.isPending}
          disabled={!status?.connected}
        >
          Testar conexão
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Produtos sincronizados" value={status?.syncedProducts ?? 0} icon={Package} variant="primary" />
        <StatCard title="Clientes sincronizados" value={status?.syncedCustomers ?? 0} icon={Users} variant="success" />
        <StatCard title="Pedidos sincronizados" value={status?.syncedOrders ?? 0} icon={ShoppingCart} />
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-gray-900 dark:text-white">Sincronização</p>
        <div className="flex flex-wrap gap-3">
          {(['all', 'customers', 'products', 'orders'] as MercosSyncType[]).map((type) => {
            const labels = { products: 'Produtos', customers: 'Clientes', orders: 'Pedidos', all: 'Tudo' };
            return (
              <Button
                key={type}
                onClick={() => syncMutation.mutate(type)}
                loading={syncing === type}
                disabled={!!syncing || !status?.connected}
              >
                <RefreshCw className="h-4 w-4" />
                Sincronizar {labels[type]}
              </Button>
            );
          })}
        </div>
      </div>

      {(logs ?? []).length > 0 && (
        <div>
          <p className="mb-3 text-sm font-medium text-gray-900 dark:text-white">Logs recentes</p>
          <div className="space-y-2">
            {logs?.map((log) => (
              <div
                key={log.id}
                className="flex items-start justify-between rounded-lg border border-gray-100 p-3 dark:border-gray-800"
              >
                <div className="flex items-center gap-2">
                  <Badge variant={log.status === 'success' ? 'success' : log.status === 'error' ? 'danger' : 'info'}>
                    {log.type}
                  </Badge>
                  <span className="text-sm">{log.message}</span>
                </div>
                <span className="shrink-0 text-xs text-gray-400">{formatDateTime(log.timestamp)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
