import type { LucideIcon } from 'lucide-react';

export type NavPermission = 'viewReports' | 'manageIntegrations' | 'managePlatform' | 'manageUsers';

export interface NavItem {
  to: string;
  icon: LucideIcon;
  label: string;
  permission?: NavPermission;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export function filterNavSections(
  sections: NavSection[],
  can: (permission: string) => boolean,
): NavSection[] {
  return sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => !item.permission || can(item.permission)),
    }))
    .filter((section) => section.items.length > 0);
}

export const SETTINGS_TAB_PERMISSIONS: Record<string, NavPermission | 'admin' | undefined> = {
  empresa: undefined,
  usuarios: 'manageUsers',
  permissoes: undefined,
  mercos: 'manageIntegrations',
  whatsapp: 'admin',
  openai: undefined,
  integracoes: 'manageIntegrations',
  notificacoes: undefined,
  seguranca: undefined,
  tema: undefined,
};

export function canAccessSettingsTab(
  tabId: string,
  can: (permission: string) => boolean,
  role: string,
): boolean {
  const rule = SETTINGS_TAB_PERMISSIONS[tabId];
  if (!rule) return true;
  if (rule === 'admin') return role === 'admin';
  return can(rule);
}
