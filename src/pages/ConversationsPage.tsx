import { ChannelBadge } from '@/components/ui/ChannelBadge';
import { ChatBubble } from '@/components/chat/ChatBubble';
import { ConversationCard } from '@/components/chat/ConversationCard';
import { MessageInput } from '@/components/chat/MessageInput';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState, Loading } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { Search } from '@/components/ui/Search';
import { Select } from '@/components/ui/Select';
import { useChat } from '@/contexts/ChatContext';
import { useNotification } from '@/contexts/NotificationContext';
import { useConversations, useCustomerDetail, useMessages } from '@/hooks/useQueries';
import { useConversationSuggestion } from '@/hooks/useConversationSuggestion';
import { conversationsService } from '@/services/conversations.service';
import { formatCurrency, formatDateTime } from '@/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MessageSquare,
  Package,
  RefreshCw,
  ShoppingCart,
  Sparkles,
  User,
  Wand2,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AGENTS = [
  { value: 'ana', label: 'Ana Silva — Vendas' },
  { value: 'carlos', label: 'Carlos Mendes — Suporte' },
  { value: 'julia', label: 'Julia Santos — Comercial' },
];

const PRODUCTS = [
  { value: 'p1', label: 'Sensor PT100 Industrial' },
  { value: 'p2', label: 'Controlador CLP-200' },
  { value: 'p3', label: 'Módulo I/O 16 canais' },
];

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

  const { data: conversations, isLoading } = useConversations();
  const { data: messages, isLoading: messagesLoading } = useMessages(activeConversationId);
  const activeConversation = conversations?.find((c) => c.id === activeConversationId);
  const { data: customerDetail } = useCustomerDetail(activeConversation?.customerId);
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const [transferOpen, setTransferOpen] = useState(false);
  const [reserveOpen, setReserveOpen] = useState(false);
  const [transferAgent, setTransferAgent] = useState('ana');
  const [reserveProduct, setReserveProduct] = useState('p1');

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

  useEffect(() => {
    if (conversations?.length && !activeConversationId) {
      setActiveConversationId(conversations[0].id);
    }
  }, [conversations, activeConversationId, setActiveConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, localMessages, activeConversationId]);

  const sendMutation = useMutation({
    mutationFn: (content: string) =>
      conversationsService.sendMessage(activeConversationId!, content),
    onSuccess: (message) => {
      addLocalMessage(activeConversationId!, message);
      queryClient.invalidateQueries({ queryKey: ['messages', activeConversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  const handleSend = (content: string) => {
    if (!activeConversationId) return;
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

  const handleTransfer = () => {
    const agent = AGENTS.find((a) => a.value === transferAgent);
    addToast({
      title: 'Atendimento transferido',
      message: `Conversa encaminhada para ${agent?.label}`,
      type: 'success',
    });
    setTransferOpen(false);
  };

  const handleOpenFunnel = () => {
    addToast({ title: 'Funil aberto', message: 'Oportunidade vinculada ao cliente', type: 'info' });
    navigate('/funil');
  };

  const handleReserve = () => {
    const product = PRODUCTS.find((p) => p.value === reserveProduct);
    addToast({
      title: 'Produto reservado',
      message: `${product?.label} reservado por 48h`,
      type: 'success',
    });
    setReserveOpen(false);
  };

  const allMessages = mergedForAi;

  if (isLoading) return <Loading />;

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Central de Atendimento</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Todos os canais em uma só tela — sem abas, sem conversas perdidas
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
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {activeConversation.customerName}
                  </h3>
                  <div className="mt-1 flex items-center gap-2">
                    <ChannelBadge channel={activeConversation.channel} />
                    {activeConversation.protocol && (
                      <span className="text-xs text-gray-400">{activeConversation.protocol}</span>
                    )}
                  </div>
                </div>
                <Badge variant={activeConversation.status === 'active' ? 'success' : 'default'}>
                  {activeConversation.status === 'active' ? 'Online' : activeConversation.status}
                </Badge>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto bg-gray-50 p-4 dark:bg-gray-950">
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

              <MessageInput onSend={handleSend} disabled={sendMutation.isPending} />
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
                    disabled={aiLoading || !aiSuggestion?.suggestion}
                  >
                    <Wand2 className="h-3 w-3" /> Usar sugestão
                  </Button>
                </div>
                <Button variant="outline" className="w-full justify-start" size="sm" onClick={() => setTransferOpen(true)}>
                  <RefreshCw className="h-4 w-4" /> Transferir atendimento
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm" onClick={handleOpenFunnel}>
                  <ShoppingCart className="h-4 w-4" /> Abrir no funil
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm" onClick={() => setReserveOpen(true)}>
                  <Package className="h-4 w-4" /> Reservar produto
                </Button>
              </div>
            </div>
          ) : (
            <EmptyState icon={User} title="Informações do cliente" description="Selecione uma conversa" />
          )}
        </div>
      </div>

      <Modal open={transferOpen} onClose={() => setTransferOpen(false)} title="Transferir atendimento" footer={
        <>
          <Button variant="outline" onClick={() => setTransferOpen(false)}>Cancelar</Button>
          <Button onClick={handleTransfer}>Transferir</Button>
        </>
      }>
        <Select
          label="Atendente"
          options={AGENTS}
          value={transferAgent}
          onChange={(e) => setTransferAgent(e.target.value)}
        />
      </Modal>

      <Modal open={reserveOpen} onClose={() => setReserveOpen(false)} title="Reservar produto" footer={
        <>
          <Button variant="outline" onClick={() => setReserveOpen(false)}>Cancelar</Button>
          <Button onClick={handleReserve}>Confirmar reserva</Button>
        </>
      }>
        <Select
          label="Produto"
          options={PRODUCTS}
          value={reserveProduct}
          onChange={(e) => setReserveProduct(e.target.value)}
        />
        <p className="mt-3 text-xs text-gray-500">A reserva expira automaticamente em 48 horas.</p>
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
