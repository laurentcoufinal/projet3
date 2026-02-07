import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import type { UseMutationResult } from '@tanstack/react-query';
import type { Tag } from '@/types/tag';
import { TagForm } from './TagForm';
import { useAuthStore } from '@/stores/authStore';
import { useCreateTag } from '@/hooks/useTags';
import { createQueryWrapper } from '@/test/wrapper';

vi.mock('@/hooks/useTags', () => ({
  useCreateTag: vi.fn(),
}));

const createQueryWrapperFn = createQueryWrapper();

function renderTagForm() {
  return render(<TagForm />, {
    wrapper: createQueryWrapperFn,
  });
}

describe('TagForm', () => {
  const mutateAsyncMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCreateTag).mockReturnValue({
      mutateAsync: mutateAsyncMock,
      isPending: false,
      error: null,
    } as unknown as UseMutationResult<Tag, Error, string, unknown>);
    useAuthStore.setState({ token: 'token' });
  });

  it('affiche le formulaire avec champ et bouton', () => {
    renderTagForm();
    expect(screen.getByRole('heading', { name: /ajouter un tag/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/nom du tag/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ajouter/i })).toBeInTheDocument();
  });

  it('appelle createTag avec le nom saisi au submit', async () => {
    mutateAsyncMock.mockResolvedValue({ id: 1, name: 'Work' });
    renderTagForm();
    fireEvent.change(screen.getByLabelText(/nom du tag/i), { target: { value: 'Work' } });
    fireEvent.submit(screen.getByRole('button', { name: /ajouter/i }).closest('form')!);
    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalledWith('Work');
    });
  });

  it('vide le champ après création réussie', async () => {
    mutateAsyncMock.mockResolvedValue({ id: 1, name: 'Work' });
    renderTagForm();
    const input = screen.getByLabelText(/nom du tag/i);
    fireEvent.change(input, { target: { value: 'Work' } });
    fireEvent.submit(screen.getByRole('button', { name: /ajouter/i }).closest('form')!);
    await waitFor(() => {
      expect(input).toHaveValue('');
    });
  });

  it('affiche l\'erreur de la mutation', () => {
    vi.mocked(useCreateTag).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      error: new Error('Ce nom existe déjà'),
    } as unknown as UseMutationResult<Tag, Error, string, unknown>);
    renderTagForm();
    expect(screen.getByRole('alert')).toHaveTextContent('Ce nom existe déjà');
  });

  it('désactive le bouton pendant le chargement', () => {
    vi.mocked(useCreateTag).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: true,
      error: null,
    } as unknown as UseMutationResult<Tag, Error, string, unknown>);
    renderTagForm();
    expect(screen.getByRole('button', { name: /ajout/i })).toBeDisabled();
  });

  it('ne soumet pas si le champ est vide', () => {
    renderTagForm();
    fireEvent.submit(screen.getByRole('button', { name: /ajouter/i }).closest('form')!);
    expect(mutateAsyncMock).not.toHaveBeenCalled();
  });
});
