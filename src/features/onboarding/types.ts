export interface BusinessProfile {
  name: string;
  brandName?: string;
  segment?: string;
  website?: string;
  country?: string;
  currency?: string;
  salesChannels?: string[];
  salesModel?: 'b2b' | 'b2c' | 'mixed';
}

export type OnboardingStep =
  | 'business'
  | 'operation'
  | 'catalog'
  | 'channels'
  | 'persona'
  | 'test'
  | 'activation';
