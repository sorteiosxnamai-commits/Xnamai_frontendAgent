import { ChannelBadge } from '@/components/ui/ChannelBadge';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { SetupChecklist } from '@/components/dashboard/SetupChecklist';
import { Loading, Skeleton } from '@/components/ui/EmptyState';
import { useAuth } from '@/contexts/AuthContext';
import { useChannels } from '@/hooks/usePlatform';
import {
  useAgentStatus,
  useConversations,
  useCustomers,
  useDashboard,
  useMercosStatus,
  useOrders,
  useProducts,
  useSalesMetrics,
  useSystemStatus,
} from '@/hooks/useQueries';
import { agentService } from '@/services/agent.service';
import { cn, formatCurrency, formatDate, formatDateTime, formatRelativeTime } from '@/utils';
import type { ChannelType, Product } from '@/types';
import { useMutation } from '@tanstack/react-query';
import {
  ArrowRight,
  BarChart3,
  Bot,
  Brain,
  Calendar,
  CircleDollarSign,
  Gauge,
  GitBranch,
  Headphones,
  HeartHandshake,
  MessageSquare,
  Package,
  RefreshCw,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { BusinessSummarySection } from './BusinessSummarySection';
import { DashboardExecutiveHeader } from './DashboardExecutiveHeader';
import { DashboardInternalNav } from './DashboardInternalNav';
import { NitrosExecutiveSummary } from './NitrosExecutiveSummary';
import { PipelineHealthSection } from './PipelineHealthSection';
import { RevenueForecastSection } from './RevenueForecastSection';
import { DashboardChartTooltip as ChartTooltip, DashboardEmptyInsight as EmptyInsight, DashboardMiniMetric as MiniMetric, DashboardSection as Section, statusToneClass } from './DashboardSectionPrimitives';
import { useDashboardNavigation, usePresentationMode } from '../hooks';
import type { CommercialStatusFilter, DashboardNavigationItem, ExecutiveKpi, PeriodFilter, ProductSort, RoutineItem } from '../types';
import { daysSince, filterConversations, filterOrders, filterProducts, formatPercent, getCustomerAction, getCustomerStatus, hasBuyingIntent, periodCutoff, scoreConversation } from '../utils';
import { Link } from 'react-router-dom';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const CHART = {
  blue: '#2563EB',
  deepBlue: '#1D4ED8',
  red: '#EF4444',
  green: '#16A34A',
  amber: '#F59E0B',
  slate: '#64748B',
};

const PIE_COLORS = ['#2563EB', '#EF4444', '#1D4ED8', '#16A34A', '#F59E0B', '#64748B'];

const CHANNEL_LABELS: Record<ChannelType, string> = {
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  webchat: 'WebChat',
  telegram: 'Telegram',
  facebook: 'Facebook',
  sms: 'SMS',
  email: 'E-mail',
};

function buildChannelVolume(
  channels: { type: ChannelType; name: string; messagesToday: number }[] | undefined,
  conversations: { channel: ChannelType }[] | undefined,
): { name: string; value: number; type: ChannelType }[] {
  const fromChannels = (channels ?? [])
    .filter((c) => c.messagesToday > 0)
    .map((c) => ({ name: c.name, count: c.messagesToday, type: c.type }));

  const source = fromChannels.length
    ? fromChannels
    : Object.entries(
        (conversations ?? []).reduce<Record<string, number>>((acc, c) => {
          acc[c.channel] = (acc[c.channel] ?? 0) + 1;
          return acc;
        }, {}),
      ).map(([type, count]) => ({
        name: CHANNEL_LABELS[type as ChannelType] ?? type,
        count,
        type: type as ChannelType,
      }));

  const total = source.reduce((sum, item) => sum + item.count, 0);
  if (!total) return [];

  return source.map((item) => ({
    name: item.name,
    type: item.type,
    value: Math.max(1, Math.round((item.count / total) * 100)),
  }));
}

function DataTable({
  headers,
  children,
}: {
  headers: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200/80 bg-white/90 shadow-sm dark:border-white/10 dark:bg-gray-900/90">
      <table className="min-w-full text-left text-[13px] sm:text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-gray-500 dark:bg-white/[0.03]">
          <tr>
            {headers.map((h) => (
              <th key={h} className="whitespace-nowrap px-3 py-2.5 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-white/10">{children}</tbody>
      </table>
    </div>
  );
}

export function DashboardWorkspace() {
  const { user } = useAuth();
  const { data, isLoading, refetch, isFetching } = useDashboard();
  const { data: conversations } = useConversations();
  const { data: customersData } = useCustomers({ page: 1, pageSize: 100 });
  const { data: productsData } = useProducts({ page: 1, pageSize: 100 });
  const { data: ordersData } = useOrders({ page: 1, pageSize: 100 });
  const { data: channels } = useChannels();
  const { data: salesMetrics } = useSalesMetrics();
  const { data: agentStatus } = useAgentStatus();
  const { data: mercosStatus } = useMercosStatus();
  const { data: systemStatus } = useSystemStatus();

  const [period, setPeriod] = useState<PeriodFilter>('30d');
  const [productFilter, setProductFilter] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<CommercialStatusFilter>('all');
  const [channelFilter, setChannelFilter] = useState('');
  const { presentationMode, togglePresentationMode } = usePresentationMode();
  const [productSort, setProductSort] = useState<ProductSort>('best');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [askText, setAskText] = useState('');
  const [agentAnswer, setAgentAnswer] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { activeSection, isHidden: isDashboardNavHidden } = useDashboardNavigation(presentationMode);

  const customers = useMemo(() => customersData?.data ?? [], [customersData]);
  const products = useMemo(() => productsData?.data ?? [], [productsData]);
  const orders = useMemo(() => ordersData?.data ?? [], [ordersData]);
  const conversationList = useMemo(() => conversations ?? [], [conversations]);

  const askMutation = useMutation({
    mutationFn: (message: string) =>
      agentService.chat({
        message,
        mode: 'copilot',
        conversationId: conversationList[0]?.id,
        customerId: conversationList[0]?.customerId,
      }),
    onSuccess: (response) => setAgentAnswer(response.reply),
    onError: () => setAgentAnswer('Não foi possível consultar o NITRUS agora. Tente novamente em instantes.'),
  });

  const cutoff = periodCutoff(period);

  const filteredConversations = useMemo(
    () => filterConversations(conversationList, { status: statusFilter, channel: channelFilter, customer: customerFilter, cutoff }),
    [channelFilter, conversationList, customerFilter, cutoff, statusFilter],
  );

  const filteredOrders = useMemo(() => filterOrders(orders, customerFilter, cutoff), [customerFilter, cutoff, orders]);

  const filteredProducts = useMemo(() => filterProducts(products, productFilter), [productFilter, products]);

  useEffect(() => {
    if (isDashboardNavHidden) setFiltersOpen(false);
  }, [isDashboardNavHidden]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-56 w-full rounded-3xl" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))}
        </div>
        <Loading />
      </div>
    );
  }

  if (!data) return null;

  const { stats, conversationsChart, ordersChart, responseTimeChart } = data;
  const revenueSold = salesMetrics?.valorTotalVendido ?? filteredOrders.reduce((sum, order) => sum + order.total, 0);
  const retainedRevenue = salesMetrics?.valorRetido ?? filteredOrders.filter((o) => o.status === 'delivered').reduce((sum, order) => sum + order.total, 0);
  const pipelineValue = salesMetrics?.pipelineValor ?? salesMetrics?.valorPipeline ?? 0;
  const ticketMedio = salesMetrics?.ticketMedio ?? (filteredOrders.length ? revenueSold / filteredOrders.length : 0);
  const retentionRate = salesMetrics?.taxaRetencao ?? (revenueSold > 0 ? (retainedRevenue / revenueSold) * 100 : 0);
  const conversionRate = salesMetrics?.taxaConversao ?? (stats.totalMessages ? (stats.totalOrders / stats.totalMessages) * 100 : 0);
  const opportunityCount =
    salesMetrics?.pipelineNegocios ??
    Math.max(0, stats.activeConversations + stats.waitingQueue + (salesMetrics?.funil ?? []).reduce((sum, step) => sum + step.quantidade, 0));
  const conservativeForecast = pipelineValue * 0.22;
  const probableRate = Math.max(0.28, Math.min(0.72, retentionRate / 100 || conversionRate / 100 || 0.35));
  const probableForecast = pipelineValue * probableRate;
  const optimisticForecast = pipelineValue * Math.max(probableRate, 0.55) + stats.waitingQueue * ticketMedio * 0.2;
  const channelVolume = buildChannelVolume(channels, filteredConversations);
  const hotLeadCount = filteredConversations.filter((conv) => conv.status === 'waiting' || hasBuyingIntent(conv.lastMessage)).length;
  const activeCustomers = customers.filter((c) => daysSince(c.lastContact) <= 30).length;
  const recurringCustomers = customers.filter((c) => c.ordersCount >= 2).length;
  const readiness = systemStatus?.readiness.percent ?? 0;

  const operationStatus =
    stats.waitingQueue === 0 ? 'Saudável' : stats.waitingQueue <= 5 ? 'Atenção' : 'Sobrecarregada';
  const operationTone: ExecutiveKpi['tone'] = operationStatus === 'Saudável' ? 'green' : operationStatus === 'Atenção' ? 'amber' : 'red';
  const pipelineHealth = Math.max(8, Math.min(100, Math.round((retentionRate + conversionRate + (pipelineValue > 0 ? 25 : 0)) / 2)));
  const pipelineTone: ExecutiveKpi['tone'] = pipelineHealth >= 70 ? 'green' : pipelineHealth >= 45 ? 'amber' : 'red';
  const gargalo = salesMetrics?.funil?.reduce((worst, step) => ((step.quedaPct ?? 0) > (worst.quedaPct ?? 0) ? step : worst), salesMetrics.funil[0]);

  const leadScores = filteredConversations
    .map((conv) => scoreConversation(conv, customers, filteredOrders))
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  const loyalCustomers = [...customers]
    .sort((a, b) => b.totalSpent - a.totalSpent || b.ordersCount - a.ordersCount)
    .slice(0, 8);

  const recentCustomers = [...customers]
    .sort((a, b) => new Date(b.lastContact).getTime() - new Date(a.lastContact).getTime())
    .slice(0, 8);

  const retentionCustomers = customers
    .filter((c) => c.totalSpent > 0 && (daysSince(c.lastContact) > 45 || c.ordersCount >= 2))
    .sort((a, b) => daysSince(b.lastContact) - daysSince(a.lastContact) || b.totalSpent - a.totalSpent)
    .slice(0, 8);

  const productRows = [...filteredProducts]
    .sort((a, b) => {
      if (productSort === 'az') return a.name.localeCompare(b.name);
      if (productSort === 'worst' || productSort === 'idle') return a.stock - b.stock;
      if (productSort === 'revenue') return b.price * b.stock - a.price * a.stock;
      if (productSort === 'recent') return b.id.localeCompare(a.id);
      return b.stock - a.stock;
    })
    .slice(0, 12);

  const executiveDiagnosis =
    filteredOrders.length === 0 && filteredConversations.length === 0
      ? 'O NITRUS precisa de mais conversas, pedidos e clientes sincronizados para gerar previsões mais precisas.'
      : stats.waitingQueue > 0
        ? 'A fila de atendimento está aumentando. Priorize leads recentes para evitar perda de conversão.'
        : retentionRate >= 50
          ? 'Clientes recorrentes representam boa parte da receita. Uma campanha de recompra pode aumentar retenção.'
          : 'A operação tem espaço para melhorar conversão e retenção com follow-ups mais rápidos.';

  const mainRisk =
    stats.waitingQueue > 5
      ? 'Fila alta pode reduzir taxa de conversão.'
      : retentionRate < 35 && revenueSold > 0
        ? 'Retenção abaixo do ideal para clientes que já compraram.'
        : pipelineValue === 0
          ? 'Pipeline sem valor registrado limita previsões comerciais.'
          : 'Risco controlado no momento.';

  const mainOpportunity =
    hotLeadCount > 0
      ? `${hotLeadCount} lead(s) com sinal comercial para priorizar.`
      : recurringCustomers > 0
        ? `${recurringCustomers} cliente(s) recorrente(s) podem receber campanha de recompra.`
        : 'Aumentar captura e qualificação de conversas recentes.';

  const recommendedAction =
    stats.waitingQueue > 0
      ? 'Abrir a Central de Conversão e responder a fila com apoio do Copiloto.'
      : retentionCustomers.length > 0
        ? 'Criar uma abordagem de reativação para clientes com histórico de compra.'
        : 'Usar o NITRUS para revisar oportunidades e gerar propostas comerciais.';

  const expectedImpact =
    stats.waitingQueue > 0
      ? 'Menor tempo de resposta e maior chance de converter leads quentes.'
      : retentionCustomers.length > 0
        ? 'Recuperação de receita com clientes que já conhecem a empresa.'
        : 'Mais previsibilidade sobre pipeline e próximos passos.';

  const routineItems: RoutineItem[] = [
    ...(stats.waitingQueue > 0
      ? [
          {
            priority: 'Alta' as const,
            description: `Responder ${stats.waitingQueue} conversa(s) aguardando.`,
            origin: 'Central de Conversão',
            impact: 'Evita perda de conversão por atraso.',
            action: 'Abrir fila',
            href: '/atendimento',
          },
        ]
      : []),
    ...(leadScores.filter((l) => l.score >= 70).length > 0
      ? [
          {
            priority: 'Alta' as const,
            description: 'Revisar leads quentes detectados pelo scoring.',
            origin: 'Pontuação de leads',
            impact: 'Aumenta foco em oportunidades com maior intenção.',
            action: 'Ver leads',
          },
        ]
      : []),
    ...(retentionCustomers.length > 0
      ? [
          {
            priority: 'Media' as const,
            description: 'Reativar clientes com histórico de compra.',
            origin: 'Retenção',
            impact: 'Pode recuperar receita sem depender de novos leads.',
            action: 'Preparar abordagem',
          },
        ]
      : []),
    ...(products.some((p) => p.stock === 0)
      ? [
          {
            priority: 'Media' as const,
            description: 'Conferir produtos sem estoque antes de campanhas.',
            origin: 'Catálogo',
            impact: 'Reduz atrito comercial e promessas incorretas.',
            action: 'Ver catálogo',
          },
        ]
      : []),
    {
      priority: 'Baixa' as const,
      description: 'Perguntar ao NITRUS quais propostas priorizar esta semana.',
      origin: 'IA Comercial',
      impact: 'Ajuda a orientar a rotina de vendas.',
      action: 'Perguntar ao NITRUS',
    },
  ].slice(0, 6);

  const kpis: ExecutiveKpi[] = [
    {
      title: 'Receita vendida',
      value: formatCurrency(revenueSold),
      description: `${filteredOrders.length || salesMetrics?.quantidadeVendas || 0} pedido(s) no período selecionado.`,
      badge: revenueSold > 0 ? 'Receita ativa' : 'Sem vendas no período',
      tone: revenueSold > 0 ? 'green' : 'slate',
      icon: CircleDollarSign,
    },
    {
      title: 'Receita retida',
      value: formatCurrency(retainedRevenue),
      description: 'Receita concretizada em pedidos entregues ou retidos.',
      badge: `${formatPercent(retentionRate)} de retenção`,
      tone: retentionRate >= 50 ? 'green' : 'amber',
      icon: ShieldCheck,
    },
    {
      title: 'Pipeline em aberto',
      value: formatCurrency(pipelineValue),
      description: `${opportunityCount} oportunidade(s) detectada(s).`,
      badge: pipelineValue > 0 ? 'Em movimento' : 'Sem pipeline registrado',
      tone: pipelineValue > 0 ? 'blue' : 'slate',
      icon: GitBranch,
    },
    {
      title: 'Pedidos confirmados',
      value: salesMetrics?.quantidadeVendas ?? stats.totalOrders,
      description: 'Pedidos capturados no NITRUS e dados comerciais disponíveis.',
      badge: `${salesMetrics?.quantidadeEntregues ?? 0} entregues`,
      tone: 'blue',
      icon: ShoppingCart,
    },
    {
      title: 'Conversas ativas',
      value: stats.activeConversations,
      description: 'Oportunidades em atendimento agora.',
      badge: `${stats.waitingQueue} aguardando`,
      tone: stats.waitingQueue > 0 ? 'amber' : 'green',
      icon: MessageSquare,
    },
    {
      title: 'Leads aguardando',
      value: stats.waitingQueue,
      description: 'Conversas que precisam de resposta comercial.',
      badge: operationStatus,
      tone: operationTone,
      icon: Headphones,
    },
    {
      title: 'Clientes cadastrados',
      value: customersData?.total ?? stats.totalCustomers,
      description: `${activeCustomers} cliente(s) com interação recente.`,
      badge: `${recurringCustomers} recorrentes`,
      tone: 'blue',
      icon: Users,
    },
    {
      title: 'Produtos cadastrados',
      value: productsData?.total ?? stats.totalProducts,
      description: 'Catálogo comercial disponível para atendimento e propostas.',
      badge: `${products.filter((p) => p.stock > 0).length} com estoque`,
      tone: 'slate',
      icon: Package,
    },
    {
      title: 'Taxa de retenção',
      value: formatPercent(retentionRate),
      description: 'Estimativa baseada em receita vendida e retida.',
      badge: retentionRate >= 50 ? 'Boa retenção' : 'Revisar recompra',
      tone: retentionRate >= 50 ? 'green' : 'amber',
      icon: HeartHandshake,
    },
    {
      title: 'Performance da IA',
      value: `${stats.botResolved}%`,
      description: `${agentStatus?.online ? 'IA online' : 'IA sem status online'} no painel.`,
      badge: agentStatus?.model ?? (stats.aiOnline ? 'Online' : 'Local'),
      tone: stats.aiOnline || agentStatus?.online ? 'green' : 'amber',
      icon: Bot,
    },
  ];

  const nav: DashboardNavigationItem[] = [
    { label: 'Visão geral', id: 'visao-geral', icon: BarChart3 },
    { label: 'IA', id: 'ia', icon: Brain },
    { label: 'Pipeline', id: 'pipeline', icon: GitBranch },
    { label: 'Leads', id: 'leads', icon: Target },
    { label: 'Clientes', id: 'clientes', icon: Users },
    { label: 'Produtos', id: 'produtos', icon: Package },
    { label: 'Operação', id: 'operacao', icon: Gauge },
  ];

  const periodOptions = [
    { value: 'today', label: 'Hoje' },
    { value: '7d', label: '7 dias' },
    { value: '30d', label: '30 dias' },
    { value: 'month', label: 'Este mês' },
  ];
  const productOptions = [{ value: '', label: 'Produtos' }, ...products.map((p) => ({ value: p.id, label: p.name }))];
  const customerOptions = [{ value: '', label: 'Clientes' }, ...customers.map((c) => ({ value: c.id, label: c.name }))];
  const statusOptions = [
    { value: 'all', label: 'Status' },
    { value: 'active', label: 'Ativas' },
    { value: 'waiting', label: 'Aguardando' },
    { value: 'closed', label: 'Encerradas' },
  ];
  const channelOptions = [{ value: '', label: 'Canais' }, ...Object.entries(CHANNEL_LABELS).map(([value, label]) => ({ value, label }))];

  const quickQuestions = [
    'Por que minhas vendas caíram?',
    'Quais clientes devo priorizar hoje?',
    'Quais produtos estão parados?',
    'Quais leads estão mais quentes?',
    'O que devo fazer para vender mais esta semana?',
    'Quais clientes posso reativar?',
  ];

  const recommendations = [
    {
      title: 'Responder leads em espera',
      reason: `${stats.waitingQueue} conversa(s) aguardando no momento.`,
      impact: 'Melhora velocidade comercial e reduz abandono.',
      priority: stats.waitingQueue > 0 ? 'Alta' : 'Baixa',
      action: 'Abrir Central de Conversão',
      href: '/atendimento',
    },
    {
      title: 'Reativar clientes parados',
      reason: `${retentionCustomers.length} cliente(s) com histórico podem esfriar.`,
      impact: 'Recupera receita com menor custo de aquisição.',
      priority: retentionCustomers.length > 0 ? 'Media' : 'Baixa',
      action: 'Ver lista de retenção',
    },
    {
      title: 'Promover produtos com baixa saída',
      reason: 'Produtos sem movimento precisam de abordagem comercial ou revisão.',
      impact: 'Aumenta giro de catálogo e qualidade das campanhas.',
      priority: products.length > 0 ? 'Media' : 'Baixa',
      action: 'Analisar catálogo',
    },
    {
      title: 'Usar IA para gerar propostas',
      reason: 'O Copiloto pode acelerar resposta e qualificação.',
      impact: 'Reduz tempo médio de atendimento.',
      priority: 'Media',
      action: 'Perguntar ao NITRUS',
    },
  ];

  return (
    <div className={cn('relative min-h-full', presentationMode && 'presentation-mode')}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-500/8" />
        <div className="absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-red-500/10 blur-3xl dark:bg-red-500/8" />
      </div>

      <div className="relative space-y-8">
        {!presentationMode && <SetupChecklist />}

        <DashboardExecutiveHeader
          firstName={user?.name?.split(' ')[0] ?? 'usuário'}
          operationStatus={operationStatus}
          operationTone={operationTone}
          presentationMode={presentationMode}
          isFetching={isFetching}
          onRefresh={() => refetch()}
          onTogglePresentation={togglePresentationMode}
        />

        <DashboardInternalNav
          items={nav}
          activeSection={activeSection}
          isHidden={isDashboardNavHidden}
          presentationMode={presentationMode}
          filtersOpen={filtersOpen}
          period={period}
          productFilter={productFilter}
          customerFilter={customerFilter}
          statusFilter={statusFilter}
          channelFilter={channelFilter}
          periodOptions={periodOptions}
          productOptions={productOptions}
          customerOptions={customerOptions}
          statusOptions={statusOptions}
          channelOptions={channelOptions}
          onPeriodChange={setPeriod}
          onProductChange={setProductFilter}
          onCustomerChange={setCustomerFilter}
          onStatusChange={setStatusFilter}
          onChannelChange={setChannelFilter}
          onToggleFilters={() => setFiltersOpen((value) => !value)}
        />

        <BusinessSummarySection metrics={kpis} presentationMode={presentationMode} />

        <NitrosExecutiveSummary
          diagnosis={executiveDiagnosis}
          recommendedAction={recommendedAction}
          expectedImpact={expectedImpact}
          mainRisk={mainRisk}
          mainOpportunity={mainOpportunity}
          agentOnline={Boolean(agentStatus?.online)}
          connectedChannels={channels?.filter((channel) => channel.connected).length ?? 0}
        />

        <RevenueForecastSection
          data={{
            conservative: conservativeForecast,
            probable: probableForecast,
            optimistic: optimisticForecast,
            soldRevenue: revenueSold,
            openPipeline: pipelineValue,
            probableRate,
          }}
        />

        <PipelineHealthSection
          data={{
            health: pipelineHealth,
            tone: pipelineTone,
            bottleneck: gargalo,
            openPipeline: pipelineValue,
            opportunityCount,
            conversionRate,
            atRiskCount: stats.waitingQueue,
            stages: salesMetrics?.funil ?? [],
          }}
        />

        <Section id="leads" title="Pontuação de leads" subtitle="Classificação de potencial comercial calculada localmente com conversas, histórico e sinais de intenção." icon={Target} hidden={presentationMode}>
          {leadScores.length ? (
            <DataTable headers={['Cliente', 'Canal', 'Score', 'Classificação', 'Motivo', 'Última interação', 'Próxima ação']}>
              {leadScores.map((lead) => (
                <tr key={lead.id}>
                  <td className="whitespace-nowrap px-3 py-2.5 font-semibold text-gray-900 dark:text-white">{lead.customerName}</td>
                  <td className="px-3 py-2.5"><ChannelBadge channel={lead.channel} /></td>
                  <td className="px-3 py-2.5">
                    <div className="flex min-w-32 items-center gap-2">
                      <div className="h-2 flex-1 rounded-full bg-gray-100 dark:bg-gray-800">
                        <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-red-500" style={{ width: `${lead.score}%` }} />
                      </div>
                      <span className="font-bold tabular-nums">{lead.score}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold ring-1', statusToneClass(lead.label === 'Quente' || lead.label === 'Cliente fiel' ? 'green' : lead.label === 'Em risco' ? 'red' : lead.label === 'Morno' ? 'amber' : 'slate'))}>
                      {lead.label}
                    </span>
                  </td>
                  <td className="min-w-52 px-3 py-2.5 text-gray-600 dark:text-gray-300">{lead.reason}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-gray-500">{formatRelativeTime(lead.lastInteraction)}</td>
                  <td className="min-w-44 px-3 py-2.5 text-gray-700 dark:text-gray-300">{lead.nextAction}</td>
                </tr>
              ))}
            </DataTable>
          ) : (
            <EmptyInsight text="Sem leads suficientes para pontuação. Novas conversas e pedidos permitirão classificar clientes por potencial." />
          )}
        </Section>

        <Section id="rotina" title="Rotina comercial de hoje" subtitle="Lista dinâmica calculada na interface. Nenhuma tarefa é persistida no banco." icon={Calendar} hidden={presentationMode}>
          <div className="grid gap-4 lg:grid-cols-2">
            {routineItems.map((item) => (
              <div key={`${item.description}-${item.origin}`} className="rounded-2xl border border-gray-200/80 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-gray-900/90">
                <div className="flex items-start justify-between gap-3">
                  <span className={cn('rounded-full px-2.5 py-1 text-xs font-bold ring-1', statusToneClass(item.priority === 'Alta' ? 'red' : item.priority === 'Media' ? 'amber' : 'slate'))}>
                    Prioridade {item.priority}
                  </span>
                  <span className="text-xs text-gray-500">{item.origin}</span>
                </div>
                <h3 className="mt-4 font-semibold text-gray-950 dark:text-white">{item.description}</h3>
                <p className="mt-2 text-sm text-gray-500">{item.impact}</p>
                {item.href ? (
                  <Link to={item.href} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700">
                    {item.action} <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <a href="#pergunte" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700">
                    {item.action} <ArrowRight className="h-4 w-4" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </Section>

        <Section id="operacao" title="Capacidade de atendimento" subtitle="Carga operacional, velocidade e resolução por IA." icon={Headphones}>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
            <MiniMetric label="Ativas" value={stats.activeConversations} tone="blue" />
            <MiniMetric label="Aguardando" value={stats.waitingQueue} tone={stats.waitingQueue ? 'amber' : 'green'} />
            <MiniMetric label="Encerradas" value={stats.closedConversations} tone="slate" />
            <MiniMetric label="Tempo médio" value={stats.avgResponseTime} tone="blue" />
            <MiniMetric label="Resolvido por IA" value={`${stats.botResolved}%`} tone="green" />
            <MiniMetric label="Carga estimada" value={operationStatus} tone={operationTone} />
          </div>
          <div className="rounded-2xl border border-gray-200/80 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-gray-900/90">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {operationStatus === 'Saudável'
                ? 'Operação saudável no momento.'
                : operationStatus === 'Atenção'
                  ? 'Use o Copiloto para acelerar respostas e priorize leads quentes.'
                  : 'Fila alta. Priorize leads quentes e distribua atendimento antes de iniciar novas campanhas.'}
            </p>
          </div>
        </Section>

        <Section id="clientes" title="Clientes mais fiéis" subtitle="Ordenados por valor comprado, quantidade de pedidos e recorrência." icon={HeartHandshake} hidden={presentationMode}>
          {loyalCustomers.length ? (
            <DataTable headers={['Cliente', 'Empresa', 'Total comprado', 'Pedidos', 'Última interação', 'Status', 'Ação sugerida']}>
              {loyalCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-3">
                      <Avatar name={customer.name} size="sm" />
                      <span className="font-semibold text-gray-900 dark:text-white">{customer.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-gray-600 dark:text-gray-300">{customer.company || '-'}</td>
                  <td className="px-3 py-2.5 font-semibold tabular-nums">{formatCurrency(customer.totalSpent)}</td>
                  <td className="px-3 py-2.5 tabular-nums">{customer.ordersCount}</td>
                  <td className="px-3 py-2.5 text-gray-500">{formatRelativeTime(customer.lastContact)}</td>
                  <td className="px-3 py-2.5">
                    <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold ring-1', statusToneClass(getCustomerStatus(customer) === 'Em risco' ? 'red' : getCustomerStatus(customer) === 'Fiel' ? 'green' : 'blue'))}>
                      {getCustomerStatus(customer)}
                    </span>
                  </td>
                  <td className="min-w-44 px-3 py-2.5 text-gray-700 dark:text-gray-300">{getCustomerAction(customer)}</td>
                </tr>
              ))}
            </DataTable>
          ) : (
            <EmptyInsight text="Ainda não há clientes suficientes para identificar fidelidade e recorrência." />
          )}
        </Section>

        <Section id="clientes-recentes" title="Clientes recentes" subtitle="Leads e clientes mais novos, com próxima ação recomendada." icon={Users} hidden={presentationMode}>
          {recentCustomers.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {recentCustomers.map((customer) => (
                <div key={customer.id} className="rounded-2xl border border-gray-200/80 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-gray-900/90">
                  <div className="flex items-center gap-3">
                    <Avatar name={customer.name} size="md" />
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-gray-900 dark:text-white">{customer.name}</p>
                      <p className="truncate text-xs text-gray-500">{customer.company || customer.city || 'Cliente'}</p>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-2 text-sm">
                    <p className="flex justify-between"><span className="text-gray-500">Última interação</span><strong>{formatRelativeTime(customer.lastContact)}</strong></p>
                    <p className="flex justify-between"><span className="text-gray-500">Status</span><strong>{customer.ordersCount > 0 ? 'Cliente ativo' : 'Novo lead'}</strong></p>
                    <p className="text-gray-600 dark:text-gray-300">{customer.ordersCount > 0 ? 'Sugerir recompra ou produto complementar.' : 'Qualificar necessidade e prazo de compra.'}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyInsight text="Sem clientes recentes carregados no período." />
          )}
        </Section>

        <Section id="retencao" title="Retenção e reativação" subtitle="Clientes com histórico relevante que podem estar esfriando." icon={RefreshCw} hidden={presentationMode}>
          {retentionCustomers.length ? (
            <DataTable headers={['Cliente', 'Valor histórico', 'Última compra/interação', 'Dias sem compra', 'Risco', 'Sugestão de abordagem']}>
              {retentionCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td className="px-3 py-2.5 font-semibold text-gray-900 dark:text-white">{customer.name}</td>
                  <td className="px-3 py-2.5 font-semibold tabular-nums">{formatCurrency(customer.totalSpent)}</td>
                  <td className="px-3 py-2.5 text-gray-500">{formatDate(customer.lastContact)}</td>
                  <td className="px-3 py-2.5 tabular-nums">{daysSince(customer.lastContact)}</td>
                  <td className="px-3 py-2.5">
                    <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold ring-1', statusToneClass(daysSince(customer.lastContact) > 90 ? 'red' : 'amber'))}>
                      {daysSince(customer.lastContact) > 90 ? 'Alto' : 'Moderado'}
                    </span>
                  </td>
                  <td className="min-w-64 px-3 py-2.5 text-gray-700 dark:text-gray-300">
                    {daysSince(customer.lastContact) > 90 ? 'Retomada de conversa com condição especial.' : 'Follow-up de recompra ou produto relacionado.'}
                  </td>
                </tr>
              ))}
            </DataTable>
          ) : (
            <EmptyInsight text="Nenhum cliente em risco de retenção detectado com os dados atuais." />
          )}
        </Section>

        <Section id="produtos" title="Produtos e catálogo comercial" subtitle="Catálogo disponível para atendimento, propostas e campanhas." icon={Package} hidden={presentationMode}>
          <div className="flex flex-col gap-3 rounded-2xl border border-gray-200/80 bg-white/90 p-4 shadow-sm dark:border-white/10 dark:bg-gray-900/90 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-gray-500">
              Quantidade vendida e receita por produto dependem de detalhamento de itens nos pedidos. Quando o backend fornecer esses dados, o painel pode preencher essas colunas.
            </p>
            <Select
              className="md:w-56"
              aria-label="Ordenar produtos"
              value={productSort}
              onChange={(e) => setProductSort(e.target.value as ProductSort)}
              options={[
                { value: 'best', label: 'Mais vendidos' },
                { value: 'worst', label: 'Menos vendidos' },
                { value: 'revenue', label: 'Maior receita' },
                { value: 'idle', label: 'Sem movimento' },
                { value: 'recent', label: 'Mais recentes' },
                { value: 'az', label: 'A-Z' },
              ]}
            />
          </div>
          {productRows.length ? (
            <DataTable headers={['Nome', 'Código', 'Categoria', 'Preço', 'Estoque', 'Status', 'Qtd. vendida', 'Receita', 'Última atualização', 'Ações']}>
              {productRows.map((product) => (
                <tr key={product.id}>
                  <td className="min-w-52 px-3 py-2.5 font-semibold text-gray-900 dark:text-white">{product.name}</td>
                  <td className="px-3 py-2.5 text-gray-500">{product.code || '-'}</td>
                  <td className="px-3 py-2.5 text-gray-600 dark:text-gray-300">{product.category || '-'}</td>
                  <td className="px-3 py-2.5 font-semibold tabular-nums">{formatCurrency(product.price)}</td>
                  <td className="px-3 py-2.5 tabular-nums">{product.stock}</td>
                  <td className="px-3 py-2.5">
                    <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold ring-1', statusToneClass(product.stock > 10 ? 'green' : product.stock > 0 ? 'amber' : 'red'))}>
                      {product.stock > 10 ? 'Disponível' : product.stock > 0 ? 'Baixo estoque' : 'Sem estoque'}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-gray-500">Sem dado</td>
                  <td className="px-3 py-2.5 text-gray-500">Sem dado</td>
                  <td className="px-3 py-2.5 text-gray-500">{product.synced ? 'Sincronizado' : 'Local'}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex min-w-48 flex-nowrap gap-1.5">
                      <Button type="button" size="sm" variant="outline" className="px-2 text-xs" onClick={() => setSelectedProduct(product)}>Detalhes</Button>
                      <Button type="button" size="sm" variant="outline" className="px-2 text-xs" onClick={() => setSelectedProduct(product)}>Editar</Button>
                      <Button type="button" size="sm" variant="outline" className="px-2 text-xs" onClick={() => setSelectedProduct(product)}>Pedidos</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </DataTable>
          ) : (
            <EmptyInsight text="Nenhum produto encontrado com os filtros atuais." />
          )}
        </Section>

        <Section id="desempenho" title="Desempenho comercial" subtitle="Evolução no período selecionado e indicadores de venda." icon={TrendingUp}>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MiniMetric label="Ticket médio" value={formatCurrency(ticketMedio)} tone="blue" />
            <MiniMetric label="Quantidade de pedidos" value={filteredOrders.length || salesMetrics?.quantidadeVendas || 0} tone="slate" />
            <MiniMetric label="Valor total vendido" value={formatCurrency(revenueSold)} tone="green" />
            <MiniMetric label="Receita retida" value={formatCurrency(retainedRevenue)} tone="green" />
            <MiniMetric label="Clientes ativos" value={activeCustomers} tone="blue" />
            <MiniMetric label="Clientes recorrentes" value={recurringCustomers} tone="green" />
            <MiniMetric label="Conversão estimada" value={formatPercent(conversionRate)} tone="amber" />
            <MiniMetric label="Evolução" value={ordersChart.length ? `${ordersChart.length} pontos` : 'Sem série'} tone="slate" />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-3xl border border-gray-200/80 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-gray-900/90">
              <h3 className="font-semibold text-gray-900 dark:text-white">Vendas e conversas</h3>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={conversationsChart}>
                  <defs>
                    <linearGradient id="dashConversations" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CHART.blue} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={CHART.blue} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="dashCustomers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CHART.red} stopOpacity={0.25} />
                      <stop offset="100%" stopColor={CHART.red} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} className="stroke-gray-200 dark:stroke-gray-800" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="conversas" name="Conversas" stroke={CHART.blue} fill="url(#dashConversations)" strokeWidth={3} />
                  <Area type="monotone" dataKey="clientes" name="Clientes" stroke={CHART.red} fill="url(#dashCustomers)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="rounded-3xl border border-gray-200/80 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-gray-900/90">
              <h3 className="font-semibold text-gray-900 dark:text-white">Pedidos e velocidade</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={responseTimeChart}>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} className="stroke-gray-200 dark:stroke-gray-800" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Line type="monotone" dataKey="conversas" name="Tempo (min)" stroke={CHART.blue} strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Section>

        <Section id="pergunte" title="Pergunte ao NITRUS" subtitle="Use o agente existente para perguntas em linguagem natural dentro do dashboard." icon={Bot} hidden={presentationMode}>
          <div className="grid gap-4 lg:grid-cols-5">
            <div className="rounded-3xl border border-gray-200/80 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-gray-900/90 lg:col-span-2">
              <div className="space-y-3">
                <Input
                  label="Pergunta"
                  value={askText}
                  onChange={(e) => setAskText(e.target.value)}
                  placeholder="Ex.: Quais clientes devo priorizar hoje?"
                />
                <Button
                  type="button"
                  className="w-full"
                  loading={askMutation.isPending}
                  onClick={() => {
                    const message = askText.trim();
                    if (message) askMutation.mutate(message);
                  }}
                >
                  <Sparkles className="h-4 w-4" /> Perguntar ao NITRUS
                </Button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {quickQuestions.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => {
                      setAskText(question);
                      askMutation.mutate(question);
                    }}
                    className="rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:border-blue-300 hover:text-blue-700 dark:border-white/10 dark:text-gray-300"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-blue-200/80 bg-blue-50/70 p-5 shadow-sm dark:border-blue-900/40 dark:bg-blue-950/20 lg:col-span-3">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700 dark:text-blue-300">Resposta do NITRUS</p>
              <div className="mt-4 min-h-40 whitespace-pre-wrap rounded-2xl bg-white/80 p-4 text-sm leading-relaxed text-gray-700 shadow-sm dark:bg-gray-900/80 dark:text-gray-200">
                {askMutation.isPending
                  ? 'Analisando os dados disponíveis no NITRUS...'
                  : agentAnswer || 'Faça uma pergunta ou use uma sugestão rápida para receber uma análise comercial.'}
              </div>
            </div>
          </div>
        </Section>

        <Section id="credibilidade" title="Credibilidade e operação NITRUS" subtitle="Status dos dados, canais, IA e prontidão operacional." icon={ShieldCheck}>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MiniMetric label="IA" value={agentStatus?.online ? 'Online' : 'Offline'} tone={agentStatus?.online ? 'green' : 'amber'} />
            <MiniMetric label="Modelo" value={agentStatus?.model ?? 'Sem status'} tone="slate" />
            <MiniMetric label="Canais conectados" value={channels?.filter((c) => c.connected).length ?? 0} tone="blue" />
            <MiniMetric label="Prontidão" value={`${readiness}%`} tone={readiness >= 70 ? 'green' : 'amber'} />
            <MiniMetric label="Clientes sincronizados" value={mercosStatus?.syncedCustomers ?? systemStatus?.mercos.syncedCustomers ?? customers.length} tone="blue" />
            <MiniMetric label="Produtos sincronizados" value={mercosStatus?.syncedProducts ?? systemStatus?.mercos.syncedProducts ?? products.length} tone="blue" />
            <MiniMetric label="Pedidos sincronizados" value={mercosStatus?.syncedOrders ?? systemStatus?.mercos.syncedOrders ?? orders.length} tone="blue" />
            <MiniMetric label="Última atualização" value={mercosStatus?.lastSync ? formatDateTime(mercosStatus.lastSync) : 'Sem sync'} tone="slate" />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-3xl border border-gray-200/80 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-gray-900/90">
              <h3 className="font-semibold text-gray-900 dark:text-white">Canais de conversão</h3>
              {channelVolume.length ? (
                <div className="mt-4 flex items-center gap-4">
                  <ResponsiveContainer width="42%" height={180}>
                    <PieChart>
                      <Pie data={channelVolume} cx="50%" cy="50%" innerRadius={42} outerRadius={66} paddingAngle={4} dataKey="value" strokeWidth={0}>
                        {channelVolume.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<ChartTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-2">
                    {channelVolume.map((ch, i) => (
                      <div key={ch.type} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                          {ch.name}
                        </span>
                        <strong>{ch.value}%</strong>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm text-gray-500">Sem mensagens registradas por canal.</p>
              )}
            </div>
            <div className="rounded-3xl border border-gray-200/80 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-gray-900/90">
              <h3 className="font-semibold text-gray-900 dark:text-white">Status geral do sistema</h3>
              <div className="mt-4 space-y-3 text-sm">
                <p className="flex justify-between gap-4"><span className="text-gray-500">Mercos</span><strong>{mercosStatus?.connected || systemStatus?.mercos.configured ? 'Configurado' : 'Pendente'}</strong></p>
                <p className="flex justify-between gap-4"><span className="text-gray-500">WhatsApp</span><strong>{systemStatus?.whatsapp.connected ? 'Conectado' : 'Verificar'}</strong></p>
                <p className="flex justify-between gap-4"><span className="text-gray-500">Supabase</span><strong>{systemStatus?.supabase.ok ? 'Operacional' : 'Sem status'}</strong></p>
                <p className="flex justify-between gap-4"><span className="text-gray-500">Dados sincronizados</span><strong>{mercosStatus?.connected ? 'Sim' : 'Parcial'}</strong></p>
              </div>
            </div>
          </div>
        </Section>

        <Section id="recomendacoes" title="Recomendações para melhorar performance" subtitle="Próximas ações sugeridas pelo painel a partir da operação atual." icon={Zap}>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {recommendations.map((rec) => (
              <div key={rec.title} className="rounded-2xl border border-gray-200/80 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-gray-900/90">
                <span className={cn('rounded-full px-2.5 py-1 text-xs font-bold ring-1', statusToneClass(rec.priority === 'Alta' ? 'red' : rec.priority === 'Media' ? 'amber' : 'slate'))}>
                  Prioridade {rec.priority}
                </span>
                <h3 className="mt-4 font-semibold text-gray-950 dark:text-white">{rec.title}</h3>
                <p className="mt-2 text-sm text-gray-500">{rec.reason}</p>
                <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">{rec.impact}</p>
                {rec.href ? (
                  <Link to={rec.href} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700">
                    {rec.action} <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <a href="#pergunte" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700">
                    {rec.action} <ArrowRight className="h-4 w-4" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </Section>
      </div>

      <Modal
        open={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        title={selectedProduct?.name ?? 'Produto'}
        footer={<Button variant="outline" onClick={() => setSelectedProduct(null)}>Fechar</Button>}
      >
        {selectedProduct && (
          <div className="space-y-4 text-sm">
            <div className="grid gap-3 sm:grid-cols-2">
              <p><strong>Código:</strong> {selectedProduct.code || '-'}</p>
              <p><strong>Categoria:</strong> {selectedProduct.category || '-'}</p>
              <p><strong>Preço:</strong> {formatCurrency(selectedProduct.price)}</p>
              <p><strong>Estoque:</strong> {selectedProduct.stock}</p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200">
              A edição local de produtos depende do endpoint de atualização no backend. Nenhuma alteração será salva por este modal.
            </div>
            <p className="text-gray-500">
              Pedidos relacionados por item ainda dependem do backend retornar itens de pedido por produto. O painel não inventa dados quando essa relação não está disponível.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
