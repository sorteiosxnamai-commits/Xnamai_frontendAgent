import { ChannelBadge } from '@/components/ui/ChannelBadge';
import { ChatBubble } from '@/components/chat/ChatBubble';
import { ConversationCard } from '@/components/chat/ConversationCard';
import { MessageInput } from '@/components/chat/MessageInput';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState, Loading } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Search } from '@/components/ui/Search';
import { Select } from '@/components/ui/Select';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { useNotification } from '@/contexts/NotificationContext';
import { useConversations, useCustomerDetail, useMessages, useProducts } from '@/hooks/useQueries';
import { useConversationSuggestion } from '@/hooks/useConversationSuggestion';
import { conversationsService } from '@/services/conversations.service';
import { roleLabel, usersService } from '@/services/users.service';
import { formatCurrency, formatDateTime } from '@/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle2,
  MessageSquare,
  Package,
  RefreshCw,
  ShoppingCart,
  Sparkles,
  User,
  UserCheck,
  Wand2,
  XCircle,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const STATUS_LABELS = {
  active: 'Ativa',
  waiting: 'Aguardando',
  closed: 'Encerrada',
} as const;

const STATUS_VARIANTS = {
  active: 'success' as const,
  waiting: 'warning' as const,
  closed: 'default' as const,
};

