import { ChannelBadge } from '@/components/ui/ChannelBadge';
import { Card } from '@/components/ui/Card';
import { Loading } from '@/components/ui/EmptyState';
import { useFunnel } from '@/hooks/usePlatform';
import { formatCurrency } from '@/utils';
import { motion } from 'framer-motion';
import { DollarSign } from 'lucide-react';

export function FunnelPage() {
  const { data: stages, isLoading } = useFunnel();

  if (isLoading) return <Loading />;

  const totalValue = (stages ?? []).reduce(
    (sum, stage) => sum + stage.deals.reduce((s, d) => s + d.value, 0),
    0,
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Funil de Vendas</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Visualize oportunidades, mova leads e aumente sua taxa de conversão
          </p>
        </div>
        <Card className="!p-4">
          <div className="flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-primary-600" />
            <div>
              <p className="text-sm text-gray-500">Pipeline total</p>
              <p className="text-xl font-bold">{formatCurrency(totalValue)}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {(stages ?? []).map((stage) => (
          <div key={stage.id} className="min-w-[280px] flex-shrink-0">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">{stage.name}</h3>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium dark:bg-gray-800">
                {stage.deals.length}
              </span>
            </div>
            <div className="space-y-3">
              {stage.deals.map((deal) => (
                <Card key={deal.id} className="!p-4 cursor-pointer transition-shadow hover:shadow-md">
                  <h4 className="font-medium text-gray-900 dark:text-white">{deal.title}</h4>
                  <p className="mt-1 text-sm text-gray-500">{deal.contact}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-bold text-primary-600">{formatCurrency(deal.value)}</span>
                    <ChannelBadge channel={deal.channel} showLabel={false} />
                  </div>
                </Card>
              ))}
              {stage.deals.length === 0 && (
                <div className="rounded-lg border-2 border-dashed border-gray-200 p-6 text-center text-sm text-gray-400 dark:border-gray-700">
                  Nenhum negócio
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
