import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Headphones, Link, Megaphone, MessageSquare, Package, Radio, ShoppingCart, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ConversationsEmptyState({ filtered }: { filtered: boolean }) {
  const navigate = useNavigate();

  if (filtered) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="Nenhuma conversa encontrada"
        description="Não há conversas com os filtros ou busca atuais. Tente outro canal ou limpe os filtros."
      />
    );
  }

  return (
    <EmptyState
      icon={Headphones}
      title="Nenhuma conversa ainda"
      description="As conversas aparecem quando clientes enviam mensagem pelo WhatsApp ou quando você testa o robô de atendimento. Conecte a Meta na semana que vem."
      action={
        <div className="flex flex-wrap justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/configuracoes?tab=whatsapp')}>
            Configurar WhatsApp
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/robo')}>
            Testar robô
          </Button>
        </div>
      }
    />
  );
}

export function ConversationsSelectPrompt() {
  return (
    <EmptyState
      icon={MessageSquare}
      title="Selecione uma conversa"
      description="Escolha um atendimento na lista ao lado ou aguarde novas mensagens pelo WhatsApp."
    />
  );
}

export function CampaignsEmptyState({ onCreate }: { onCreate: () => void }) {
  const navigate = useNavigate();

  return (
    <EmptyState
      icon={Megaphone}
      title="Nenhuma campanha criada"
      description="Crie campanhas WhatsApp para clientes sincronizados do Mercos. O disparo real exige WhatsApp conectado (Meta) — disponível na próxima etapa."
      action={
        <div className="flex flex-wrap justify-center gap-2">
          <Button size="sm" onClick={onCreate}>
            Criar campanha
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/configuracoes?tab=mercos')}>
            Sincronizar Mercos
          </Button>
        </div>
      }
    />
  );
}

export function CustomersEmptyState({ searched }: { searched: boolean }) {
  const navigate = useNavigate();

  if (searched) {
    return (
      <EmptyState
        icon={Users}
        title="Nenhum cliente encontrado"
        description="Não há contatos que correspondam à sua busca. Tente outro nome, e-mail ou telefone."
      />
    );
  }

  return (
    <EmptyState
      icon={Users}
      title="Nenhum contato sincronizado"
      description="Os clientes vêm do Mercos. Configure os tokens de produção e sincronize para popular esta lista — necessário também para campanhas WhatsApp."
      action={
        <div className="flex flex-wrap justify-center gap-2">
          <Button size="sm" onClick={() => navigate('/configuracoes?tab=mercos')}>
            Ir para Mercos
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/configuracoes?tab=sistema')}>
            Ver status do sistema
          </Button>
        </div>
      }
    />
  );
}

export function ChannelsEmptyState({ onRegisterWhatsApp }: { onRegisterWhatsApp?: () => void }) {
  const navigate = useNavigate();

  return (
    <EmptyState
      icon={Radio}
      title="Nenhum canal configurado"
      description="Cadastre o WhatsApp agora (fica pendente até os tokens Meta). Quando conectar a API, o canal passa a receber e enviar mensagens reais."
      action={
        <div className="flex flex-wrap justify-center gap-2">
          {onRegisterWhatsApp && (
            <Button size="sm" onClick={onRegisterWhatsApp}>
              Cadastrar WhatsApp
            </Button>
          )}
          <Button variant={onRegisterWhatsApp ? 'outline' : 'primary'} size="sm" onClick={() => navigate('/configuracoes?tab=whatsapp')}>
            Configurar tokens Meta
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/configuracoes?tab=sistema')}>
            Ver checklist
          </Button>
        </div>
      }
    />
  );
}

export function ProductsEmptyState({ searched }: { searched: boolean }) {
  const navigate = useNavigate();

  if (searched) {
    return (
      <EmptyState
        icon={Package}
        title="Nenhum produto encontrado"
        description="Não há itens que correspondam à busca ou categoria. Tente outro termo ou limpe os filtros."
      />
    );
  }

  return (
    <EmptyState
      icon={Package}
      title="Catálogo vazio"
      description="Os produtos vêm da API Mercos. Configure os tokens e sincronize para o robô, copiloto e atendimento consultarem preço e estoque reais."
      action={
        <div className="flex flex-wrap justify-center gap-2">
          <Button size="sm" onClick={() => navigate('/configuracoes?tab=mercos')}>
            Ir para Mercos
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/configuracoes?tab=sistema')}>
            Ver status do sistema
          </Button>
        </div>
      }
    />
  );
}

export function ProductsMercosHint() {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate('/configuracoes?tab=mercos')}
      className="flex w-full items-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-left text-sm text-teal-900 transition-colors hover:bg-teal-100/80 dark:border-teal-900/40 dark:bg-teal-950/30 dark:text-teal-100 dark:hover:bg-teal-950/50"
    >
      <Link className="h-4 w-4 shrink-0" />
      <p>
        Catálogo do <strong>Mercos</strong> — use Sincronizar para atualizar preços e estoque via API.
      </p>
    </button>
  );
}

export function CustomersMercosHint() {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate('/configuracoes?tab=mercos')}
      className="flex w-full items-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-left text-sm text-teal-900 transition-colors hover:bg-teal-100/80 dark:border-teal-900/40 dark:bg-teal-950/30 dark:text-teal-100 dark:hover:bg-teal-950/50"
    >
      <Link className="h-4 w-4 shrink-0" />
      <p>
        Dados do <strong>Mercos</strong> — sincronize em Configurações quando receber os tokens de produção.
      </p>
    </button>
  );
}

export function OrdersEmptyState({ searched }: { searched: boolean }) {
  const navigate = useNavigate();

  if (searched) {
    return (
      <EmptyState
        icon={ShoppingCart}
        title="Nenhum pedido encontrado"
        description="Não há pedidos com os filtros ou busca atuais. Tente outro termo ou limpe os filtros."
      />
    );
  }

  return (
    <EmptyState
      icon={ShoppingCart}
      title="Nenhum pedido sincronizado"
      description="Os pedidos vêm do Mercos. Configure os tokens e sincronize para alimentar Pedidos, Relatórios, Funil e Copiloto."
      action={
        <div className="flex flex-wrap justify-center gap-2">
          <Button size="sm" onClick={() => navigate('/configuracoes?tab=mercos')}>
            Ir para Mercos
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/configuracoes?tab=sistema')}>
            Ver status do sistema
          </Button>
        </div>
      }
    />
  );
}

export function OrdersMercosHint() {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate('/configuracoes?tab=mercos')}
      className="flex w-full items-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-left text-sm text-teal-900 transition-colors hover:bg-teal-100/80 dark:border-teal-900/40 dark:bg-teal-950/30 dark:text-teal-100 dark:hover:bg-teal-950/50"
    >
      <Link className="h-4 w-4 shrink-0" />
      <p>
        Pedidos do <strong>Mercos</strong> — orçamentos aparecem como <strong>Pendente</strong>; pedidos faturados como <strong>Processando</strong>.
      </p>
    </button>
  );
}