export function ConversationsPage() {
  const {
    activeConversationId,
    setActiveConversationId,
    isTyping,
    setIsTyping,
    localMessages,
    addLocalMessage,
    filterConversations,
    filter,
    setFilter,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
  } = useChat();

  const { user } = useAuth();
  const { data: conversations, isLoading } = useConversations();
  const { data: messages, isLoading: messagesLoading } = useMessages(activeConversationId);
  const activeConversation = conversations?.find((c) => c.id === activeConversationId);
  const { data: customerDetail } = useCustomerDetail(activeConversation?.customerId);
  const { data: teamUsers, isLoading: teamLoading } = useQuery({
    queryKey: ['usuarios'],
    queryFn: usersService.list,
  });
  const { data: productsData } = useProducts({ page: 1, pageSize: 50 });
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { addToast } = useNotification();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [transferOpen, setTransferOpen] = useState(false);
  const [reserveOpen, setReserveOpen] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);
  const [transferAgent, setTransferAgent] = useState('');
  const [reserveProduct, setReserveProduct] = useState('');
  const [closeNote, setCloseNote] = useState('');

  const agentOptions = useMemo(
    () =>
      (teamUsers ?? [])
        .filter((u) => u.active)
        .map((u) => ({
          value: u.id,
          label: `${u.name} — ${roleLabel(u.role)}`,
        })),
    [teamUsers],
  );

  const productOptions = useMemo(
    () =>
      (productsData?.data ?? []).map((p) => ({
        value: p.id,
        label: `${p.name}${p.code ? ` (${p.code})` : ''}`,
      })),
    [productsData],
  );

  useEffect(() => {
    if (agentOptions.length && !transferAgent) {
      setTransferAgent(agentOptions[0].value);
    }
  }, [agentOptions, transferAgent]);

  useEffect(() => {
    if (productOptions.length && !reserveProduct) {
      setReserveProduct(productOptions[0].value);
    }
  }, [productOptions, reserveProduct]);

  const mergedForAi = useMemo(() => {
    if (!activeConversationId) return [];
    return [
      ...(messages ?? []),
      ...(localMessages[activeConversationId] ?? []),
    ].filter(
      (msg, index, self) => self.findIndex((m) => m.id === msg.id) === index,
    );
  }, [messages, localMessages, activeConversationId]);

  const { data: aiSuggestion, isLoading: aiLoading } = useConversationSuggestion(
    activeConversationId,
    activeConversation?.customerId,
    mergedForAi,
  );

  const filtered = conversations ? filterConversations(conversations) : [];
  const isClosed = activeConversation?.status === 'closed';
  const isAssignedToMe = !!user?.id && activeConversation?.assignedTo === user.id;

  const invalidateConversation = () => {
    queryClient.invalidateQueries({ queryKey: ['conversations'] });
    if (activeConversationId) {
      queryClient.invalidateQueries({ queryKey: ['messages', activeConversationId] });
    }
  };

  useEffect(() => {
    const fromQuery = searchParams.get('conversa');
    if (fromQuery) {
      setActiveConversationId(fromQuery);
      return;
    }
    if (conversations?.length && !activeConversationId) {
      setActiveConversationId(conversations[0].id);
    }
  }, [conversations, activeConversationId, setActiveConversationId, searchParams]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, localMessages, activeConversationId]);

  const sendMutation = useMutation({
    mutationFn: (content: string) =>
      conversationsService.sendMessage(activeConversationId!, content),
    onSuccess: (message) => {
      addLocalMessage(activeConversationId!, message);
      invalidateConversation();
    },
    onError: () => {
      addToast({
        title: 'Erro ao enviar',
        message: 'Não foi possível enviar a mensagem. Verifique se a conversa está aberta.',
        type: 'error',
      });
    },
  });

  const transferMutation = useMutation({
    mutationFn: () =>
      conversationsService.transfer(activeConversationId!, transferAgent),
    onSuccess: (conv) => {
      addToast({
        title: 'Atendimento transferido',
        message: `Conversa atribuída a ${conv.assignedName ?? 'novo atendente'}`,
        type: 'success',
      });
      setTransferOpen(false);
      invalidateConversation();
    },
    onError: () => {
      addToast({ title: 'Erro', message: 'Não foi possível transferir', type: 'error' });
    },
  });

  const assumeMutation = useMutation({
    mutationFn: () => conversationsService.assume(activeConversationId!),
    onSuccess: () => {
      addToast({ title: 'Atendimento assumido', message: 'Você é o responsável agora', type: 'success' });
      invalidateConversation();
    },
    onError: () => {
      addToast({ title: 'Erro', message: 'Não foi possível assumir', type: 'error' });
    },
  });

  const closeMutation = useMutation({
    mutationFn: () =>
      conversationsService.close(activeConversationId!, closeNote || undefined),
    onSuccess: () => {
      addToast({ title: 'Atendimento encerrado', message: 'Conversa marcada como encerrada', type: 'success' });
      setCloseOpen(false);
      setCloseNote('');
      invalidateConversation();
    },
    onError: () => {
      addToast({ title: 'Erro', message: 'Não foi possível encerrar', type: 'error' });
    },
  });

  const reopenMutation = useMutation({
    mutationFn: () => conversationsService.reopen(activeConversationId!),
    onSuccess: () => {
      addToast({ title: 'Atendimento reaberto', message: 'Conversa ativa novamente', type: 'success' });
      invalidateConversation();
    },
    onError: () => {
      addToast({ title: 'Erro', message: 'Não foi possível reabrir', type: 'error' });
    },
  });

  const reserveMutation = useMutation({
    mutationFn: () => {
      const product = productOptions.find((p) => p.value === reserveProduct);
      return conversationsService.reserveProduct(activeConversationId!, {
        productId: reserveProduct,
        productName: product?.label,
      });
    },
    onSuccess: () => {
      const product = productOptions.find((p) => p.value === reserveProduct);
      addToast({
        title: 'Produto reservado',
        message: `${product?.label ?? 'Produto'} reservado por 48h`,
        type: 'success',
      });
      setReserveOpen(false);
      invalidateConversation();
    },
    onError: () => {
      addToast({ title: 'Erro', message: 'Não foi possível registrar a reserva', type: 'error' });
    },
  });

  const handleSend = (content: string) => {
    if (!activeConversationId || isClosed) return;
    sendMutation.mutate(content);
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 2000);
  };

  const handleUseSuggestion = () => {
    const text = aiSuggestion?.suggestion;
    if (!text) {
      addToast({ title: 'Aguarde', message: 'A IA ainda está analisando a conversa', type: 'warning' });
      return;
    }
    handleSend(text);
    addToast({ title: 'Sugestão enviada', message: 'Mensagem contextual inserida no chat', type: 'success' });
  };

  const handleOpenFunnel = () => {
    addToast({ title: 'Funil aberto', message: 'Oportunidade vinculada ao cliente', type: 'info' });
    navigate('/funil');
  };

  const allMessages = mergedForAi;

  if (isLoading) return <Loading />;

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Central de Atendimento</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Transferência, encerramento e reservas persistidos no Supabase
        </p>
      </div>

      <div className="flex flex-1 overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <div className="flex w-full flex-col border-r border-gray-200 md:w-80 lg:w-96 dark:border-gray-700">
          <div className="space-y-3 border-b border-gray-200 p-3 dark:border-gray-700">
            <Search
              placeholder="Buscar conversas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Select
              options={[
                { value: 'all', label: 'Todos os canais' },
                { value: 'whatsapp', label: 'WhatsApp' },
                { value: 'instagram', label: 'Instagram' },
                { value: 'facebook', label: 'Facebook' },
                { value: 'telegram', label: 'Telegram' },
                { value: 'webchat', label: 'WebChat' },
                { value: 'email', label: 'E-mail' },
              ]}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            <Select
              options={[
                { value: 'all', label: 'Todos os status' },
                { value: 'active', label: 'Ativas' },
                { value: 'waiting', label: 'Aguardando' },
                { value: 'closed', label: 'Encerradas' },
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <EmptyState icon={MessageSquare} title="Nenhuma conversa" description="Não há conversas com os filtros aplicados" />
            ) : (
              filtered.map((conv) => (
                <ConversationCard
                  key={conv.id}
                  conversation={conv}
                  active={conv.id === activeConversationId}
                  onClick={() => setActiveConversationId(conv.id)}
                />
              ))
            )}
          </div>
        </div>

        <div className="hidden flex-1 flex-col md:flex">
          {activeConversation ? (
            <>
              <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 dark:border-gray-700">
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {activeConversation.customerName}
                  </h3>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <ChannelBadge channel={activeConversation.channel} />
                    {activeConversation.protocol && (
                      <span className="text-xs text-gray-400">{activeConversation.protocol}</span>
                    )}
                    {activeConversation.assignedName && (
                      <span className="text-xs text-gray-500">
                        · {activeConversation.assignedName}
                        {activeConversation.department ? ` (${activeConversation.department})` : ''}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {!isClosed && !isAssignedToMe && user && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => assumeMutation.mutate()}
                      disabled={assumeMutation.isPending}
                    >
                      <UserCheck className="h-4 w-4" /> Assumir
                    </Button>
                  )}
                  {isClosed ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => reopenMutation.mutate()}
                      disabled={reopenMutation.isPending}
                    >
                      <RefreshCw className="h-4 w-4" /> Reabrir
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCloseOpen(true)}
                    >
                      <XCircle className="h-4 w-4" /> Encerrar
                    </Button>
                  )}
                  <Badge variant={STATUS_VARIANTS[activeConversation.status]}>
                    {STATUS_LABELS[activeConversation.status]}
                  </Badge>
                </div>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto bg-gray-50 p-4 dark:bg-gray-950">
                {isClosed && (
                  <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
                    Conversa encerrada. Reabra para enviar novas mensagens.
                  </div>
                )}
                {messagesLoading ? (
                  <Loading text="Carregando mensagens..." />
                ) : (
                  allMessages.map((msg) => (
                    <ChatBubble
                      key={msg.id}
                      message={msg}
                      customerName={activeConversation.customerName}
                    />
                  ))
                )}
                {isTyping && (
                  <div className="text-sm text-gray-400">
                    Digitando...
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <MessageInput
                onSend={handleSend}
                disabled={sendMutation.isPending || isClosed}
                placeholder={isClosed ? 'Conversa encerrada' : 'Digite sua mensagem...'}
              />
            </>
          ) : (
            <EmptyState
              icon={MessageSquare}
              title="Selecione uma conversa"
              description="Escolha uma conversa na lista para visualizar as mensagens"
            />
          )}
        </div>

        <div className="hidden w-80 flex-col border-l border-gray-200 xl:flex dark:border-gray-700">
          {customerDetail ? (
            <div className="flex-1 overflow-y-auto p-4">
              <div className="mb-6 text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-xl font-bold text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                  {customerDetail.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{customerDetail.name}</h3>
                <p className="text-sm text-gray-500">{customerDetail.company}</p>
              </div>

              <div className="space-y-3 text-sm">
                <InfoRow label="Telefone" value={customerDetail.phone} />
                <InfoRow label="Email" value={customerDetail.email} />
                <InfoRow label="Cidade" value={customerDetail.city} />
                <InfoRow label="Último atendimento" value={formatDateTime(customerDetail.lastService)} />
              </div>

              {customerDetail.notes && (
                <div className="mt-4 rounded-lg bg-amber-50 p-3 text-sm dark:bg-amber-900/20">
                  <p className="font-medium text-amber-800 dark:text-amber-300">Observações</p>
                  <p className="mt-1 text-amber-700 dark:text-amber-400">{customerDetail.notes}</p>
                </div>
              )}

              <div className="mt-4">
                <h4 className="mb-2 flex items-center gap-1 text-sm font-medium">
                  <ShoppingCart className="h-4 w-4" /> Pedidos ({customerDetail.orders.length})
                </h4>
                {customerDetail.orders.slice(0, 3).map((o) => (
                  <div key={o.id} className="mb-1 text-xs text-gray-500">
                    {o.number} · {formatCurrency(o.total)}
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <h4 className="mb-2 flex items-center gap-1 text-sm font-medium">
                  <Package className="h-4 w-4" /> Produtos comprados
                </h4>
                {customerDetail.purchasedProducts.slice(0, 3).map((p) => (
                  <div key={p.id} className="mb-1 text-xs text-gray-500">
                    {p.name}
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-2">
                <div className="rounded-lg bg-violet-50 p-3 dark:bg-violet-900/20">
                  <div className="flex items-center justify-between gap-2">
                    <p className="flex items-center gap-1 text-xs font-medium text-violet-700 dark:text-violet-300">
                      <Sparkles className="h-3.5 w-3.5" /> Copiloto IA
                    </p>
                    {aiSuggestion && (
                      <Badge variant={aiSuggestion.priority === 'high' ? 'danger' : aiSuggestion.priority === 'medium' ? 'warning' : 'default'} className="text-[10px]">
                        {aiSuggestion.source === 'openai' ? 'GPT' : 'IA local'}
                      </Badge>
                    )}
                  </div>
                  {aiLoading ? (
                    <p className="mt-2 text-xs text-violet-500">Analisando conversa...</p>
                  ) : (
                    <>
                      <p className="mt-1 text-xs text-violet-600 dark:text-violet-400">
                        {aiSuggestion?.insight ?? 'Selecione uma conversa para análise.'}
                      </p>
                      {aiSuggestion?.suggestion && (
                        <p className="mt-2 rounded-md bg-white/60 p-2 text-xs text-gray-700 dark:bg-gray-900/40 dark:text-gray-300">
                          {aiSuggestion.suggestion}
                        </p>
                      )}
                    </>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 w-full text-xs"
                    onClick={handleUseSuggestion}
                    disabled={aiLoading || !aiSuggestion?.suggestion || isClosed}
                  >
                    <Wand2 className="h-3 w-3" /> Usar sugestão
                  </Button>
                </div>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  size="sm"
                  onClick={() => setTransferOpen(true)}
                  disabled={isClosed || teamLoading || agentOptions.length === 0}
                >
                  <RefreshCw className="h-4 w-4" /> Transferir atendimento
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm" onClick={handleOpenFunnel}>
                  <ShoppingCart className="h-4 w-4" /> Abrir no funil
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  size="sm"
                  onClick={() => setReserveOpen(true)}
                  disabled={isClosed || productOptions.length === 0}
                >
                  <Package className="h-4 w-4" /> Reservar produto
                </Button>
                {!isClosed && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    size="sm"
                    onClick={() => setCloseOpen(true)}
                  >
                    <CheckCircle2 className="h-4 w-4" /> Encerrar atendimento
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <EmptyState icon={User} title="Informações do cliente" description="Selecione uma conversa" />
          )}
        </div>
      </div>

      <Modal
        open={transferOpen}
        onClose={() => setTransferOpen(false)}
        title="Transferir atendimento"
        footer={
          <>
            <Button variant="outline" onClick={() => setTransferOpen(false)}>Cancelar</Button>
            <Button onClick={() => transferMutation.mutate()} disabled={transferMutation.isPending || !transferAgent}>
              Transferir
            </Button>
          </>
        }
      >
        {agentOptions.length === 0 ? (
          <p className="text-sm text-gray-500">Cadastre usuários em Configurações → Usuários.</p>
        ) : (
          <Select
            label="Atendente"
            options={agentOptions}
            value={transferAgent}
            onChange={(e) => setTransferAgent(e.target.value)}
          />
        )}
      </Modal>

      <Modal
        open={closeOpen}
        onClose={() => setCloseOpen(false)}
        title="Encerrar atendimento"
        footer={
          <>
            <Button variant="outline" onClick={() => setCloseOpen(false)}>Cancelar</Button>
            <Button onClick={() => closeMutation.mutate()} disabled={closeMutation.isPending}>
              Encerrar
            </Button>
          </>
        }
      >
        <Input
          label="Motivo (opcional)"
          value={closeNote}
          onChange={(e) => setCloseNote(e.target.value)}
          placeholder="Ex.: Cliente satisfeito, pedido concluído"
        />
      </Modal>

      <Modal
        open={reserveOpen}
        onClose={() => setReserveOpen(false)}
        title="Reservar produto"
        footer={
          <>
            <Button variant="outline" onClick={() => setReserveOpen(false)}>Cancelar</Button>
            <Button onClick={() => reserveMutation.mutate()} disabled={reserveMutation.isPending || !reserveProduct}>
              Confirmar reserva
            </Button>
          </>
        }
      >
        {productOptions.length === 0 ? (
          <p className="text-sm text-gray-500">Sincronize produtos no Mercos primeiro.</p>
        ) : (
          <>
            <Select
              label="Produto"
              options={productOptions}
              value={reserveProduct}
              onChange={(e) => setReserveProduct(e.target.value)}
            />
            <p className="mt-3 text-xs text-gray-500">A reserva expira automaticamente em 48 horas.</p>
          </>
        )}
      </Modal>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-gray-100 py-2 dark:border-gray-800">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900 dark:text-gray-100">{value}</span>
    </div>
  );
}
