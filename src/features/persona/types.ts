export type PersonaStatus = 'draft' | 'active' | 'inactive';

export interface PersonaExample {
  id?: string;
  customerMessage: string;
  expectedResponse: string;
}

export interface AgentPersona {
  id?: string;
  workspaceId?: string;
  name: string;
  role: string;
  segment: string;
  language?: string;
  tone: PersonaTone;
  customToneDetails?: string;
  greeting: string;
  introduction?: string;
  customerAddressing?: string;
  defaultClosing?: string;
  targetAudience: string;
  salesGoals: string[];
  customerType?: string;
  commercialPriorities?: string[];
  qualificationRules: string[];
  requiredQuestions?: string[];
  discoveryFields?: string[];
  opportunityCriteria?: string[];
  sellerHandoffCriteria?: string[];
  objectionHandling: string[];
  customObjections?: string[];
  upsellRules: string[];
  complementaryProductRules?: string[];
  premiumOptionRules?: string[];
  insistenceLimit?: string;
  recommendationRules?: string[];
  escalationRules: string[];
  humanTransferTriggers?: string[];
  restrictions: string[];
  forbiddenSubjects?: string[];
  forbiddenPromises?: string[];
  nonInventableInformation?: string[];
  humanOnlyCommercialTerms?: string[];
  examples?: PersonaExample[];
  status: PersonaStatus;
}

export type PersonaTone =
  | 'professional'
  | 'consultative'
  | 'objective'
  | 'friendly'
  | 'sophisticated'
  | 'technical'
  | 'informal'
  | 'custom';
