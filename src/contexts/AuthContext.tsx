import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { mockUser } from '@/data/mocks';
import { authService, REFRESH_KEY, TOKEN_KEY, USER_KEY } from '@/services/api';
import { extractApiErrorMessage } from '@/utils/apiErrors';
import type { LoginCredentials, RegisterCredentials, User } from '@/types';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  updateProfile: (patch: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function persistSession(token: string, refreshToken: string, authUser: User) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(REFRESH_KEY, refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(authUser));
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? (JSON.parse(stored) as User) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      if (!credentials.email || !credentials.password) {
        throw new Error('Credenciais inválidas');
      }

      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 800));
        const authUser = { ...mockUser, email: credentials.email };
        persistSession('mock-jwt-token', 'mock-refresh-token', authUser);
        setUser(authUser);
        return;
      }

      const { data } = await authService.login(credentials);
      persistSession(data.token, data.refreshToken, data.user);
      setUser(data.user);
    } catch (error: unknown) {
      throw new Error(extractApiErrorMessage(error, 'Não foi possível entrar'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (credentials: RegisterCredentials) => {
    setIsLoading(true);
    try {
      if (!credentials.name || !credentials.email || !credentials.password) {
        throw new Error('Preencha todos os campos obrigatórios');
      }

      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 800));
        const authUser: User = {
          id: `mock-${Date.now()}`,
          name: credentials.name,
          email: credentials.email,
          role: 'user',
          company: credentials.company || 'PulseDesk',
        };
        persistSession('mock-jwt-token', 'mock-refresh-token', authUser);
        setUser(authUser);
        return;
      }

      const { data } = await authService.register(credentials);
      persistSession(data.token, data.refreshToken, data.user);
      setUser(data.user);
    } catch (error: unknown) {
      throw new Error(extractApiErrorMessage(error, 'Não foi possível criar a conta'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    if (!USE_MOCK) {
      const refreshToken = localStorage.getItem(REFRESH_KEY) ?? undefined;
      authService.logout(refreshToken).catch(() => undefined);
    }
    clearSession();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (patch: Partial<User>) => {
    if (USE_MOCK) {
      setUser((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, ...patch };
        localStorage.setItem(USER_KEY, JSON.stringify(updated));
        return updated;
      });
      return;
    }

    const { data } = await authService.updateProfile({
      name: patch.name,
      company: patch.company,
    });
    localStorage.setItem(USER_KEY, JSON.stringify(data));
    setUser(data);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
      updateProfile,
    }),
    [user, isLoading, login, register, logout, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
