import { AppLayout } from '@/layouts/AppLayout';
import { CampaignsPage } from '@/pages/CampaignsPage';
import { ChannelsPage } from '@/pages/ChannelsPage';
import { ChatbotPage } from '@/pages/ChatbotPage';
import { ConversationsPage } from '@/pages/ConversationsPage';
import { CopilotPage } from '@/pages/CopilotPage';
import { CustomersPage } from '@/pages/CustomersPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { FunnelPage } from '@/pages/FunnelPage';
import { IntegrationsPage } from '@/pages/IntegrationsPage';
import { LandingPage } from '@/pages/LandingPage';
import { LegalPage } from '@/pages/LegalPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { ReportsPage } from '@/pages/ReportsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { ProtectedRoute, PublicRoute } from '@/routes/ProtectedRoute';
import { Navigate, Route, Routes } from 'react-router-dom';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/legal/:slug" element={<LegalPage />} />

      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/atendimento" element={<ConversationsPage />} />
          <Route path="/conversas" element={<Navigate to="/atendimento" replace />} />
          <Route path="/canais" element={<ChannelsPage />} />
          <Route path="/contatos" element={<CustomersPage />} />
          <Route path="/clientes" element={<Navigate to="/contatos" replace />} />
          <Route path="/robo" element={<ChatbotPage />} />
          <Route path="/copiloto" element={<CopilotPage />} />
          <Route path="/agente-ia" element={<Navigate to="/copiloto" replace />} />
          <Route path="/funil" element={<FunnelPage />} />
          <Route path="/campanhas" element={<CampaignsPage />} />
          <Route path="/relatorios" element={<ReportsPage />} />
          <Route path="/integracoes" element={<IntegrationsPage />} />
          <Route path="/configuracoes" element={<SettingsPage />} />
          <Route path="/perfil" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
