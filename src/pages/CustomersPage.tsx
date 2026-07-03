import { CustomerCard } from '@/components/cards/CustomerCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Loading, SkeletonTable } from '@/components/ui/EmptyState';
import { CustomersEmptyState, CustomersMercosHint } from '@/components/ui/GuidedEmptyState';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { Search } from '@/components/ui/Search';
import { Table } from '@/components/ui/Table';
import { useNotification } from '@/contexts/NotificationContext';
import { useMercosSync } from '@/hooks/useMercosSync';
import { usePermissions } from '@/hooks/usePermissions';
import { useCustomers } from '@/hooks/useQueries';
import { customerEditStore, customerStore } from '@/store/customerStore';
import { formatCurrency, formatDate } from '@/utils';
import type { Customer } from '@/types';
import { Eye, LayoutGrid, List, Pencil, RefreshCw } from 'lucide-react';
import { useState } from 'react';

export function CustomersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', company: '', city: '', notes: '' });
  const { addToast } = useNotification();
  const { can } = usePermissions();
  const canSync = can('manageIntegrations');
  const syncMutation = useMercosSync();

  const { data, isLoading } = useCustomers({ page, pageSize: 6, search });

  const handleSyncAll = () => {
    if (!canSync) return;
    syncMutation.mutate('customers');
  };

  const openEdit = (customer: Customer) => {
    const edits = customerEditStore.get(customer.id);
    setEditCustomer(customer);
    setEditForm({
      name: edits?.name ?? customer.name,
      email: edits?.email ?? customer.email,
      phone: edits?.phone ?? customer.phone,
      company: edits?.company ?? customer.company,
      city: edits?.city ?? customer.city,
      notes: edits?.notes ?? customer.notes ?? '',
    });
  };

  const handleSaveEdit = () => {
    if (!editCustomer) return;
    if (!editForm.name.trim()) {
      addToast({ title: 'Nome obrigatório', type: 'warning' });
      return;
    }
    customerEditStore.save(editCustomer.id, editForm);
    addToast({ title: 'Cliente atualizado', message: editForm.name, type: 'success' });
    setEditCustomer(null);
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
          <p className="font-medium">{customerEditStore.get(c.id)?.name ?? c.name}</p>
          <p className="text-xs text-gray-500">{customerEditStore.get(c.id)?.company ?? c.company}</p>
        </div>
      ),
    },
    { key: 'email', header: 'Email', render: (c: Customer) => customerEditStore.get(c.id)?.email ?? c.email },
    { key: 'phone', header: 'Telefone', render: (c: Customer) => customerEditStore.get(c.id)?.phone ?? c.phone },
    { key: 'city', header: 'Cidade', render: (c: Customer) => customerEditStore.get(c.id)?.city ?? c.city },
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
        <Badge variant={c.synced || customerStore.isSyncedOverride(c.id) ? 'success' : 'warning'}>
          {c.synced || customerStore.isSyncedOverride(c.id) ? 'Sincronizado' : 'Pendente'}
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
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openEdit(c); }}>
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const displayCustomer = (c: Customer) => {
    const edits = customerEditStore.get(c.id);
    return edits ? { ...c, ...edits } : c;
  };

  const customers = data?.data ?? [];
  const isEmpty = (data?.total ?? 0) === 0;
  const hasSearch = Boolean(search.trim());

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Contatos</h1>
          <p className="text-gray-500 dark:text-gray-400">Base unificada de clientes e leads multicanal</p>
        </div>
        <div className="flex gap-2">
          {canSync && (
            <Button onClick={handleSyncAll} loading={syncMutation.isPending}>
              <RefreshCw className="h-4 w-4" /> Sincronizar Mercos
            </Button>
          )}
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

      <CustomersMercosHint />

      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <div className="border-b border-gray-200 p-4 dark:border-gray-700">
          <Search
            placeholder="Pesquisar clientes..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="max-w-sm"
          />
        </div>

        {isEmpty ? (
          <CustomersEmptyState searched={hasSearch} />
        ) : viewMode === 'table' ? (
          <Table
            columns={columns}
            data={customers}
            keyExtractor={(c) => c.id}
            onRowClick={setSelectedCustomer}
          />
        ) : (
          <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
            {customers.map((c) => (
              <CustomerCard key={c.id} customer={displayCustomer(c)} onClick={() => setSelectedCustomer(c)} />
            ))}
          </div>
        )}

        {data && !isEmpty && (
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
            <Button onClick={() => selectedCustomer && openEdit(selectedCustomer)}>Editar</Button>
          </>
        }
      >
        {selectedCustomer && (() => {
          const c = displayCustomer(selectedCustomer);
          return (
            <div className="space-y-3 text-sm">
              <p><strong>Nome:</strong> {c.name}</p>
              <p><strong>Empresa:</strong> {c.company}</p>
              <p><strong>Email:</strong> {c.email}</p>
              <p><strong>Telefone:</strong> {c.phone}</p>
              <p><strong>Cidade:</strong> {c.city}</p>
              <p><strong>Pedidos:</strong> {c.ordersCount}</p>
              <p><strong>Total gasto:</strong> {formatCurrency(c.totalSpent)}</p>
              <p><strong>Último contato:</strong> {formatDate(c.lastContact)}</p>
              {c.notes && <p><strong>Observações:</strong> {c.notes}</p>}
            </div>
          );
        })()}
      </Modal>

      <Modal
        open={!!editCustomer}
        onClose={() => setEditCustomer(null)}
        title="Editar cliente"
        footer={
          <>
            <Button variant="outline" onClick={() => setEditCustomer(null)}>Cancelar</Button>
            <Button onClick={handleSaveEdit}>Salvar</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Nome" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
          <Input label="Email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
          <Input label="Telefone" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
          <Input label="Empresa" value={editForm.company} onChange={(e) => setEditForm({ ...editForm, company: e.target.value })} />
          <Input label="Cidade" value={editForm.city} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} />
          <Input label="Observações" value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} />
        </div>
      </Modal>
    </div>
  );
}
