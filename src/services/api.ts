import axios from 'axios';
import type { AuthResponse, LoginCredentials, RegisterCredentials } from '@/types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_URL,
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
    if (error.response?.status === 401) {
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
  logout: () => api.post('/auth/logout'),
};
