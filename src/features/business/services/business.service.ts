import { settingsService, type CompanySettings } from '@/services/settings.service';
import type { BusinessProfileDraft, BusinessPersistence } from '@/features/business/types';

export const businessPersistence: BusinessPersistence = {
  canPersist: true,
  supportedFields: ['name', 'primaryContact'],
};

export function businessFromCompanySettings(settings: CompanySettings): BusinessProfileDraft {
  return {
    name: settings.name ?? '',
    primaryContact: settings.email ?? '',
  };
}

export function companySettingsFromBusinessDraft(
  draft: BusinessProfileDraft,
  current?: CompanySettings,
): CompanySettings {
  return {
    name: draft.name,
    cnpj: current?.cnpj ?? '',
    email: draft.primaryContact ?? current?.email ?? '',
    phone: current?.phone ?? '',
  };
}

export const businessService = {
  getProfile: async (): Promise<{ profile: BusinessProfileDraft; raw: CompanySettings }> => {
    const raw = await settingsService.getCompany();
    return { profile: businessFromCompanySettings(raw), raw };
  },

  saveProfile: async (
    draft: BusinessProfileDraft,
    current?: CompanySettings,
  ): Promise<{ profile: BusinessProfileDraft; raw: CompanySettings }> => {
    const raw = await settingsService.saveCompany(companySettingsFromBusinessDraft(draft, current));
    return { profile: businessFromCompanySettings(raw), raw };
  },
};
