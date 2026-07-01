import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Loading } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { useNotification } from '@/contexts/NotificationContext';
import { usePlatformMutations } from '@/hooks/usePlatformMutations';
import { useIntegrations } from '@/hooks/usePlatform';
import type { Integration } from '@/types';
import { motion } from 'framer-motion';
import { ExternalLink, Link2, Plug } from 'lucide-react';
import { useState } from 'react';

const categoryLabels = {
  crm: 'CRM',
  erp: 'ERP',
  ecommerce: 'E-commerce',
  marketing: 'Marketing',
};

export function IntegrationsPage() {
  const { data: integrations, isLoading } = useIntegrations();
  const { toggleIntegration } = usePlatformMutations();
  const { addToast } = useNotification();
  const [selected, setSelected] = useState<Integration | null>(null);
  const [confirm, setConfirm] = useState<Integration | null>(null);

  const handleToggle = async () => {
    if (!confirm) return;
    await toggleIntegration.mutateAsync(confirm.id);
    addToast({
      title: confirm.connected ? 'Integração desconectada' : 'Integração conectada',
      message: confirm.name,
      type: 'success',
    });
    setConfirm(null);
    setSelected(null);
  };

  if (isLoading) return <Loading />;

  const grouped = (integrations ?? []).reduce<Record<string, Integration[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Integrações</h1>
        <p className="text-gray-500 dark:text-gray-400">Conecte CRMs, ERPs e plataformas de e-commerce</p>
      </div>

      <Card>
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-900/30">
            <Link2 className="h-6 w-6" />
          </div>
          <div>
            <p className="font-semibold">
              {(integrations ?? []).filter((i) => i.connected).length} de {(integrations ?? []).length} integrações ativas
            </p>
            <p className="text-sm text-gray-500">Não encontrou seu sistema? Integramos para você.</p>
          </div>
          <Button
            variant="outline"
            className="ml-auto"
            onClick={() => addToast({ title: 'Solicitação enviada', message: 'Nossa equipe entrará em contato em até 24h', type: 'info' })}
          >
            <ExternalLink className="h-4 w-4" /> Solicitar integração
          </Button>
        </div>
      </Card>

      {Object.entries(grouped).map(([category, items]) => (
        <div key={category}>
          <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
            {categoryLabels[category as keyof typeof categoryLabels] ?? category}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {items?.map((integration) => (
              <Card key={integration.id} className="!p-4">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 font-bold text-gray-600 dark:bg-gray-800">
                    {integration.name.slice(0, 2).toUpperCase()}
                  </div>
                  <Badge variant={integration.connected ? 'success' : 'default'}>
                    {integration.connected ? 'Conectado' : 'Disponível'}
                  </Badge>
                </div>
                <h3 className="mt-3 font-medium">{integration.name}</h3>
                <Button
                  variant={integration.connected ? 'outline' : 'primary'}
                  size="sm"
                  className="mt-3 w-full"
                  onClick={() => (integration.connected ? setSelected(integration) : setConfirm(integration))}
                >
                  <Plug className="h-4 w-4" />
                  {integration.connected ? 'Gerenciar' : 'Conectar'}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      ))}

      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Gerenciar ${selected?.name}`} footer={
        <>
          <Button variant="outline" onClick={() => setSelected(null)}>Fechar</Button>
          <Button variant="danger" onClick={() => selected && setConfirm(selected)}>Desconectar</Button>
        </>
      }>
        {selected && (
          <div className="space-y-3 text-sm">
            <p>Integração <strong>{selected.name}</strong> está ativa e sincronizando dados.</p>
            <p className="text-gray-500">Última sincronização: há 5 minutos</p>
            <Button variant="outline" className="w-full" onClick={() => addToast({ title: 'Sincronização manual', message: 'Dados atualizados', type: 'success' })}>
              Sincronizar agora
            </Button>
          </div>
        )}
      </Modal>

      <ConfirmModal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={handleToggle}
        loading={toggleIntegration.isPending}
        title={confirm?.connected ? 'Desconectar integração?' : 'Conectar integração?'}
        message={`Deseja ${confirm?.connected ? 'desconectar' : 'conectar'} ${confirm?.name}?`}
        confirmLabel={confirm?.connected ? 'Desconectar' : 'Conectar'}
        variant={confirm?.connected ? 'danger' : 'primary'}
      />
    </motion.div>
  );
}
