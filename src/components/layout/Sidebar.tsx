import { Logo } from '@/components/layout/Logo';
import { cn } from '@/utils';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart3,
  Bot,
  ChevronLeft,
  GitBranch,
  Headphones,
  LayoutDashboard,
  Link2,
  LogOut,
  Megaphone,
  Radio,
  Settings,
  Sparkles,
  UserCircle,
  Users,
  X,
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const navSections = [
  {
    title: 'Operação',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/atendimento', icon: Headphones, label: 'Central de Atendimento' },
      { to: '/canais', icon: Radio, label: 'Canais' },
      { to: '/contatos', icon: Users, label: 'Contatos' },
    ],
  },
  {
    title: 'Automação & Vendas',
    items: [
      { to: '/robo', icon: Bot, label: 'Robô de Atendimento' },
      { to: '/copiloto', icon: Sparkles, label: 'Copiloto IA' },
      { to: '/funil', icon: GitBranch, label: 'Funil de Vendas' },
      { to: '/campanhas', icon: Megaphone, label: 'Campanhas' },
    ],
  },
  {
    title: 'Gestão',
    items: [
      { to: '/relatorios', icon: BarChart3, label: 'Relatórios' },
      { to: '/integracoes', icon: Link2, label: 'Integrações' },
      { to: '/configuracoes', icon: Settings, label: 'Configurações' },
      { to: '/perfil', icon: UserCircle, label: 'Perfil' },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleExitToLanding = () => {
    onMobileClose();
    logout();
    navigate('/');
  };

  const content = (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-gray-200 bg-white transition-all duration-300 dark:border-gray-800 dark:bg-gray-900',
        collapsed ? 'w-[72px]' : 'w-64',
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4 dark:border-gray-800">
        {!collapsed && <Logo size="sm" showCompany />}
        <button
          onClick={onToggle}
          className="hidden rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 lg:block dark:hover:bg-gray-800"
        >
          <ChevronLeft className={cn('h-5 w-5 transition-transform', collapsed && 'rotate-180')} />
        </button>
        <button
          onClick={onMobileClose}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 lg:hidden dark:hover:bg-gray-800"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin">
        {navSections.map((section) => (
          <div key={section.title} className="mb-4">
            {!collapsed && (
              <p className="mb-2 px-6 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                {section.title}
              </p>
            )}
            <ul className="space-y-0.5 px-3">
              {section.items.map(({ to, icon: Icon, label }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    onClick={onMobileClose}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100',
                        collapsed && 'justify-center px-2',
                      )
                    }
                    title={collapsed ? label : undefined}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {!collapsed && <span className="flex-1">{label}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-gray-200 p-3 dark:border-gray-800">
        <button
          type="button"
          onClick={handleExitToLanding}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20',
            collapsed && 'justify-center px-2',
          )}
          title={collapsed ? 'Sair da plataforma' : undefined}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Sair da plataforma</span>}
        </button>
      </div>

      {!collapsed && (
        <div className="border-t border-gray-200 p-4 dark:border-gray-800">
          <div className="rounded-lg bg-gradient-to-br from-primary-50 to-violet-50 p-3 dark:from-primary-900/20 dark:to-violet-900/20">
            <p className="text-xs font-medium text-primary-800 dark:text-primary-300">Teste grátis 5 dias</p>
            <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
              Treinamento e suporte inclusos
            </p>
          </div>
        </div>
      )}
    </aside>
  );

  return (
    <>
      <div className="hidden lg:block">{content}</div>
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={onMobileClose}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 lg:hidden"
            >
              {content}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
