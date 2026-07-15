import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState, Loading } from '@/components/ui/EmptyState';
import { useNotification } from '@/contexts/NotificationContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import {
  BusinessAgentConfigForm,
  BusinessIdentityForm,
  BusinessOperationForm,
  useBusinessProfile,
  useSaveBusinessProfile,
  type BusinessProfileDraft,
} from '@/features/business';
import {
  PersonaIdentityForm,
  PersonaPreview,
  PersonaPresentationForm,
  PersonaTestPanel,
  PersonaToneForm,
  usePersonaDraft,
} from '@/features/persona';
import { personaKeys, personaService } from '@/features/persona/services/persona.service';
import type { OnboardingStep } from '@/features/onboarding/types';
import { onboardingKeys, onboardingService, type OnboardingState } from '@/services/onboarding.service';
import { workspaceKeys } from '@/services/workspace.service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const steps: Array<{ id: OnboardingStep; label: string }> = [
  { id: 'business', label: 'Empresa' },
  { id: 'operation', label: 'Operação' },
  { id: 'catalog', label: 'Catálogo' },
  { id: 'channels', label: 'Canais' },
  { id: 'persona', label: 'Persona' },
  { id: 'test', label: 'Teste' },
  { id: 'activation', label: 'Ativação' },
];

const initialBusiness: BusinessProfileDraft = {
  name: '',
  salesChannels: [],
  salesModel: undefined,
  agentConfigurationStatus: 'not_configured',
};

function nextCompletedSteps(current: OnboardingState | undefined, step: OnboardingStep): OnboardingStep[] {
  const existing = current?.completedSteps ?? [];
  return existing.includes(step) ? existing : [...existing, step];
}

