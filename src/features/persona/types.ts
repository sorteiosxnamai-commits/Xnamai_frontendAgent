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
  tone: string;
  greeting: string;
  targetAudience: string;
  salesGoals: string[];
  qualificationRules: string[];
  objectionHandling: string[];
  upsellRules: string[];
  escalationRules: string[];
  restrictions: string[];
  examples?: PersonaExample[];
  status: PersonaStatus;
}
