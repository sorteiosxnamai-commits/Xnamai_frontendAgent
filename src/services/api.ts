import axios from 'axios';
import type { AuthResponse, LoginCredentials, RegisterCredentials, User } from '@/types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

const AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password'];

export const api = axios.create({
  baseURL: API_URL,
  timeout: 120_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pulsedesk_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = String(error.config?.url ?? '');

    if (status === 401 && !AUTH_PATHS.some((path) => url.includes(path))) {
      localStorage.removeItem('pulsedesk_token');
      localStorage.removeItem('pulsedesk_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export const authService = {
  login: (credentials: LoginCredentials) =>
    api.post<AuthResponse>('/auth/login', credentials),
  register: (credentials: RegisterCredentials) =>
    api.post<AuthResponse>('/auth/register', credentials),
  forgotPassword: (email: string) =>
    api.post<{ success: boolean; message: string; resetUrl?: string }>(
      '/auth/forgot-password',
      { email },
    ),
  resetPassword: (token: string, password: string) =>
    api.post<{ success: boolean; message: string }>('/auth/reset-password', {
      token,
      password,
    }),
  updateProfile: (patch: { name?: string; company?: string }) =>
    api.patch<User>('/auth/profile', patch),
  logout: () => api.post('/auth/logout'),
};
