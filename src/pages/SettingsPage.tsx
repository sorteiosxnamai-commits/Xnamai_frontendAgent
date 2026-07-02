import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  CompanySettingsPanel,
  NotificationsSettingsPanel,
  PermissionsSettingsPanel,
  SecuritySettingsPanel,
} from '@/components/settings/GeneralSettingsPanels';
import { MercosSettingsPanel } from '@/components/settings/MercosSettingsPanel';
import { UsersSettingsPanel } from '@/components/settings/UsersSettingsPanel';
import { WhatsAppSettingsPanel } from '@/components/settings/WhatsAppSettingsPanel';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useTheme } from '@/contexts/ThemeContext';
import { useNotification } from '@/contexts/NotificationContext';
import { aiSettingsStore } from '@/store/aiSettingsStore';
import { motion } from 'framer-motion';
import {
  Bell,
  Building2,
  Key,
  Link,
  MessageCircle,
  Palette,
  Shield,
  Sparkles,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const tabs = [
  { id: 'empresa', label: 'Empresa', icon: Building2 },
  { id: 'usuarios', label: 'Usuários', icon: Users },
  { id: 'permissoes', label: 'Permissões', icon: Shield },
  { id: 'mercos', label: 'Mercos', icon: Link },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { id: 'openai', label: 'OpenAI', icon: Sparkles },
  { id: 'integracoes', label: 'Integrações', icon: Link },
  { id: 'notificacoes', label: 'Notificações', icon: Bell },
  { id: 'seguranca', label: 'Segurança', icon: Key },
  { id: 'tema', label: 'Tema', icon: Palette },
];

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('empresa');
  const { theme, setTheme } = useTheme();
  const { addToast } = useNotification();
  const navigate = useNavigate();
  const [aiSettings, setAiSettings] = useState(() => aiSettingsStore.get());

  const handleSaveOpenAi = () => {
    aiSettingsStore.save(aiSettings);
    addToast({
      title: 'Preferências OpenAI salvas',
      message: 'Em produção o Copiloto usa OPENAI_API_KEY do Render (backend).',
      type: 'success',
    });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Configurações</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Empresa, notificações e segurança persistidos no Supabase
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <nav className="flex gap-2 overflow-x-auto lg:w-56 lg:flex-col lg:gap-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === id
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>

        <div className="flex-1">
          <Card title={tabs.find((t) => t.id === activeTab)?.label ?? 'Configurações'}>
            {activeTab === 'empresa' && <CompanySettingsPanel />}
            {activeTab === 'usuarios' && <UsersSettingsPanel />}
            {activeTab === 'permissoes' && <PermissionsSettingsPanel />}
            {activeTab === 'openai' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 rounded-lg border border-violet-200 bg-violet-50 p-3 dark:border-violet-800 dark:bg-violet-900/20">
                  <Badge variant={aiSettings.enabled && aiSettings.apiKey.startsWith('sk-') ? 'success' : 'default'}>
                    {aiSettings.enabled && aiSettings.apiKey.startsWith('sk-') ? 'OpenAI local' : 'Backend Render'}
                  </Badge>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Em produção o Copiloto usa a chave configurada no Render, não esta tela.
                  </p>
                </div>
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={aiSettings.enabled}
                    onChange={(e) => setAiSettings({ ...aiSettings, enabled: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  Ativar OpenAI local (dev / fallback)
                </label>
                <Input
                  label="API Key"
                  type="password"
                  placeholder="sk-..."
                  value={aiSettings.apiKey}
                  onChange={(e) => setAiSettings({ ...aiSettings, apiKey: e.target.value })}
                />
                <Select
                  label="Modelo"
                  options={[
                    { value: 'gpt-4o', label: 'GPT-4o' },
                    { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
                  ]}
                  value={aiSettings.model}
                  onChange={(e) => setAiSettings({ ...aiSettings, model: e.target.value })}
                />
                <div className="flex justify-end">
                  <Button onClick={handleSaveOpenAi}>Salvar OpenAI local</Button>
                </div>
              </div>
            )}
            {activeTab === 'mercos' && <MercosSettingsPanel />}
            {activeTab === 'whatsapp' && <WhatsAppSettingsPanel />}
            {activeTab === 'integracoes' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-500">Gerencie integrações conectadas na página dedicada.</p>
                <Button variant="outline" onClick={() => navigate('/integracoes')}>
                  Abrir integrações
                </Button>
              </div>
            )}
            {activeTab === 'notificacoes' && <NotificationsSettingsPanel />}
            {activeTab === 'seguranca' && <SecuritySettingsPanel />}
            {activeTab === 'tema' && (
              <div className="space-y-4">
                <Select
                  label="Tema"
                  options={[
                    { value: 'light', label: 'Claro' },
                    { value: 'dark', label: 'Escuro' },
                  ]}
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
                />
                <p className="text-xs text-gray-500">Tema salvo no navegador (localStorage).</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
