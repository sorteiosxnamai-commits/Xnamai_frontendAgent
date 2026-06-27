import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Loading, SkeletonTable } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { Search } from '@/components/ui/Search';
import { Select } from '@/components/ui/Select';
import { Table } from '@/components/ui/Table';
import { useOrders } from '@/hooks/useQueries';
import { formatCurrency, formatDate, orderStatusLabels } from '@/utils';
import type { Order, OrderStatus } from '@/types';
import { useState } from 'react';

const statusOptions = [
  { value: '', label: 'Todos os status' },
  { value: 'pending', label: 'Pendente' },
  { value: 'processing', label: 'Processando' },
  { value: 'shipped', label: 'Enviado' },
  { value: 'delivered', label: 'Entregue' },
  { value: 'cancelled', label: 'Cancelado' },
];

const statusVariant: Record<OrderStatus, 'default' | 'warning' | 'info' | 'success' | 'danger'> = {
  pending: 'warning',
  processing: 'info',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'danger',
};

export function OrdersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [selected, setSelected] = useState<Order | null>(null);

  const { data, isLoading } = useOrders({ page, pageSize: 6, search, status: status || undefined });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonTable />
        <Loading />
      </div>
    );
  }

  const columns = [
    { key: 'number', header: 'Número' },
    { key: 'customerName', header: 'Cliente' },
    {
      key: 'status',
      header: 'Status',
      render: (o: Order) => (
        <Badge variant={statusVariant[o.status]}>
          {orderStatusLabels[o.status]}
        </Badge>
      ),
    },
    {
      key: 'total',
      header: 'Valor',
      render: (o: Order) => formatCurrency(o.total),
    },
    {
      key: 'createdAt',
      header: 'Data',
      render: (o: Order) => formatDate(o.createdAt),
    },
    {
      key: 'items',
      header: 'Itens',
      render: (o: Order) => o.items,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pedidos</h1>
        <p className="text-gray-500 dark:text-gray-400">Acompanhe todos os pedidos</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <div className="flex flex-col gap-3 border-b border-gray-200 p-4 sm:flex-row dark:border-gray-700">
          <Search
            placeholder="Pesquisar pedidos..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="max-w-sm"
          />
          <Select
            options={statusOptions}
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="max-w-xs"
          />
        </div>

        <Table columns={columns} data={data?.data ?? []} keyExtractor={(o) => o.id} onRowClick={setSelected} />

        {data && (
          <Pagination page={data.page} totalPages={data.totalPages} total={data.total} onPageChange={setPage} />
        )}
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Pedido ${selected?.number}`} footer={
        <Button variant="outline" onClick={() => setSelected(null)}>Fechar</Button>
      }>
        {selected && (
          <div className="space-y-3 text-sm">
            <p><strong>Cliente:</strong> {selected.customerName}</p>
            <p><strong>Status:</strong> {orderStatusLabels[selected.status]}</p>
            <p><strong>Valor total:</strong> {formatCurrency(selected.total)}</p>
            <p><strong>Itens:</strong> {selected.items}</p>
            <p><strong>Data:</strong> {formatDate(selected.createdAt)}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
