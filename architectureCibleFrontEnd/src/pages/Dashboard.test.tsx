import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Dashboard } from './Dashboard';
import { useAuthStore } from '@/stores/authStore';
import { createQueryWrapper } from '@/test/wrapper';

vi.mock('@/hooks/useTags', () => ({
  useTags: vi.fn(() => ({ data: [], isLoading: false, error: null })),
  useCreateTag: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
    error: null,
  })),
}));

vi.mock('@/hooks/useNotes', () => ({
  useNotes: vi.fn(() => ({ data: [], isLoading: false, error: null })),
  useCreateNote: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
    error: null,
  })),
  useDeleteNote: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));

const wrapper = createQueryWrapper();

describe('Dashboard', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: { id: 1, name: 'Jean Dupont', email: 'jean@example.com' },
      token: 'token',
    });
  });

  it('affiche le titre Dashboard', () => {
    render(<Dashboard />, { wrapper });
    expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
  });

  it('affiche le nom de l\'utilisateur connecté', () => {
    render(<Dashboard />, { wrapper });
    expect(screen.getByText(/bienvenue/i)).toBeInTheDocument();
    expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
  });

  it('affiche le titre même sans utilisateur (état de bord)', () => {
    useAuthStore.setState({ user: null });
    render(<Dashboard />, { wrapper });
    expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
  });
});
