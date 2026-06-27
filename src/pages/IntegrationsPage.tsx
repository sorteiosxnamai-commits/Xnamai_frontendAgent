import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Loading } from '@/components/ui/EmptyState';
import { useIntegrations } from '@/hooks/usePlatform';
import type { Integration } from '@/types';
import { motion } from 'framer-motion';
import { Link2, Plug } from 'lucide-react';

const categoryLabels = {
  crm: 'CRM',
  erp: 'ERP',
  ecommerce: 'E-commerce',
  marketing: 'Marketing',
};

export function IntegrationsPage() {
  const { data: integrations, isLoading } = useIntegrations();

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
        <p className="text-gray-500 dark:text-gray-400">
          Conecte CRMs, ERPs e plataformas de e-commerce — sincronização em tempo real
        </p>
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
                >
                  <Plug className="h-4 w-4" />
                  {integration.connected ? 'Gerenciar' : 'Conectar'}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </motion.div>
  );
}
