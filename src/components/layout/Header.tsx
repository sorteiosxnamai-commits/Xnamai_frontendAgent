import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Search } from '@/components/ui/Search';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { useTheme } from '@/contexts/ThemeContext';
import { cn, formatRelativeTime } from '@/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Building2, Menu, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-900 lg:px-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onMenuClick} className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
        <Search placeholder="Pesquisar..." className="hidden w-72 md:block" />
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </Button>

          <AnimatePresence>
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900"
                >
                  <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
                    <h3 className="font-semibold">Notificações</h3>
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-primary-600 hover:underline dark:text-primary-400"
                    >
                      Marcar todas como lidas
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => markAsRead(n.id)}
                        className={cn(
                          'flex w-full flex-col gap-0.5 border-b border-gray-100 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800',
                          !n.read && 'bg-primary-50/50 dark:bg-primary-900/10',
                        )}
                      >
                        <span className="text-sm font-medium">{n.title}</span>
                        <span className="text-xs text-gray-500">{n.message}</span>
                        <span className="text-xs text-gray-400">{formatRelativeTime(n.createdAt)}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <div className="hidden items-center gap-3 border-l border-gray-200 pl-3 md:flex dark:border-gray-700">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.name}</p>
            <p className="flex items-center justify-end gap-1 text-xs text-gray-500">
              <Building2 className="h-3 w-3" />
              {user?.company}
            </p>
          </div>
          <button onClick={() => navigate('/perfil')}>
            <Avatar name={user?.name ?? 'U'} size="md" />
          </button>
        </div>
      </div>
    </header>
  );
}
