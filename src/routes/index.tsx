import { AppLayout } from '@/layouts/AppLayout';
import { CampaignsPage } from '@/pages/CampaignsPage';
import { ChannelsPage } from '@/pages/ChannelsPage';
import { ChatbotPage } from '@/pages/ChatbotPage';
import { CustomersPage } from '@/pages/CustomersPage';
import { FunnelPage } from '@/pages/FunnelPage';
import { IntegrationsPage } from '@/pages/IntegrationsPage';
import { LandingPage } from '@/pages/LandingPage';
import { LegalPage } from '@/pages/LegalPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { ResetPasswordPage } from '@/pages/ResetPasswordPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { SettingsPage } from '@/pages/SettingsPage';
import { PermissionRoute } from '@/routes/PermissionRoute';
import { ProtectedRoute, PublicRoute } from '@/routes/ProtectedRoute';
import { OnboardingRoute } from '@/routes/OnboardingRoute';
import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { RouteLoadingFallback } from '@/components/ui/PageState';

const DashboardPage = lazy(() => import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const ConversationsPage = lazy(() => import('@/pages/ConversationsPage').then((m) => ({ default: m.ConversationsPage })));
const ReportsPage = lazy(() => import('@/pages/ReportsPage').then((m) => ({ default: m.ReportsPage })));
const InsightsPage = lazy(() => import('@/pages/InsightsPage').then((m) => ({ default: m.InsightsPage })));
const ProductsPage = lazy(() => import('@/pages/ProductsPage').then((m) => ({ default: m.ProductsPage })));
const OrdersPage = lazy(() => import('@/pages/OrdersPage').then((m) => ({ default: m.OrdersPage })));
const CopilotPage = lazy(() => import('@/pages/CopilotPage').then((m) => ({ default: m.CopilotPage })));
const BusinessProfilePage = lazy(() => import('@/pages/BusinessProfilePage').then((m) => ({ default: m.BusinessProfilePage })));
const PersonaPage = lazy(() => import('@/pages/PersonaPage').then((m) => ({ default: m.PersonaPage })));
const BusinessOnboardingPage = lazy(() => import('@/pages/BusinessOnboardingPage').then((m) => ({ default: m.BusinessOnboardingPage })));

function LazyPage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<RouteLoadingFallback />}>{children}</Suspense>;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/legal/:slug" element={<LegalPage />} />

      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<RegisterPage />} />
        <Route path="/redefinir-senha" element={<ResetPasswordPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<LazyPage><DashboardPage /></LazyPage>} />
          <Route path="/atendimento" element={<LazyPage><ConversationsPage /></LazyPage>} />
          <Route path="/conversas" element={<Navigate to="/atendimento" replace />} />
          <Route path="/contatos" element={<CustomersPage />} />
          <Route path="/clientes" element={<Navigate to="/contatos" replace />} />
          <Route path="/produtos" element={<LazyPage><ProductsPage /></LazyPage>} />
          <Route path="/pedidos" element={<LazyPage><OrdersPage /></LazyPage>} />
          <Route path="/robo" element={<ChatbotPage />} />
          <Route path="/copiloto" element={<LazyPage><CopilotPage /></LazyPage>} />
          <Route path="/agente-ia" element={<Navigate to="/copiloto" replace />} />
          <Route path="/funil" element={<FunnelPage />} />
          <Route path="/configuracoes" element={<SettingsPage />} />
          <Route path="/perfil" element={<ProfilePage />} />
          <Route path="/minha-empresa" element={<LazyPage><BusinessProfilePage /></LazyPage>} />

          <Route element={<OnboardingRoute />}>
            <Route path="/onboarding" element={<LazyPage><BusinessOnboardingPage /></LazyPage>} />
          </Route>

          <Route element={<PermissionRoute permission="managePlatform" />}>
            <Route path="/canais" element={<ChannelsPage />} />
            <Route path="/campanhas" element={<CampaignsPage />} />
            <Route path="/persona" element={<LazyPage><PersonaPage /></LazyPage>} />
          </Route>

          <Route element={<PermissionRoute permission="viewReports" />}>
            <Route path="/relatorios" element={<LazyPage><ReportsPage /></LazyPage>} />
            <Route path="/insights" element={<LazyPage><InsightsPage /></LazyPage>} />
          </Route>

          <Route element={<PermissionRoute permission="manageIntegrations" />}>
            <Route path="/integracoes" element={<IntegrationsPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
