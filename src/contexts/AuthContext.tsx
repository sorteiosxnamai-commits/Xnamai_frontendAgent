import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { mockUser } from '@/data/mocks';
import { authService } from '@/services/api';
import type { LoginCredentials, RegisterCredentials, User } from '@/types';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  updateProfile: (patch: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = 'pulsedesk_token';
const USER_KEY = 'pulsedesk_user';

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
        localStorage.setItem(TOKEN_KEY, 'mock-jwt-token');
        localStorage.setItem(USER_KEY, JSON.stringify(authUser));
        setUser(authUser);
        return;
      }

      const { data } = await authService.login(credentials);
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      setUser(data.user);
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        (error instanceof Error ? error.message : 'Não foi possível entrar');
      throw new Error(typeof message === 'string' ? message : 'Não foi possível entrar');
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
        localStorage.setItem(TOKEN_KEY, 'mock-jwt-token');
        localStorage.setItem(USER_KEY, JSON.stringify(authUser));
        setUser(authUser);
        return;
      }

      const { data } = await authService.register(credentials);
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      setUser(data.user);
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        (error instanceof Error ? error.message : 'Não foi possível criar a conta');
      throw new Error(typeof message === 'string' ? message : 'Não foi possível criar a conta');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    if (!USE_MOCK) {
      authService.logout().catch(() => undefined);
    }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  const updateProfile = useCallback((patch: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...patch };
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
      return updated;
    });
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
