import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types/user';
import { login as apiLogin, register as apiRegister } from '@/api/client';

const TOKEN_KEY = 'renote_token';

export interface AuthState {
  user: User | null;
  token: string | null;
  error: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      error: null,
      isLoading: false,
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const { user, token } = await apiLogin({ email, password });
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem(TOKEN_KEY, token);
          }
          set({ user, token, isLoading: false, error: null });
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Login failed';
          set({ error: message, isLoading: false, user: null, token: null });
          throw err;
        }
      },
      register: async (name: string, email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const { user, token } = await apiRegister({ name, email, password });
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem(TOKEN_KEY, token);
          }
          set({ user, token, isLoading: false, error: null });
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Register failed';
          set({ error: message, isLoading: false, user: null, token: null });
          throw err;
        }
      },
      logout: () => {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(TOKEN_KEY);
        }
        set({ user: null, token: null, error: null });
      },
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);

export function getStoredToken(): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}
