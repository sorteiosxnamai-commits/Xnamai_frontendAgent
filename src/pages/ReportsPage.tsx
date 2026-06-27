import { Card } from '@/components/ui/Card';
import { Loading } from '@/components/ui/EmptyState';
import { useDashboard } from '@/hooks/useQueries';
import { motion } from 'framer-motion';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function ReportsPage() {
  const { data, isLoading } = useDashboard();

  if (isLoading) return <Loading />;

  const channelData = [
    { name: 'WhatsApp', value: 45 },
    { name: 'Instagram', value: 25 },
    { name: 'Site', value: 20 },
    { name: 'Email', value: 10 },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Relatórios</h1>
        <p className="text-gray-500 dark:text-gray-400">Análises e métricas de desempenho</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Conversas por dia">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data?.conversationsChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="conversas" fill="#2563eb" name="Conversas" radius={[4, 4, 0, 0]} />
              <Bar dataKey="clientes" fill="#10b981" name="Clientes" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Canais de atendimento">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={channelData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {channelData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Evolução de pedidos" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data?.ordersChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="pedidos" stroke="#2563eb" strokeWidth={2} name="Pedidos" />
              <Line type="monotone" dataKey="clientes" stroke="#10b981" strokeWidth={2} name="Clientes" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </motion.div>
  );
}
