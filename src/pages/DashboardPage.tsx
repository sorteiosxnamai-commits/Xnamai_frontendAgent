import { ChannelBadge } from '@/components/ui/ChannelBadge';
import { Avatar } from '@/components/ui/Avatar';
import {
  ChartPanel,
  ChartTooltipContent,
  DashboardStatCard,
  InsightBanner,
  ProgressRing,
} from '@/components/dashboard/DashboardWidgets';
import { Loading, Skeleton } from '@/components/ui/EmptyState';
import { useAuth } from '@/contexts/AuthContext';
import { useChannels } from '@/hooks/usePlatform';
import { useDashboard, useConversations, useSalesMetrics } from '@/hooks/useQueries';
import { cn, formatCurrency, formatRelativeTime } from '@/utils';
import type { ChannelType } from '@/types';
import { motion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bot,
  Calendar,
  Clock,
  Headphones,
  Megaphone,
  MessageSquare,
  RefreshCw,
  ShoppingCart,
  Sparkles,
  Star,
  ThumbsUp,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const CHART = { teal: '#0d9488', violet: '#7c3aed', emerald: '#10b981' };

const PIE_COLORS = ['#0d9488', '#ec4899', '#8b5cf6', '#0ea5e9', '#3b82f6', '#6b7280'];

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

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

function formatToday(): string {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());
}

