import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { MercosSettingsPanel } from '@/components/settings/MercosSettingsPanel';
import { DemoNotice } from '@/components/ui/DemoNotice';
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
  { id: 'openai', label: 'OpenAI', icon: Sparkles },
  { id: 'integracoes', label: 'Integrações', icon: Link },
  { id: 'notificacoes', label: 'Notificações', icon: Bell },
  { id: 'seguranca', label: 'Segurança', icon: Key },
  { id: 'tema', label: 'Tema', icon: Palette },
];

const mockUsers = [
  { id: '1', name: 'Ana Silva', email: 'ana@empresa.com', role: 'Admin' },
  { id: '2', name: 'Carlos Mendes', email: 'carlos@empresa.com', role: 'Atendente' },
  { id: '3', name: 'Julia Santos', email: 'julia@empresa.com', role: 'Supervisor' },
];

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('empresa');
  const { theme, setTheme } = useTheme();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const [aiSettings, setAiSettings] = useState(() => aiSettingsStore.get());

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    newMessage: true,
    newLead: false,
    dailyReport: true,
  });

  const [permissions, setPermissions] = useState({
    viewReports: true,
    manageUsers: false,
    manageIntegrations: true,
    exportData: false,
  });

  const handleSave = () => {
    aiSettingsStore.save(aiSettings);
    addToast({
      title: 'Configurações salvas',
      message: aiSettings.enabled && aiSettings.apiKey.startsWith('sk-')
        ? 'OpenAI ativada — Copiloto usará GPT'
        : 'Alterações aplicadas com sucesso',
      type: 'success',
    });
  };

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const togglePermission = (key: keyof typeof permissions) => {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Configurações</h1>
        <p className="text-gray-500 dark:text-gray-400">Gerencie as configurações da plataforma</p>
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
            {activeTab === 'empresa' && (
              <div className="space-y-4">
                <Input label="Nome da empresa" defaultValue="Tironitech Ltda" />
                <Input label="CNPJ" defaultValue="00.000.000/0001-00" />
                <Input label="Email" defaultValue="contato@tironitech.com" />
                <Input label="Telefone" defaultValue="(11) 3000-0000" />
              </div>
            )}

            {activeTab === 'usuarios' && (
              <div className="space-y-3">
                <DemoNotice variant="mock" />
                {mockUsers.map((u) => (
                  <div key={u.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3 dark:border-gray-800">
                    <div>
                      <p className="font-medium">{u.name}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </div>
                    <Badge variant="default">{u.role}</Badge>
                  </div>
                ))}
                <Button variant="outline" onClick={() => addToast({ title: 'Convite enviado', message: 'Link de convite copiado', type: 'info' })}>
                  Convidar usuário
                </Button>
              </div>
            )}

            {activeTab === 'permissoes' && (
              <div className="space-y-3">
                {([
                  ['viewReports', 'Visualizar relatórios'],
                  ['manageUsers', 'Gerenciar usuários'],
                  ['manageIntegrations', 'Gerenciar integrações'],
                  ['exportData', 'Exportar dados'],
                ] as const).map(([key, label]) => (
                  <label key={key} className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-100 p-3 dark:border-gray-800">
                    <span className="text-sm">{label}</span>
                    <input
                      type="checkbox"
                      checked={permissions[key]}
                      onChange={() => togglePermission(key)}
                      className="rounded border-gray-300"
                    />
                  </label>
                ))}
              </div>
            )}

            {activeTab === 'openai' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 rounded-lg border border-violet-200 bg-violet-50 p-3 dark:border-violet-800 dark:bg-violet-900/20">
                  <Badge variant={aiSettings.enabled && aiSettings.apiKey.startsWith('sk-') ? 'success' : 'default'}>
                    {aiSettings.enabled && aiSettings.apiKey.startsWith('sk-') ? 'OpenAI ativa' : 'Modo IA local'}
                  </Badge>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Com API Key, o Copiloto usa GPT com contexto de clientes, produtos e conversas.
                  </p>
                </div>
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={aiSettings.enabled}
                    onChange={(e) => setAiSettings({ ...aiSettings, enabled: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  Ativar OpenAI (desmarque para usar IA contextual local)
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
                    { value: 'gpt-4o-mini', label: 'GPT-4o Mini (recomendado)' },
                    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
                  ]}
                  value={aiSettings.model}
                  onChange={(e) => setAiSettings({ ...aiSettings, model: e.target.value })}
                />
                <Input
                  label="Temperatura"
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  value={String(aiSettings.temperature)}
                  onChange={(e) => setAiSettings({ ...aiSettings, temperature: parseFloat(e.target.value) || 0.7 })}
                />
              </div>
            )}

            {activeTab === 'mercos' && <MercosSettingsPanel />}

            {activeTab === 'integracoes' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-500">Gerencie integrações conectadas na página dedicada.</p>
                <Button variant="outline" onClick={() => navigate('/integracoes')}>
                  Abrir integrações
                </Button>
              </div>
            )}

            {activeTab === 'notificacoes' && (
              <div className="space-y-3">
                {([
                  ['email', 'Notificações por e-mail'],
                  ['push', 'Notificações push no navegador'],
                  ['newMessage', 'Nova mensagem recebida'],
                  ['newLead', 'Novo lead no funil'],
                  ['dailyReport', 'Relatório diário'],
                ] as const).map(([key, label]) => (
                  <label key={key} className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-100 p-3 dark:border-gray-800">
                    <span className="text-sm">{label}</span>
                    <input
                      type="checkbox"
                      checked={notifications[key]}
                      onChange={() => toggleNotification(key)}
                      className="rounded border-gray-300"
                    />
                  </label>
                ))}
              </div>
            )}

            {activeTab === 'seguranca' && (
              <div className="space-y-4">
                <Input label="Senha atual" type="password" placeholder="••••••••" />
                <Input label="Nova senha" type="password" placeholder="••••••••" />
                <Input label="Confirmar nova senha" type="password" placeholder="••••••••" />
                <Button variant="outline" onClick={() => addToast({ title: '2FA', message: 'Autenticação em duas etapas configurada', type: 'success' })}>
                  Ativar autenticação 2FA
                </Button>
              </div>
            )}

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
              </div>
            )}

            {activeTab !== 'mercos' && (
              <div className="mt-6 flex justify-end">
                <Button onClick={handleSave}>Salvar alterações</Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
