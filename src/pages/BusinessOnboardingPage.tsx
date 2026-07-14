import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  BusinessAgentConfigForm,
  BusinessIdentityForm,
  BusinessOperationForm,
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
import type { OnboardingStep } from '@/features/onboarding/types';
import { CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

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

export function BusinessOnboardingPage() {
  const [activeStep, setActiveStep] = useState<OnboardingStep>('business');
  const [businessDraft, setBusinessDraft] = useState<BusinessProfileDraft>(initialBusiness);
  const { draft: personaDraft, setDraft: setPersonaDraft } = usePersonaDraft();
  const currentIndex = steps.findIndex((step) => step.id === activeStep);
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === steps.length - 1;

  const goTo = (index: number) => {
    const nextStep = steps[index];
    if (nextStep) setActiveStep(nextStep.id);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Onboarding empresarial</h1>
        <p className="text-gray-500 dark:text-gray-400">Estrutura visual preparada para configurar empresa, operação e persona.</p>
      </div>

      <div className="overflow-x-auto">
        <div className="flex min-w-max gap-2">
          {steps.map((step, index) => (
            <button
              key={step.id}
              type="button"
              onClick={() => setActiveStep(step.id)}
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
          <BusinessIdentityForm value={businessDraft} onChange={setBusinessDraft} />
        </Card>
      )}
      {activeStep === 'operation' && (
        <Card title="Operação">
          <BusinessOperationForm value={businessDraft} onChange={setBusinessDraft} />
        </Card>
      )}
      {activeStep === 'catalog' && (
        <Card title="Catálogo">
          <p className="text-sm text-gray-500 dark:text-gray-400">A conexão do catálogo será feita quando o fluxo de onboarding estiver integrado ao backend.</p>
        </Card>
      )}
      {activeStep === 'channels' && (
        <Card title="Canais">
          <BusinessAgentConfigForm value={businessDraft} onChange={setBusinessDraft} />
        </Card>
      )}
      {activeStep === 'persona' && (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <Card title="Identidade da persona">
              <PersonaIdentityForm value={personaDraft} onChange={setPersonaDraft} />
            </Card>
            <Card title="Tom e apresentação">
              <div className="space-y-6">
                <PersonaToneForm value={personaDraft} onChange={setPersonaDraft} />
                <PersonaPresentationForm value={personaDraft} onChange={setPersonaDraft} />
              </div>
            </Card>
          </div>
          <PersonaPreview persona={personaDraft} />
        </div>
      )}
      {activeStep === 'test' && <PersonaTestPanel persona={personaDraft} />}
      {activeStep === 'activation' && (
        <Card title="Ativação" icon={CheckCircle2}>
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Estrutura preparada. A ativação será concluída após a conexão do fluxo de onboarding com o backend.
            </p>
            <Button disabled>Ativar empresa</Button>
          </div>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => goTo(currentIndex - 1)} disabled={isFirst}>
          <ChevronLeft className="h-4 w-4" /> Voltar
        </Button>
        <Button onClick={() => goTo(currentIndex + 1)} disabled={isLast}>
          Avançar <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
