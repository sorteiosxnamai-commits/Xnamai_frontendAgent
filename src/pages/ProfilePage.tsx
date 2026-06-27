import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { motion } from 'framer-motion';
import { LogOut, Mail, Shield, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ProfilePage() {
  const { user, logout } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSave = () => {
    addToast({ title: 'Perfil atualizado', message: 'Suas informações foram salvas', type: 'success' });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Perfil</h1>
        <p className="text-gray-500 dark:text-gray-400">Gerencie suas informações pessoais</p>
      </div>

      <Card>
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <Avatar name={user?.name ?? 'U'} size="lg" />
          <div className="text-center sm:text-left">
            <h2 className="text-xl font-semibold">{user?.name}</h2>
            <p className="flex items-center justify-center gap-1 text-sm text-gray-500 sm:justify-start">
              <Mail className="h-4 w-4" /> {user?.email}
            </p>
            <p className="flex items-center justify-center gap-1 text-sm text-gray-500 sm:justify-start">
              <Shield className="h-4 w-4" /> {user?.role}
            </p>
            <p className="flex items-center justify-center gap-1 text-sm text-gray-500 sm:justify-start">
              <Building2 className="h-4 w-4" /> {user?.company}
            </p>
          </div>
        </div>
      </Card>

      <Card title="Informações pessoais">
        <div className="space-y-4">
          <Input label="Nome completo" defaultValue={user?.name} />
          <Input label="Email" type="email" defaultValue={user?.email} />
          <Input label="Cargo" defaultValue={user?.role} />
          <Input label="Empresa" defaultValue={user?.company} />
          <div className="flex gap-3">
            <Button onClick={handleSave}>Salvar</Button>
            <Button variant="danger" onClick={handleLogout}>
              <LogOut className="h-4 w-4" /> Sair
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