export function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading, refetch, isFetching } = useDashboard();
  const { data: conversations } = useConversations();
  const { data: channels } = useChannels();
  const { data: salesMetrics } = useSalesMetrics();

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-40 w-full rounded-3xl" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))}
        </div>
        <Loading />
      </div>
    );
  }

  if (!data) return null;

  const { stats, conversationsChart, ordersChart, responseTimeChart } = data;
  const queue = (conversations ?? [])
    .filter((c) => c.status === 'waiting' || c.status === 'active')
    .slice(0, 4);
  const conversasSpark = conversationsChart.map((c) => c.conversas);
  const pedidosSpark = ordersChart.map((c) => c.pedidos);
  const channelVolume = buildChannelVolume(channels, conversations);

  const atendimentoResumo = [
    { label: 'Ativas', value: stats.activeConversations, color: 'bg-teal-500' },
    { label: 'Na fila', value: stats.waitingQueue, color: 'bg-amber-500' },
    { label: 'Encerradas', value: stats.closedConversations, color: 'bg-violet-500' },
  ];
  const atendimentoTotal = atendimentoResumo.reduce((s, i) => s + i.value, 0) || 1;

  return (
    <div className="relative min-h-full">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-teal-400/8 blur-3xl dark:bg-teal-500/5" />
        <div className="absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-violet-400/8 blur-3xl dark:bg-violet-500/5" />
      </div>

      <div className="relative space-y-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 dark:bg-teal-950/50 dark:text-teal-300">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-teal-500" />
                </span>
                Ao vivo
              </span>
              <span className="text-sm capitalize text-gray-500 dark:text-gray-400">{formatToday()}</span>
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 dark:text-white lg:text-4xl">
              {getGreeting()},{' '}
              <span className="gradient-text">{user?.name?.split(' ')[0] ?? 'Usuário'}</span>
            </h1>
            <p className="mt-2 max-w-lg text-gray-500 dark:text-gray-400">
              Sua operação multicanal em um painel único — métricas, fila e performance do time.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200/80 bg-white/80 px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm backdrop-blur transition-all hover:bg-white hover:shadow-md disabled:opacity-50 dark:border-gray-800 dark:bg-gray-900/80 dark:text-gray-200 dark:hover:bg-gray-900"
            >
              <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
              Atualizar
            </button>
            <Link
              to="/atendimento"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-600/30 transition-all hover:shadow-teal-600/40 hover:brightness-110"
            >
              <Headphones className="h-4 w-4" />
              Central de Atendimento
            </Link>
          </div>
        </motion.header>

        {/* Hero bento */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid gap-4 lg:grid-cols-12"
        >
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-600 via-teal-700 to-violet-700 p-8 text-white shadow-2xl shadow-teal-900/30 lg:col-span-8">
            <div className="pointer-events-none absolute inset-0 dashboard-grid-bg opacity-40" />
            <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 left-1/4 h-48 w-48 rounded-full bg-violet-400/20 blur-2xl" />

            <div className="relative grid gap-8 sm:grid-cols-3">
              <div>
                <div className="flex items-center gap-2 text-teal-100">
                  <Activity className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Operação</span>
                </div>
                <p className="mt-4 text-5xl font-bold tabular-nums tracking-tight">{stats.activeConversations}</p>
                <p className="mt-1 text-sm text-teal-100/90">conversas ativas agora</p>
                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium backdrop-blur-md">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  {stats.waitingQueue} na fila de espera
                </div>
              </div>
              <div className="border-white/10 sm:border-l sm:pl-8">
                <div className="flex items-center gap-2 text-teal-100">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">SLA</span>
                </div>
                <p className="mt-4 text-5xl font-bold tabular-nums tracking-tight">{stats.avgResponseTime}</p>
                <p className="mt-1 text-sm text-teal-100/90">tempo médio de resposta</p>
                <p className="mt-4 inline-flex items-center gap-1 rounded-lg bg-emerald-500/20 px-2.5 py-1 text-xs font-semibold text-emerald-100">
                  ↓ 18% vs. ontem
                </p>
              </div>
              <div className="border-white/10 sm:border-l sm:pl-8">
                <div className="flex items-center gap-2 text-teal-100">
                  <Star className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Qualidade</span>
                </div>
                <p className="mt-4 text-5xl font-bold tabular-nums tracking-tight">
                  {stats.csat}
                  <span className="text-2xl font-normal text-white/50">/5</span>
                </p>
                <p className="mt-1 text-sm text-teal-100/90">CSAT · NPS {stats.nps}</p>
                <div className="mt-4 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'h-4 w-4 transition-colors',
                        i < Math.floor(stats.csat) ? 'fill-amber-300 text-amber-300 drop-shadow-sm' : 'text-white/20',
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 rounded-3xl border border-gray-200/70 bg-white/90 p-6 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/90 lg:col-span-4">
            <ProgressRing value={stats.botResolved} max={100} label="Bot" color="violet" />
            <ProgressRing value={stats.nps} max={100} label="NPS" color="teal" />
            <ProgressRing value={stats.csat * 20} max={100} label="CSAT" color="emerald" />
            <div className="col-span-3 mt-2 border-t border-gray-100 pt-4 dark:border-gray-800">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Meta mensal</span>
                <span className="font-semibold text-gray-900 dark:text-white">847 / 1.000</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-teal-500 to-violet-500 transition-all duration-1000"
                  style={{ width: '84.7%' }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Vendas */}
        {salesMetrics && (
          <InsightBanner
            icon={ShoppingCart}
            title={`${salesMetrics.quantidadeVendas} vendas confirmadas · ${formatCurrency(salesMetrics.valorTotalVendido)}`}
            description={`Receita retida: ${formatCurrency(salesMetrics.valorRetido)} · ${salesMetrics.quantidadeEntregues} entregues · Pipeline: ${formatCurrency(salesMetrics.valorPipeline)}`}
            delay={0.08}
            action={
              <Link
                to="/relatorios"
                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-600/25 transition-all hover:bg-teal-700"
              >
                Ver métricas <BarChart3 className="h-4 w-4" />
              </Link>
            }
          />
        )}

        {/* AI Insight */}
        <InsightBanner
          icon={Sparkles}
          title="Copiloto IA identificou 12 conversas que podem ser resolvidas automaticamente"
          description="Sugestão: ative o fluxo de FAQ para reduzir a fila em até 23% nas próximas 2 horas."
          delay={0.1}
          action={
            <Link
              to="/copiloto"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition-all hover:bg-violet-700"
            >
              Ver sugestões <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />

        {/* Stats grid */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardStatCard title="Conversas ativas" value={stats.activeConversations} icon={MessageSquare} variant="primary" delay={0.12} sparkline={conversasSpark.length ? conversasSpark : undefined} />
          <DashboardStatCard title="Encerradas" value={stats.closedConversations} icon={Users} delay={0.16} sparkline={conversasSpark.length ? conversasSpark : undefined} />
          <DashboardStatCard title="NPS" value={stats.nps} icon={TrendingUp} deltaUp={stats.nps >= 70} variant="success" delay={0.2} />
          <DashboardStatCard title="Resolvidos pelo bot" value={`${stats.botResolved}%`} icon={Bot} variant="violet" delay={0.24} sparkline={conversasSpark.length ? conversasSpark : undefined} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardStatCard title="Na fila" value={stats.waitingQueue} icon={Headphones} variant="warning" delay={0.28} sparkline={conversasSpark.length ? conversasSpark : undefined} />
          <DashboardStatCard title="Pedidos sync" value={pedidosSpark.reduce((a, b) => a + b, 0)} icon={Megaphone} delay={0.32} sparkline={pedidosSpark.length ? pedidosSpark : undefined} />
          <DashboardStatCard title="CSAT" value={stats.csat ? `${stats.csat}/5` : '—'} icon={ThumbsUp} variant="success" delay={0.36} />
          <DashboardStatCard title="Copiloto IA" value={stats.aiOnline ? 'Online' : 'Offline'} icon={Sparkles} variant={stats.aiOnline ? 'success' : 'warning'} delay={0.4} />
        </div>

        {/* Main charts bento */}
        <div className="grid gap-6 lg:grid-cols-12">
          <ChartPanel
            title="Atendimentos da semana"
            subtitle="Volume de conversas e novos contatos"
            className="lg:col-span-8"
            delay={0.44}
            accent="teal"
            action={
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                <Calendar className="h-3.5 w-3.5" /> 7 dias
              </span>
            }
          >
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={conversationsChart} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="gC" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART.teal} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={CHART.teal} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gV" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART.violet} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={CHART.violet} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="currentColor" className="text-gray-100 dark:text-gray-800/80" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} dy={8} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} dx={-4} />
                <Tooltip content={<ChartTooltipContent />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 13, paddingTop: 20 }} />
                <Area type="monotone" dataKey="conversas" stroke={CHART.teal} strokeWidth={3} fill="url(#gC)" name="Conversas" dot={false} activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }} />
                <Area type="monotone" dataKey="clientes" stroke={CHART.violet} strokeWidth={3} fill="url(#gV)" name="Novos contatos" dot={false} activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartPanel>

          <ChartPanel title="Fila ao vivo" subtitle="Prioridade de atendimento" className="lg:col-span-4" delay={0.48} accent="violet">
            <div className="space-y-2.5">
              {queue.map((conv, i) => (
                <motion.div
                  key={conv.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.06 }}
                  className="group flex items-center gap-3 rounded-xl border border-gray-100/80 bg-gray-50/50 p-3.5 transition-all hover:border-teal-200/60 hover:bg-teal-50/30 hover:shadow-sm dark:border-gray-800 dark:bg-gray-800/30 dark:hover:border-teal-900/50 dark:hover:bg-teal-950/20"
                >
                  <div className="relative">
                    <Avatar name={conv.customerName} size="sm" />
                    {conv.status === 'waiting' && (
                      <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-amber-400 dark:border-gray-900" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{conv.customerName}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <ChannelBadge channel={conv.channel} showLabel={false} />
                      <span className="text-[11px] text-gray-400">{formatRelativeTime(conv.lastMessageAt)}</span>
                    </div>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-teal-600 px-1.5 text-[10px] font-bold text-white shadow-sm">
                      {conv.unreadCount}
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
            <Link
              to="/atendimento"
              className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white transition-all hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
            >
              Abrir central <ArrowRight className="h-4 w-4" />
            </Link>
          </ChartPanel>
        </div>

        {/* Bottom bento */}
        <div className="grid gap-6 lg:grid-cols-3">
          <ChartPanel title="Volume mensal" subtitle="Interações totais" delay={0.52} accent="teal">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={ordersChart} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="currentColor" className="text-gray-100 dark:text-gray-800/80" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar dataKey="pedidos" fill="url(#barGrad)" radius={[8, 8, 0, 0]} name="Interações" />
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#14b8a6" />
                    <stop offset="100%" stopColor="#0d9488" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </ChartPanel>

          <ChartPanel title="Canais" subtitle="Distribuição real de atendimentos" delay={0.56} accent="violet">
            {channelVolume.length === 0 ? (
              <p className="py-12 text-center text-sm text-gray-500">Sem mensagens registradas nos canais.</p>
            ) : (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="50%" height={200}>
                  <PieChart>
                    <Pie data={channelVolume} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={4} dataKey="value" strokeWidth={0}>
                      {channelVolume.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2.5">
                  {channelVolume.map((ch, i) => (
                    <div key={ch.type}>
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="flex items-center gap-1.5 font-medium text-gray-700 dark:text-gray-300">
                          <ChannelBadge channel={ch.type} showLabel={false} />
                          {ch.name}
                        </span>
                        <span className="tabular-nums text-gray-500">{ch.value}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${ch.value}%`, backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </ChartPanel>

          <ChartPanel title="Atendimento hoje" subtitle="Conversas por status" delay={0.6} accent="amber">
            <div className="space-y-4">
              {atendimentoResumo.map((item) => (
                <div key={item.label} className="group">
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
                    <span className="font-bold tabular-nums text-gray-900 dark:text-white">{item.value}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                    <div
                      className={cn('h-full rounded-full transition-all duration-700', item.color)}
                      style={{ width: `${(item.value / atendimentoTotal) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </ChartPanel>
        </div>

        {/* Response time */}
        <ChartPanel
          title="Tempo médio de resposta"
          subtitle="Distribuição por horário · minutos"
          delay={0.64}
          accent="teal"
          action={
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
              <Zap className="h-3.5 w-3.5" /> Melhor: 08h · 1.2 min
            </span>
          }
        >
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={responseTimeChart} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={CHART.teal} />
                  <stop offset="100%" stopColor={CHART.violet} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="currentColor" className="text-gray-100 dark:text-gray-800/80" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} dy={8} />
              <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="conversas"
                stroke="url(#lineGrad)"
                strokeWidth={3}
                dot={{ r: 5, fill: CHART.teal, strokeWidth: 3, stroke: '#fff' }}
                activeDot={{ r: 8, strokeWidth: 2, stroke: '#fff' }}
                name="Tempo (min)"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartPanel>
      </div>
    </div>
  );
}
