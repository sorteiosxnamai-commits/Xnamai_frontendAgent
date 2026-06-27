import { ChannelBadge } from '@/components/ui/ChannelBadge';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { ChartPanel, ChartTooltipContent, DashboardStatCard } from '@/components/dashboard/DashboardWidgets';
import { Loading, Skeleton } from '@/components/ui/EmptyState';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboard } from '@/hooks/useQueries';
import { mockConversations } from '@/data/mocks';
import { cn, formatRelativeTime } from '@/utils';
import type { ChannelType } from '@/types';
import { motion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  Bot,
  Calendar,
  Clock,
  Headphones,
  Megaphone,
  MessageSquare,
  RefreshCw,
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

const CHART_COLORS = {
  teal: '#0d9488',
  violet: '#7c3aed',
  emerald: '#10b981',
  amber: '#f59e0b',
};

const channelVolume: { name: string; value: number; type: ChannelType }[] = [
  { name: 'WhatsApp', value: 42, type: 'whatsapp' },
  { name: 'Instagram', value: 18, type: 'instagram' },
  { name: 'WebChat', value: 15, type: 'webchat' },
  { name: 'Telegram', value: 10, type: 'telegram' },
  { name: 'Facebook', value: 9, type: 'facebook' },
  { name: 'E-mail', value: 6, type: 'email' },
];

const PIE_COLORS = ['#0d9488', '#ec4899', '#8b5cf6', '#0ea5e9', '#3b82f6', '#6b7280'];

const teamPerformance = [
  { name: 'Ana Silva', resolved: 48, avgTime: '1m 12s', rating: 4.9 },
  { name: 'Carlos Rocha', resolved: 41, avgTime: '1m 45s', rating: 4.7 },
  { name: 'Julia Mendes', resolved: 36, avgTime: '2m 03s', rating: 4.8 },
  { name: 'Roberto Lima', resolved: 29, avgTime: '2m 18s', rating: 4.5 },
];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
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

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-80 rounded-2xl lg:col-span-2" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
        <Loading />
      </div>
    );
  }

  if (!data) return null;

  const { stats, conversationsChart, ordersChart, responseTimeChart } = data;
  const recentConversations = mockConversations.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <p className="text-sm font-medium text-primary-600 dark:text-primary-400">
            {formatToday()}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
            {getGreeting()}, {user?.name?.split(' ')[0] ?? 'Usuário'} 👋
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Visão geral da operação multicanal em tempo real
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
            Atualizar
          </button>
          <Link
            to="/atendimento"
            className="flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-primary-600/25 transition-colors hover:bg-primary-700"
          >
            <Headphones className="h-4 w-4" />
            Ir para atendimento
          </Link>
        </div>
      </motion.div>

      {/* Hero KPI strip */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="relative overflow-hidden rounded-2xl border border-primary-200/50 bg-gradient-to-br from-primary-600 via-primary-700 to-violet-700 p-6 text-white shadow-lg shadow-primary-900/20 sm:p-8"
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-8 left-1/3 h-40 w-40 rounded-full bg-violet-400/20 blur-2xl" />

        <div className="relative grid gap-6 sm:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 text-primary-100">
              <Activity className="h-4 w-4" />
              <span className="text-sm font-medium">Operação agora</span>
            </div>
            <p className="mt-3 text-4xl font-bold tracking-tight">{stats.activeConversations}</p>
            <p className="mt-1 text-sm text-primary-100">conversas ativas</p>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              {stats.waitingQueue} aguardando na fila
            </div>
          </div>

          <div className="border-white/10 sm:border-l sm:pl-8">
            <div className="flex items-center gap-2 text-primary-100">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">Tempo médio</span>
            </div>
            <p className="mt-3 text-4xl font-bold tracking-tight">{stats.avgResponseTime}</p>
            <p className="mt-1 text-sm text-primary-100">de resposta</p>
            <p className="mt-3 text-xs text-emerald-200">↓ 18% mais rápido que ontem</p>
          </div>

          <div className="border-white/10 sm:border-l sm:pl-8">
            <div className="flex items-center gap-2 text-primary-100">
              <Star className="h-4 w-4" />
              <span className="text-sm font-medium">Satisfação</span>
            </div>
            <p className="mt-3 text-4xl font-bold tracking-tight">
              {stats.csat}
              <span className="text-2xl font-normal text-primary-200">/5</span>
            </p>
            <p className="mt-1 text-sm text-primary-100">CSAT · NPS {stats.nps}</p>
            <div className="mt-3 flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'h-4 w-4',
                    i < Math.floor(stats.csat) ? 'fill-amber-300 text-amber-300' : 'text-white/30',
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Primary stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard
          title="Conversas ativas"
          value={stats.activeConversations}
          icon={MessageSquare}
          delta="+12%"
          variant="primary"
          delay={0.1}
        />
        <DashboardStatCard
          title="Encerradas hoje"
          value={stats.closedConversations}
          icon={Users}
          delta="+8%"
          variant="default"
          delay={0.15}
        />
        <DashboardStatCard
          title="NPS"
          value={stats.nps}
          icon={TrendingUp}
          delta="Meta: 70"
          deltaUp={stats.nps >= 70}
          variant="success"
          delay={0.2}
        />
        <DashboardStatCard
          title="Resolvidos pelo bot"
          value={`${stats.botResolved}%`}
          icon={Bot}
          delta="+5%"
          variant="violet"
          delay={0.25}
        />
      </div>

      {/* Secondary stats row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardStatCard
          title="Na fila"
          value={stats.waitingQueue}
          icon={Headphones}
          delta="-3"
          deltaUp={false}
          variant="warning"
          delay={0.3}
        />
        <DashboardStatCard
          title="Campanhas enviadas"
          value={stats.campaignsSent.toLocaleString('pt-BR')}
          icon={Megaphone}
          delta="+240"
          variant="default"
          delay={0.35}
        />
        <DashboardStatCard
          title="CSAT"
          value={`${stats.csat}/5`}
          icon={ThumbsUp}
          delta="+0.3"
          variant="success"
          delay={0.4}
        />
        <DashboardStatCard
          title="Copiloto IA"
          value={stats.aiOnline ? 'Online' : 'Offline'}
          icon={Sparkles}
          variant={stats.aiOnline ? 'success' : 'warning'}
          delay={0.45}
        />
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <ChartPanel
          title="Atendimentos da semana"
          subtitle="Conversas e novos contatos por dia"
          className="lg:col-span-2"
          delay={0.5}
          action={
            <span className="flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
              <Calendar className="h-3.5 w-3.5" /> Últimos 7 dias
            </span>
          }
        >
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={conversationsChart} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradConversas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS.teal} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={CHART_COLORS.teal} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradClientes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS.violet} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={CHART_COLORS.violet} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-100 dark:text-gray-800" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9ca3af" axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltipContent />} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 16 }} />
              <Area
                type="monotone"
                dataKey="conversas"
                stroke={CHART_COLORS.teal}
                strokeWidth={2.5}
                fill="url(#gradConversas)"
                name="Conversas"
              />
              <Area
                type="monotone"
                dataKey="clientes"
                stroke={CHART_COLORS.violet}
                strokeWidth={2.5}
                fill="url(#gradClientes)"
                name="Novos contatos"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartPanel>

        {/* Live queue */}
        <ChartPanel title="Fila ao vivo" subtitle="Aguardando atendimento" delay={0.55}>
          <div className="space-y-3">
            {recentConversations
              .filter((c) => c.status === 'waiting' || c.status === 'active')
              .slice(0, 4)
              .map((conv, i) => (
                <motion.div
                  key={conv.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.05 }}
                  className="flex items-center gap-3 rounded-xl border border-gray-100 p-3 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
                >
                  <Avatar name={conv.customerName} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                      {conv.customerName}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <ChannelBadge channel={conv.channel} showLabel={false} />
                      <span className="text-xs text-gray-400">
                        {formatRelativeTime(conv.lastMessageAt)}
                      </span>
                    </div>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-600 px-1.5 text-[10px] font-bold text-white">
                      {conv.unreadCount}
                    </span>
                  )}
                </motion.div>
              ))}
          </div>
          <Link
            to="/atendimento"
            className="mt-4 flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-gray-200 py-2.5 text-sm font-medium text-primary-600 transition-colors hover:border-primary-300 hover:bg-primary-50 dark:border-gray-700 dark:text-primary-400 dark:hover:bg-primary-900/20"
          >
            Ver todas as conversas <ArrowRight className="h-4 w-4" />
          </Link>
        </ChartPanel>
      </div>

      {/* Second charts row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <ChartPanel
          title="Volume mensal"
          subtitle="Interações por mês"
          delay={0.6}
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={ordersChart} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-100 dark:text-gray-800" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#9ca3af" axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltipContent />} />
              <Bar dataKey="pedidos" fill={CHART_COLORS.teal} radius={[6, 6, 0, 0]} name="Interações" />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Canais" subtitle="Distribuição de atendimentos" delay={0.65}>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={channelVolume}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {channelVolume.map((_, index) => (
                  <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {channelVolume.slice(0, 4).map((ch, i) => (
              <div key={ch.type} className="flex items-center gap-2 text-xs text-gray-500">
                <span className="h-2 w-2 rounded-full" style={{ background: PIE_COLORS[i] }} />
                {ch.name} · {ch.value}%
              </div>
            ))}
          </div>
        </ChartPanel>

        <ChartPanel title="Performance do time" subtitle="Atendentes hoje" delay={0.7}>
          <div className="space-y-4">
            {teamPerformance.map((member, i) => (
              <div key={member.name} className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-500 dark:bg-gray-800">
                  {i + 1}
                </span>
                <Avatar name={member.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                    {member.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {member.resolved} resolvidos · {member.avgTime}
                  </p>
                </div>
                <Badge variant="success">{member.rating}</Badge>
              </div>
            ))}
          </div>
        </ChartPanel>
      </div>

      {/* Response time full width */}
      <ChartPanel
        title="Tempo médio de resposta"
        subtitle="Por horário do dia (minutos)"
        delay={0.75}
        action={
          <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
            <Zap className="h-3.5 w-3.5" /> Pico: 12h · 3.5 min
          </span>
        }
      >
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={responseTimeChart} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-100 dark:text-gray-800" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9ca3af" axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey="conversas"
              stroke={CHART_COLORS.teal}
              strokeWidth={2.5}
              dot={{ r: 4, fill: CHART_COLORS.teal, strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6 }}
              name="Tempo (min)"
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartPanel>
    </div>
  );
}
