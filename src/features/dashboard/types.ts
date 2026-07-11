import type { LucideIcon } from 'lucide-react';
import type { ChannelType } from '@/types';

export type PeriodFilter = 'today' | '7d' | '30d' | 'month';
export type CommercialStatusFilter = 'all' | 'active' | 'waiting' | 'closed';
export type ProductSort = 'best' | 'worst' | 'revenue' | 'idle' | 'recent' | 'az';
export type DashboardTone = 'blue' | 'red' | 'green' | 'amber' | 'slate';

export interface ExecutiveKpi {
  title: string;
  value: string | number;
  description: string;
  badge: string;
  tone: DashboardTone;
  icon: LucideIcon;
}

export interface LeadScore {
  id: string;
  customerName: string;
  channel: ChannelType;
  score: number;
  label: 'Quente' | 'Morno' | 'Frio' | 'Em risco' | 'Cliente fiel';
  reason: string;
  lastInteraction: string;
  nextAction: string;
}

export interface RoutineItem {
  priority: 'Alta' | 'Media' | 'Baixa';
  description: string;
  origin: string;
  impact: string;
  action: string;
  href?: string;
}
