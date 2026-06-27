import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useTheme } from '@/contexts/ThemeContext';
import { useNotification } from '@/contexts/NotificationContext';
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

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('empresa');
  const { theme, setTheme } = useTheme();
  const { addToast } = useNotification();

  const handleSave = () => {
    addToast({ title: 'Configurações salvas', message: 'Alterações aplicadas com sucesso', type: 'success' });
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
                <Input label="Nome da empresa" defaultValue="TiroConnect Ltda" />
                <Input label="CNPJ" defaultValue="00.000.000/0001-00" />
                <Input label="Email" defaultValue="contato@tiroconnect.com" />
                <Input label="Telefone" defaultValue="(11) 3000-0000" />
              </div>
            )}

            {activeTab === 'openai' && (
              <div className="space-y-4">
                <Input label="API Key" type="password" placeholder="sk-..." />
                <Select
                  label="Modelo"
                  options={[
                    { value: 'gpt-4o', label: 'GPT-4o' },
                    { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
                    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
                  ]}
                  defaultValue="gpt-4o"
                />
                <Input label="Temperatura" type="number" defaultValue="0.7" />
              </div>
            )}

            {activeTab === 'mercos' && (
              <div className="space-y-4">
                <Input label="Application Token" type="password" placeholder="Token da API Mercos" />
                <Input label="Company Token" type="password" placeholder="Token da empresa" />
                <Input label="URL da API" defaultValue="https://api.mercos.com/v1" />
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

            {!['empresa', 'openai', 'mercos', 'tema'].includes(activeTab) && (
              <p className="text-sm text-gray-500">
                Configurações de {tabs.find((t) => t.id === activeTab)?.label} em breve.
              </p>
            )}

            <div className="mt-6 flex justify-end">
              <Button onClick={handleSave}>Salvar alterações</Button>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
