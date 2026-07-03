import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/EmptyState';
import { useSystemStatus } from '@/hooks/useQueries';
import { usePermissions } from '@/hooks/usePermissions';
import { canAccessSettingsTab } from '@/utils/navPermissions';
import { formatDateTime } from '@/utils';
import { useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle2,
  Database,
  Link,
  MessageCircle,
  RefreshCw,
  Server,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function StatusRow({
  ok,
  label,
  detail,
  actionLabel,
  onAction,
}: {
  ok: boolean;
  label: string;
  detail: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-gray-100 p-4 dark:border-gray-800">
      <div className="flex gap-3">
        {ok ? (
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
        ) : (
          <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
        )}
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{label}</p>
          <p className="mt-1 text-sm text-gray-500">{detail}</p>
        </div>
      </div>
      {!ok && actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export function SystemStatusPanel() {
  const { data, isLoading, isFetching, refetch } = useSystemStatus();
  const { can, role } = usePermissions();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const goToTab = (tab: string) => {
    if (!canAccessSettingsTab(tab, can, role)) {
      navigate('/configuracoes');
      return;
    }
    navigate(`/configuracoes?tab=${tab}`);
  };

  const handleRefresh = () => {
    refetch();
    queryClient.invalidateQueries({ queryKey: ['mercos'] });
    queryClient.invalidateQueries({ queryKey: ['whatsapp'] });
    queryClient.invalidateQueries({ queryKey: ['agent'] });
  };

  if (isLoading || !data) return <Loading />;

  const { supabase, mercos, whatsapp, openai, data: stats, readiness } = data;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-teal-200 bg-gradient-to-br from-teal-50 to-white p-5 dark:border-teal-900/40 dark:from-teal-950/30 dark:to-gray-900">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300">
              <Server className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Prontidão para produção</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {readiness.completed}/{readiness.total} etapas
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={readiness.percent >= 80 ? 'success' : readiness.percent >= 40 ? 'warning' : 'default'}>
              {readiness.percent}% pronto
            </Badge>
            <Button variant="outline" size="sm" onClick={handleRefresh} loading={isFetching}>
              <RefreshCw className="h-4 w-4" />
              Atualizar
            </Button>
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className="h-full rounded-full bg-teal-500 transition-all"
            style={{ width: `${readiness.percent}%` }}
          />
        </div>
      </div>

      <div className="space-y-3">
        <StatusRow
          ok={supabase.ok}
          label="Supabase"
          detail={
            supabase.ok
              ? `${supabase.message}${supabase.users != null ? ` · ${supabase.users} usuário(s)` : ''}`
              : supabase.error ?? supabase.message
          }
        />

        <StatusRow
          ok={mercos.configured}
          label="Mercos"
          detail={
            mercos.configured
              ? `${mercos.isProduction ? 'Produção' : 'Sandbox'} · ${mercos.syncedCustomers} clientes · ${mercos.syncedOrders} pedidos${
                  mercos.lastSync ? ` · última sync ${formatDateTime(mercos.lastSync)}` : ''
                }`
              : 'Defina MERCOS_APPLICATION_TOKEN, MERCOS_COMPANY_TOKEN e MERCOS_BASE_URL no Render'
          }
          actionLabel="Configurar"
          onAction={() => goToTab('mercos')}
        />

        <StatusRow
          ok={whatsapp.connected}
          label="WhatsApp (Meta)"
          detail={
            whatsapp.connected
              ? `Conectado${whatsapp.displayPhone ? ` · ${whatsapp.displayPhone}` : ''}`
              : whatsapp.message ?? 'Configure META_ACCESS_TOKEN e META_PHONE_NUMBER_ID no Render'
          }
          actionLabel="Configurar"
          onAction={() => goToTab('whatsapp')}
        />

        <StatusRow
          ok={openai.configured}
          label="OpenAI (IA)"
          detail={
            openai.configured
              ? `${openai.model ?? 'GPT'} · modo ${openai.mode}`
              : 'Defina OPENAI_API_KEY no Render para robô e copiloto com GPT'
          }
          actionLabel="Ver detalhes"
          onAction={() => goToTab('openai')}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-100 p-4 dark:border-gray-800">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Database className="h-4 w-4" />
            Clientes c/ telefone
          </div>
          <p className="mt-2 text-2xl font-bold">{stats.customersWithPhone}</p>
          <p className="text-xs text-gray-500">Para campanhas WhatsApp</p>
        </div>
        <div className="rounded-xl border border-gray-100 p-4 dark:border-gray-800">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link className="h-4 w-4" />
            Produtos sync
          </div>
          <p className="mt-2 text-2xl font-bold">{mercos.syncedProducts}</p>
        </div>
        <div className="rounded-xl border border-gray-100 p-4 dark:border-gray-800">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MessageCircle className="h-4 w-4" />
            Webhook WhatsApp
          </div>
          <p className="mt-2 truncate text-xs font-mono text-gray-600 dark:text-gray-400">
            {whatsapp.webhookUrl ?? '—'}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900/40 dark:text-gray-300">
        <p className="flex items-center gap-2 font-medium text-gray-900 dark:text-white">
          <Sparkles className="h-4 w-4 text-violet-500" />
          Variáveis no Render (backend)
        </p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-xs">
          <li>Mercos: <code>MERCOS_APPLICATION_TOKEN</code>, <code>MERCOS_COMPANY_TOKEN</code>, <code>MERCOS_BASE_URL</code></li>
          <li>WhatsApp: <code>META_ACCESS_TOKEN</code>, <code>META_PHONE_NUMBER_ID</code></li>
          <li>IA: <code>OPENAI_API_KEY</code></li>
          <li>Banco: <code>SUPABASE_URL</code>, <code>SUPABASE_KEY</code></li>
        </ul>
      </div>
    </div>
  );
}
