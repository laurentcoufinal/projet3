import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TagList } from './TagList';
import { useAuthStore } from '@/stores/authStore';
import { useTags } from '@/hooks/useTags';
import { createQueryWrapper } from '@/test/wrapper';

vi.mock('@/hooks/useTags', () => ({
  useTags: vi.fn(),
}));

const createQueryWrapperFn = createQueryWrapper();

function renderTagList() {
  return render(<TagList />, {
    wrapper: createQueryWrapperFn,
  });
}

describe('TagList', () => {
  beforeEach(() => {
    useAuthStore.setState({ token: 'token' });
  });

  it('affiche un message de chargement quand isLoading', () => {
    vi.mocked(useTags).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);
    renderTagList();
    expect(screen.getByText(/chargement des tags/i)).toBeInTheDocument();
  });

  it('affiche un message d\'erreur quand error', () => {
    vi.mocked(useTags).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Network error'),
    } as any);
    renderTagList();
    expect(screen.getByRole('alert')).toHaveTextContent(/network error/i);
  });

  it('affiche "Aucun tag" quand la liste est vide', () => {
    vi.mocked(useTags).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any);
    renderTagList();
    expect(screen.getByText(/aucun tag/i)).toBeInTheDocument();
  });

  it('affiche la liste des tags', () => {
    vi.mocked(useTags).mockReturnValue({
      data: [
        { id: 1, name: 'Work' },
        { id: 2, name: 'Personal' },
      ],
      isLoading: false,
      error: null,
    } as any);
    renderTagList();
    expect(screen.getByRole('heading', { name: /tags/i })).toBeInTheDocument();
    expect(screen.getByText('Work')).toBeInTheDocument();
    expect(screen.getByText('Personal')).toBeInTheDocument();
  });
});
