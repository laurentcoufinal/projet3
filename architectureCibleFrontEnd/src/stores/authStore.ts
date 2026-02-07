import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { User } from '@/types/user';
import { login as apiLogin, register as apiRegister } from '@/api/client';

const AUTH_STORAGE_KEY = 'auth-storage';

export interface AuthState {
  user: User | null;
  token: string | null;
  error: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<void>;
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
          set({ user, token, isLoading: false, error: null });
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Login failed';
          set({ error: message, isLoading: false, user: null, token: null });
          throw err;
        }
      },
      register: async (name: string, email: string, password: string, passwordConfirmation: string) => {
        set({ isLoading: true, error: null });
        try {
          const { user, token } = await apiRegister({
            name,
            email,
            password,
            password_confirmation: passwordConfirmation,
          });
          set({ user, token, isLoading: false, error: null });
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Register failed';
          set({ error: message, isLoading: false, user: null, token: null });
          throw err;
        }
      },
      logout: () => {
        set({ user: null, token: null, error: null });
      },
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);

/** Lit le token depuis la persistance (sessionStorage). */
export function getStoredToken(): string | null {
  if (typeof sessionStorage === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { token?: string | null } };
    return parsed.state?.token ?? null;
  } catch {
    return null;
  }
}