export function BusinessOnboardingPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addToast } = useNotification();
  const workspace = useWorkspace();
  const { data: businessData, isLoading: businessLoading, isError: businessError, refetch: refetchBusiness } = useBusinessProfile();
  const { data: onboarding, isLoading: onboardingLoading, isError: onboardingError, refetch: refetchOnboarding } = useQuery({
    queryKey: onboardingKeys.current(),
    queryFn: onboardingService.getCurrent,
  });
  const saveBusinessMutation = useSaveBusinessProfile();
  const updateOnboardingMutation = useMutation({
    mutationFn: onboardingService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: onboardingKeys.current() });
      queryClient.invalidateQueries({ queryKey: workspaceKeys.current() });
    },
  });
  const completeOnboardingMutation = useMutation({
    mutationFn: onboardingService.complete,
    onSuccess: (workspace) => {
      queryClient.invalidateQueries({ queryKey: onboardingKeys.current() });
      queryClient.invalidateQueries({ queryKey: workspaceKeys.current() });
      if (workspace.onboardingStatus === 'complete') {
        addToast({ title: 'Onboarding concluído', message: 'Workspace ativado com sucesso.', type: 'success' });
        navigate('/dashboard', { replace: true });
      }
    },
    onError: (error: unknown) => {
      addToast({
        title: 'Não foi possível concluir',
        message: error instanceof Error ? error.message : 'O onboarding ainda possui campos obrigatórios pendentes.',
        type: 'error',
      });
    },
  });
  const [activeStep, setActiveStep] = useState<OnboardingStep>('business');
  const [businessDraft, setBusinessDraft] = useState<BusinessProfileDraft>(initialBusiness);
  const { draft: personaDraft, setDraft: setPersonaDraft } = usePersonaDraft();
  const personaListQuery = useQuery({
    queryKey: personaKeys.list(workspace.id),
    queryFn: personaService.listPersonas,
  });
  const savePersonaMutation = useMutation({
    mutationFn: async () => {
      const firstPersona = personaListQuery.data?.items[0];
      if (firstPersona?.id) return personaService.updatePersona(firstPersona.id, { ...personaDraft, id: firstPersona.id });
      return personaService.createPersona(personaDraft);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: personaKeys.list(workspace.id) });
    },
  });
  const currentIndex = steps.findIndex((step) => step.id === activeStep);
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === steps.length - 1;
  const isBusy = saveBusinessMutation.isPending || updateOnboardingMutation.isPending || completeOnboardingMutation.isPending || savePersonaMutation.isPending;

  useEffect(() => {
    if (businessData?.profile) setBusinessDraft((current) => ({ ...current, ...businessData.profile }));
  }, [businessData?.profile]);

  useEffect(() => {
    if (onboarding?.currentStep) setActiveStep(onboarding.currentStep);
  }, [onboarding?.currentStep]);

  const persistStep = async (step: OnboardingStep, completedStep?: OnboardingStep) => {
    await updateOnboardingMutation.mutateAsync({
      currentStep: step,
      status: onboarding?.status === 'pending' ? 'in_progress' : undefined,
      completedSteps: completedStep ? nextCompletedSteps(onboarding, completedStep) : undefined,
    });
  };

  const saveBusinessIfNeeded = async (completedStep: OnboardingStep) => {
    await saveBusinessMutation.mutateAsync({ draft: businessDraft, current: businessData?.raw });
    queryClient.invalidateQueries({ queryKey: workspaceKeys.current() });
    await persistStep(steps[Math.min(currentIndex + 1, steps.length - 1)].id, completedStep);
  };

  const savePersonaIfNeeded = async () => {
    await savePersonaMutation.mutateAsync();
    await persistStep(steps[Math.min(currentIndex + 1, steps.length - 1)].id, 'persona');
  };

  const goTo = async (index: number) => {
    const nextStep = steps[index];
    if (!nextStep || isBusy) return;

    try {
      if (index > currentIndex && (activeStep === 'business' || activeStep === 'operation' || activeStep === 'channels')) {
        await saveBusinessIfNeeded(activeStep);
      } else if (index > currentIndex && (activeStep === 'catalog')) {
        await persistStep(nextStep.id, activeStep);
      } else if (index > currentIndex && activeStep === 'persona') {
        await savePersonaIfNeeded();
      } else {
        await persistStep(nextStep.id);
      }
      setActiveStep(nextStep.id);
    } catch (error) {
      addToast({
        title: 'Não foi possível atualizar o progresso',
        message: error instanceof Error ? error.message : 'Tente novamente em instantes.',
        type: 'error',
      });
    }
  };

  const handleComplete = () => {
    completeOnboardingMutation.mutate();
  };

  if (businessLoading || onboardingLoading) return <Loading text="Carregando onboarding..." />;

  if (businessError || onboardingError) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Não foi possível carregar o onboarding"
        description="Sua sessão precisa de um workspace ativo para continuar."
        action={<Button onClick={() => { void refetchBusiness(); void refetchOnboarding(); }}>Tentar novamente</Button>}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Onboarding empresarial</h1>
        <p className="text-gray-500 dark:text-gray-400">Configure empresa, operação e ativação inicial do workspace.</p>
      </div>

      <div className="overflow-x-auto">
        <div className="flex min-w-max gap-2">
          {steps.map((step, index) => (
            <button
              key={step.id}
              type="button"
              onClick={() => { void goTo(index); }}
              disabled={isBusy}
              className={`min-h-10 rounded-lg border px-4 text-sm font-semibold ${
                activeStep === step.id
                  ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-200'
                  : 'border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-300'
              }`}
            >
              {index + 1}. {step.label}
            </button>
          ))}
        </div>
      </div>

      {activeStep === 'business' && (
        <Card title="Empresa">
          <BusinessIdentityForm value={businessDraft} onChange={setBusinessDraft} disabled={isBusy} />
        </Card>
      )}
      {activeStep === 'operation' && (
        <Card title="Operação">
          <BusinessOperationForm value={businessDraft} onChange={setBusinessDraft} disabled={isBusy} />
        </Card>
      )}
      {activeStep === 'catalog' && (
        <Card title="Catálogo">
          <p className="text-sm text-gray-500 dark:text-gray-400">Catálogo externo continua opcional nesta fase. Nenhum provedor novo será conectado pelo onboarding.</p>
        </Card>
      )}
      {activeStep === 'channels' && (
        <Card title="Canais">
          <BusinessAgentConfigForm value={businessDraft} onChange={setBusinessDraft} disabled={isBusy} />
        </Card>
      )}
      {activeStep === 'persona' && (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <Card title="Identidade da persona">
              <PersonaIdentityForm value={personaDraft} onChange={setPersonaDraft} disabled={isBusy} />
            </Card>
            <Card title="Tom e apresentação">
              <div className="space-y-6">
                <PersonaToneForm value={personaDraft} onChange={setPersonaDraft} disabled={isBusy} />
                <PersonaPresentationForm value={personaDraft} onChange={setPersonaDraft} disabled={isBusy} />
              </div>
            </Card>
            <p className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-200">
              Ao avancar, a persona sera salva como rascunho real do workspace.
            </p>
          </div>
          <PersonaPreview persona={personaDraft} />
        </div>
      )}
      {activeStep === 'test' && <PersonaTestPanel persona={personaDraft} disabled />}
      {activeStep === 'activation' && (
        <Card title="Ativação" icon={CheckCircle2}>
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              A ativação usa o endpoint real de conclusão do onboarding. Persona permanece opcional nesta fase.
            </p>
            <Button onClick={handleComplete} loading={completeOnboardingMutation.isPending}>
              Ativar empresa
            </Button>
          </div>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => { void goTo(currentIndex - 1); }} disabled={isFirst || isBusy}>
          <ChevronLeft className="h-4 w-4" /> Voltar
        </Button>
        <Button onClick={() => { void goTo(currentIndex + 1); }} disabled={isLast || isBusy}>
          Avançar <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
