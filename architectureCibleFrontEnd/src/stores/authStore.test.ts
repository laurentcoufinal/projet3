import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAuthStore, getStoredToken } from './authStore';
import type { User } from '@/types/user';

const mockLoginResponse: { user: User; token: string } = {
  user: { id: 1, name: 'Test User', email: 'test@example.com' },
  token: 'fake-token-123',
};

describe('authStore', () => {
  const originalFetch = globalThis.fetch;
  let sessionStorageMock: Record<string, string>;

  beforeEach(() => {
    sessionStorageMock = {};
    vi.stubGlobal('sessionStorage', {
      getItem: (key: string) => sessionStorageMock[key] ?? null,
      setItem: (key: string, value: string) => {
        sessionStorageMock[key] = value;
      },
      removeItem: (key: string) => {
        delete sessionStorageMock[key];
      },
      clear: () => {
        Object.keys(sessionStorageMock).forEach((k) => delete sessionStorageMock[k]);
      },
      length: 0,
      key: () => null,
    });
    useAuthStore.setState({
      user: null,
      token: null,
      error: null,
      isLoading: false,
    });
  });

  afterEach(() => {
    vi.stubGlobal('fetch', originalFetch);
  });

  it('login success met à jour user et token (persist en sessionStorage)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockLoginResponse),
      })
    );
    await useAuthStore.getState().login('test@example.com', 'password');
    expect(useAuthStore.getState().user).toEqual(mockLoginResponse.user);
    expect(useAuthStore.getState().token).toBe(mockLoginResponse.token);
    expect(useAuthStore.getState().error).toBeNull();
  });

  it('login failure met à jour error et lance une erreur', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: 'Invalid credentials' }),
      })
    );
    await expect(
      useAuthStore.getState().login('bad@example.com', 'wrong')
    ).rejects.toThrow();
    expect(useAuthStore.getState().error).toBe('Invalid credentials');
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().token).toBeNull();
  });

  it('logout efface user et token', () => {
    useAuthStore.setState({
      user: mockLoginResponse.user,
      token: mockLoginResponse.token,
    });
    useAuthStore.getState().logout();
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().token).toBeNull();
  });

  it('setError met à jour error', () => {
    useAuthStore.getState().setError('Something went wrong');
    expect(useAuthStore.getState().error).toBe('Something went wrong');
  });

  it('clearError efface error', () => {
    useAuthStore.setState({ error: 'Previous error' });
    useAuthStore.getState().clearError();
    expect(useAuthStore.getState().error).toBeNull();
  });

  it('register success met à jour user et token (persist en sessionStorage)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockLoginResponse),
      })
    );
    await useAuthStore.getState().register('New User', 'new@example.com', 'password', 'password');
    expect(useAuthStore.getState().user).toEqual(mockLoginResponse.user);
    expect(useAuthStore.getState().token).toBe(mockLoginResponse.token);
    expect(useAuthStore.getState().error).toBeNull();
  });

  it('register failure met à jour error et lance une erreur', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: 'Email already taken' }),
      })
    );
    await expect(
      useAuthStore.getState().register('User', 'taken@example.com', 'pass', 'pass')
    ).rejects.toThrow();
    expect(useAuthStore.getState().error).toBe('Email already taken');
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().token).toBeNull();
  });
});

describe('getStoredToken', () => {
  beforeEach(() => {
    vi.stubGlobal('sessionStorage', {
      getItem: vi.fn((key: string) =>
        key === 'auth-storage'
          ? JSON.stringify({ state: { token: 'stored-token', user: null }, version: 0 })
          : null
      ),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    });
  });

  it('retourne le token stocké', () => {
    expect(getStoredToken()).toBe('stored-token');
  });
});
