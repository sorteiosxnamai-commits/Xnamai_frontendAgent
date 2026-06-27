import { cn } from '@/utils';
import { motion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from 'lucide-react';

interface DashboardStatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  delta?: string;
  deltaUp?: boolean;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'violet';
  delay?: number;
}

const variants = {
  default: {
    icon: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    accent: 'from-gray-500/5 to-transparent',
  },
  primary: {
    icon: 'bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-400',
    accent: 'from-primary-500/10 to-transparent',
  },
  success: {
    icon: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400',
    accent: 'from-emerald-500/10 to-transparent',
  },
  warning: {
    icon: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400',
    accent: 'from-amber-500/10 to-transparent',
  },
  violet: {
    icon: 'bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400',
    accent: 'from-violet-500/10 to-transparent',
  },
};

export function DashboardStatCard({
  title,
  value,
  icon: Icon,
  delta,
  deltaUp = true,
  variant = 'default',
  delay = 0,
}: DashboardStatCardProps) {
  const v = variants[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="group relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
    >
      <div className={cn('pointer-events-none absolute inset-0 bg-gradient-to-br', v.accent)} />
      <div className="relative flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            {value}
          </p>
          {delta && (
            <div className="mt-2 flex items-center gap-1">
              {deltaUp ? (
                <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5 text-red-500" />
              )}
              <span
                className={cn(
                  'text-xs font-medium',
                  deltaUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500',
                )}
              >
                {delta}
              </span>
              <span className="text-xs text-gray-400">vs. semana anterior</span>
            </div>
          )}
        </div>
        <div
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-transform group-hover:scale-105',
            v.icon,
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}

interface ChartPanelProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  delay?: number;
}

export function ChartPanel({ title, subtitle, children, action, className, delay = 0 }: ChartPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={cn(
        'rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900',
        className,
      )}
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
          {subtitle && <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </motion.div>
  );
}

export function ChartTooltipContent({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white/95 px-4 py-3 shadow-xl backdrop-blur dark:border-gray-700 dark:bg-gray-900/95">
      <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 text-sm">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-gray-600 dark:text-gray-300">{entry.name}:</span>
          <span className="font-semibold text-gray-900 dark:text-white">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}
