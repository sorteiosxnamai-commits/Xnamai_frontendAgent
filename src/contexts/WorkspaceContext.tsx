import { useAuth } from '@/contexts/AuthContext';
import type { User } from '@/types';
import { normalizeSessionUser, type AccountType, type OnboardingStatus, type WorkspaceRole } from '@/utils/sessionScope';
import { createContext, useContext, useMemo, type ReactNode } from 'react';

interface WorkspaceScope {
  id: string;
  name?: string;
  role: WorkspaceRole;
  onboardingStatus: OnboardingStatus;
  accountType: AccountType;
  user: User | null;
}

const WorkspaceContext = createContext<WorkspaceScope | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const value = useMemo<WorkspaceScope>(() => {
    if (!user) {
      return {
        id: 'legacy',
        name: undefined,
        role: 'member',
        onboardingStatus: 'complete',
        accountType: 'workspace_user',
        user: null,
      };
    }

    const scopedUser = normalizeSessionUser(user);

    return {
      id: scopedUser.workspaceId ?? 'legacy',
      name: scopedUser.workspaceName ?? scopedUser.company,
      role: scopedUser.workspaceRole ?? 'member',
      onboardingStatus: scopedUser.onboardingStatus ?? 'complete',
      accountType: scopedUser.accountType ?? 'workspace_user',
      user: scopedUser,
    };
  }, [user]);

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider');
  return ctx;
}
