import { ChannelBadge } from '@/components/ui/ChannelBadge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DemoNotice, PageBetaBadge } from '@/components/ui/DemoNotice';
import { Loading } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { useNotification } from '@/contexts/NotificationContext';
import { usePlatformMutations } from '@/hooks/usePlatformMutations';
import { useFunnel } from '@/hooks/usePlatform';
import { formatCurrency } from '@/utils';
import type { FunnelDeal } from '@/types';
import { motion } from 'framer-motion';
import { DollarSign } from 'lucide-react';
import { useState } from 'react';

export function FunnelPage() {
  const { data: stages, isLoading } = useFunnel();
  const { moveDeal } = usePlatformMutations();
  const { addToast } = useNotification();
  const [selectedDeal, setSelectedDeal] = useState<FunnelDeal | null>(null);
  const [targetStage, setTargetStage] = useState('');

  const handleMove = async () => {
    if (!selectedDeal || !targetStage || targetStage === selectedDeal.stageId) return;
    await moveDeal.mutateAsync({ dealId: selectedDeal.id, stageId: targetStage });
    const stageName = stages?.find((s) => s.id === targetStage)?.name;
    addToast({ title: 'Negócio movido', message: `"${selectedDeal.title}" → ${stageName}`, type: 'success' });
    setSelectedDeal(null);
  };

  const openDeal = (deal: FunnelDeal) => {
    setSelectedDeal(deal);
    setTargetStage(deal.stageId);
  };

  if (isLoading) return <Loading />;

  const totalValue = (stages ?? []).reduce(
    (sum, stage) => sum + stage.deals.reduce((s, d) => s + d.value, 0),
    0,
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
            Funil de Vendas <PageBetaBadge />
          </h1>
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

      <DemoNotice />

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
                <div key={deal.id} className="cursor-pointer" onClick={() => openDeal(deal)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && openDeal(deal)}>
                <Card className="!p-4 transition-shadow hover:shadow-md">
                  <h4 className="font-medium text-gray-900 dark:text-white">{deal.title}</h4>
                  <p className="mt-1 text-sm text-gray-500">{deal.contact}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-bold text-primary-600">{formatCurrency(deal.value)}</span>
                    <ChannelBadge channel={deal.channel} showLabel={false} />
                  </div>
                </Card>
                </div>
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

      <Modal
        open={!!selectedDeal}
        onClose={() => setSelectedDeal(null)}
        title={selectedDeal?.title ?? 'Negócio'}
        footer={
          <>
            <Button variant="outline" onClick={() => setSelectedDeal(null)}>Fechar</Button>
            <Button onClick={handleMove} loading={moveDeal.isPending} disabled={targetStage === selectedDeal?.stageId}>
              Mover estágio
            </Button>
          </>
        }
      >
        {selectedDeal && (
          <div className="space-y-4 text-sm">
            <p><strong>Contato:</strong> {selectedDeal.contact}</p>
            <p><strong>Valor:</strong> {formatCurrency(selectedDeal.value)}</p>
            <div className="flex items-center gap-2">
              <strong>Canal:</strong> <ChannelBadge channel={selectedDeal.channel} />
            </div>
            <Select
              label="Mover para estágio"
              options={(stages ?? []).map((s) => ({ value: s.id, label: s.name }))}
              value={targetStage}
              onChange={(e) => setTargetStage(e.target.value)}
            />
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
