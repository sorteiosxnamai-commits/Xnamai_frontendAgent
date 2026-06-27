import { CustomerCard } from '@/components/cards/CustomerCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Loading, SkeletonTable } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { Search } from '@/components/ui/Search';
import { Table } from '@/components/ui/Table';
import { useNotification } from '@/contexts/NotificationContext';
import { useCustomers } from '@/hooks/useQueries';
import { formatCurrency, formatDate } from '@/utils';
import type { Customer } from '@/types';
import { Eye, LayoutGrid, List, Pencil, RefreshCw } from 'lucide-react';
import { useState } from 'react';

export function CustomersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const { addToast } = useNotification();

  const { data, isLoading } = useCustomers({ page, pageSize: 6, search });

  const handleSync = (customer: Customer) => {
    addToast({
      title: 'Sincronização iniciada',
      message: `Sincronizando ${customer.name} com Mercos...`,
      type: 'info',
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonTable />
        <Loading />
      </div>
    );
  }

  const columns = [
    {
      key: 'name',
      header: 'Nome',
      render: (c: Customer) => (
        <div>
          <p className="font-medium">{c.name}</p>
          <p className="text-xs text-gray-500">{c.company}</p>
        </div>
      ),
    },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Telefone' },
    { key: 'city', header: 'Cidade' },
    {
      key: 'ordersCount',
      header: 'Pedidos',
      render: (c: Customer) => c.ordersCount,
    },
    {
      key: 'totalSpent',
      header: 'Total',
      render: (c: Customer) => formatCurrency(c.totalSpent),
    },
    {
      key: 'synced',
      header: 'Status',
      render: (c: Customer) => (
        <Badge variant={c.synced ? 'success' : 'warning'}>
          {c.synced ? 'Sincronizado' : 'Pendente'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (c: Customer) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setSelectedCustomer(c); }}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleSync(c); }}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Contatos</h1>
          <p className="text-gray-500 dark:text-gray-400">Base unificada de clientes e leads multicanal</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'table' ? 'primary' : 'outline'}
            size="icon"
            onClick={() => setViewMode('table')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'cards' ? 'primary' : 'outline'}
            size="icon"
            onClick={() => setViewMode('cards')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <div className="border-b border-gray-200 p-4 dark:border-gray-700">
          <Search
            placeholder="Pesquisar clientes..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="max-w-sm"
          />
        </div>

        {viewMode === 'table' ? (
          <Table
            columns={columns}
            data={data?.data ?? []}
            keyExtractor={(c) => c.id}
            onRowClick={setSelectedCustomer}
          />
        ) : (
          <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
            {(data?.data ?? []).map((c) => (
              <CustomerCard key={c.id} customer={c} onClick={() => setSelectedCustomer(c)} />
            ))}
          </div>
        )}

        {data && (
          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            total={data.total}
            onPageChange={setPage}
          />
        )}
      </div>

      <Modal
        open={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        title="Detalhes do Cliente"
        footer={
          <>
            <Button variant="outline" onClick={() => setSelectedCustomer(null)}>Fechar</Button>
            <Button onClick={() => selectedCustomer && handleSync(selectedCustomer)}>
              <RefreshCw className="h-4 w-4" /> Sincronizar
            </Button>
          </>
        }
      >
        {selectedCustomer && (
          <div className="space-y-3 text-sm">
            <p><strong>Nome:</strong> {selectedCustomer.name}</p>
            <p><strong>Empresa:</strong> {selectedCustomer.company}</p>
            <p><strong>Email:</strong> {selectedCustomer.email}</p>
            <p><strong>Telefone:</strong> {selectedCustomer.phone}</p>
            <p><strong>Cidade:</strong> {selectedCustomer.city}</p>
            <p><strong>Pedidos:</strong> {selectedCustomer.ordersCount}</p>
            <p><strong>Total gasto:</strong> {formatCurrency(selectedCustomer.totalSpent)}</p>
            <p><strong>Último contato:</strong> {formatDate(selectedCustomer.lastContact)}</p>
            {selectedCustomer.notes && <p><strong>Observações:</strong> {selectedCustomer.notes}</p>}
          </div>
        )}
      </Modal>
    </div>
  );
}
