import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  PersonaAudienceForm,
  PersonaEscalationForm,
  PersonaExamplesEditor,
  PersonaIdentityForm,
  PersonaObjectionsForm,
  PersonaPresentationForm,
  PersonaPreview,
  PersonaQualificationForm,
  PersonaRestrictionsForm,
  PersonaTestPanel,
  PersonaToneForm,
  PersonaUpsellForm,
  personaUnavailableMessage,
  usePersonaDraft,
} from '@/features/persona';
import { usePermissions } from '@/hooks/usePermissions';
import { AlertCircle, Bot, MessageSquareText, Save, ShieldAlert, SlidersHorizontal, Target, UserRoundCog, Wand2 } from 'lucide-react';

export function PersonaPage() {
  const { can } = usePermissions();
  const { draft, setDraft } = usePersonaDraft();
  const canManagePersona = can('managePlatform') || can('manageUsers');

  if (!canManagePersona) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="Persona indisponível para seu perfil"
        description="A configuração da persona exige permissão de gestão do agente."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Persona do agente</h1>
          <p className="text-gray-500 dark:text-gray-400">Configure visualmente a personalidade comercial do agente NITRUS.</p>
        </div>
        <Button disabled>
          <Save className="h-4 w-4" /> Salvar persona
        </Button>
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-200">
        {personaUnavailableMessage}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Card title="Identidade" icon={UserRoundCog}>
            <PersonaIdentityForm value={draft} onChange={setDraft} />
          </Card>
          <Card title="Tom de voz" icon={SlidersHorizontal}>
            <PersonaToneForm value={draft} onChange={setDraft} />
          </Card>
          <Card title="Apresentação" icon={MessageSquareText}>
            <PersonaPresentationForm value={draft} onChange={setDraft} />
          </Card>
          <Card title="Público e objetivos" icon={Target}>
            <PersonaAudienceForm value={draft} onChange={setDraft} />
          </Card>
          <Card title="Qualificação" icon={AlertCircle}>
            <PersonaQualificationForm value={draft} onChange={setDraft} />
          </Card>
          <Card title="Objeções" icon={MessageSquareText}>
            <PersonaObjectionsForm value={draft} onChange={setDraft} />
          </Card>
          <Card title="Upsell e recomendação" icon={Wand2}>
            <PersonaUpsellForm value={draft} onChange={setDraft} />
          </Card>
          <Card title="Transferência humana" icon={Bot}>
            <PersonaEscalationForm value={draft} onChange={setDraft} />
          </Card>
          <Card title="Restrições" icon={ShieldAlert}>
            <PersonaRestrictionsForm value={draft} onChange={setDraft} />
          </Card>
          <Card title="Exemplos" icon={MessageSquareText}>
            <PersonaExamplesEditor value={draft.examples ?? []} onChange={(examples) => setDraft({ ...draft, examples })} />
          </Card>
        </div>

        <aside className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <PersonaPreview persona={draft} />
          <PersonaTestPanel persona={draft} />
          <Button className="w-full" disabled>
            Ativar persona
          </Button>
        </aside>
      </div>
    </div>
  );
}
