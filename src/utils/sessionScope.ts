import type { User } from '@/types';

export type AccountType = NonNullable<User['accountType']>;
export type WorkspaceRole = NonNullable<User['workspaceRole']>;
export type OnboardingStatus = NonNullable<User['onboardingStatus']>;

const WORKSPACE_ROLES: WorkspaceRole[] = ['owner', 'admin', 'supervisor', 'seller', 'member'];

function normalizeWorkspaceRole(role: string | undefined): WorkspaceRole {
  if (role && WORKSPACE_ROLES.includes(role as WorkspaceRole)) {
    return role as WorkspaceRole;
  }

  if (role === 'vendedor') return 'seller';
  if (role === 'supervisor') return 'supervisor';
  if (role === 'admin') return 'admin';

  return 'member';
}

export function normalizeSessionUser(user: User): User {
  return {
    ...user,
    accountType: user.accountType ?? 'workspace_user',
    workspaceId: user.workspaceId,
    workspaceName: user.workspaceName,
    workspaceRole: user.workspaceRole ?? normalizeWorkspaceRole(user.role),
    onboardingStatus: user.onboardingStatus ?? 'complete',
  };
}

export function isSystemAdmin(user: User | null | undefined): boolean {
  return user?.accountType === 'system_admin';
}
