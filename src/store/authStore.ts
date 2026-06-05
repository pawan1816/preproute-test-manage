import { create } from 'zustand';
import type { User } from '../types';
import { loginUser as apiLogin } from '../api/endpoints';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (userId: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  initialize: () => {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('auth_user');
    if (token && user) {
      try {
        set({
          token,
          user: JSON.parse(user),
          isAuthenticated: true,
        });
      } catch {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    }
  },

  login: async (userId: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiLogin({ userId, password });
      if (response.status === 'success' || response.success) {
        const { token, user } = response.data;
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_user', JSON.stringify(user));
        set({
          token,
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        set({ isLoading: false, error: 'Login failed. Please check your credentials.' });
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Login failed';
      const axiosError = error as { response?: { data?: { message?: string } } };
      const errorMessage = axiosError.response?.data?.message || message;
      set({ isLoading: false, error: errorMessage });
    }
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  clearError: () => set({ error: null }),
}));