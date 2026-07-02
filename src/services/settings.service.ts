import { api } from './api';

export interface CompanySettings {
  name: string;
  cnpj: string;
  email: string;
  phone: string;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  newMessage: boolean;
  newLead: boolean;
  dailyReport: boolean;
}

export interface RolePermissions {
  role: string;
  permissions: Record<string, boolean>;
  labels: Record<string, string>;
}

export const settingsService = {
  getCompany: async (): Promise<CompanySettings> => {
    const { data } = await api.get<CompanySettings>('/settings/empresa');
    return data;
  },

  saveCompany: async (payload: CompanySettings): Promise<CompanySettings> => {
    const { data } = await api.patch<CompanySettings>('/settings/empresa', {
      name: payload.name,
      cnpj: payload.cnpj || null,
      email: payload.email || null,
      phone: payload.phone || null,
    });
    return data;
  },

  getPreferences: async (): Promise<{ notifications: NotificationSettings }> => {
    const { data } = await api.get<{ notifications: NotificationSettings }>('/settings/preferencias');
    return data;
  },

  savePreferences: async (notifications: NotificationSettings): Promise<{ notifications: NotificationSettings }> => {
    const { data } = await api.patch<{ notifications: NotificationSettings }>(
      '/settings/preferencias',
      notifications,
    );
    return data;
  },

  getPermissions: async (): Promise<RolePermissions> => {
    const { data } = await api.get<RolePermissions>('/settings/permissoes');
    return data;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    const { data } = await api.post<{ success: boolean; message: string }>('/settings/alterar-senha', {
      currentPassword,
      newPassword,
    });
    return data;
  },
};
