import { api } from '@/services/api';
import type { CurrentWorkspace } from '@/services/workspace.service';
import type { OnboardingStep } from '@/features/onboarding/types';
import type { OnboardingStatus } from '@/utils/sessionScope';

export interface OnboardingState {
  status: OnboardingStatus;
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  startedAt?: string;
  completedAt?: string;
}

interface OnboardingResponse {
  status?: OnboardingStatus;
  currentStep?: OnboardingStep | null;
  completedSteps?: OnboardingStep[];
  startedAt?: string | null;
  completedAt?: string | null;
}

export interface OnboardingUpdatePayload {
  currentStep?: OnboardingStep;
  completedSteps?: OnboardingStep[];
  status?: Exclude<OnboardingStatus, 'complete'>;
}

export const onboardingKeys = {
  current: () => ['onboarding', 'current'] as const,
};

function normalizeOnboarding(data: OnboardingResponse): OnboardingState {
  return {
    status: data.status ?? 'complete',
    currentStep: data.currentStep ?? 'business',
    completedSteps: data.completedSteps ?? [],
    startedAt: data.startedAt ?? undefined,
    completedAt: data.completedAt ?? undefined,
  };
}

export const onboardingService = {
  getCurrent: async (): Promise<OnboardingState> => {
    const { data } = await api.get<OnboardingResponse>('/onboarding');
    return normalizeOnboarding(data);
  },

  update: async (payload: OnboardingUpdatePayload): Promise<OnboardingState> => {
    const { data } = await api.patch<OnboardingResponse>('/onboarding', payload);
    return normalizeOnboarding(data);
  },

  complete: async (): Promise<CurrentWorkspace> => {
    const { data } = await api.post<CurrentWorkspace>('/onboarding/complete');
    return data;
  },
};
