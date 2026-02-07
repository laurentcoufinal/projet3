import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NoteForm } from './NoteForm';
import { useAuthStore } from '@/stores/authStore';
import { useCreateNote } from '@/hooks/useNotes';
import { createQueryWrapper } from '@/test/wrapper';
import type { UseMutationResult } from '@tanstack/react-query';

vi.mock('@/hooks/useNotes', () => ({
  useCreateNote: vi.fn(),
}));

vi.mock('@/hooks/useTags', () => ({
  useTags: vi.fn(() => ({ data: [{ id: 1, name: 'Work' }, { id: 2, name: 'Personal' }], isLoading: false })),
}));

const wrapper = createQueryWrapper();

function renderNoteForm() {
  return render(<NoteForm />, { wrapper });
}

type CreateNoteMutation = UseMutationResult<unknown, Error, { text: string; tag_id: number }, unknown>;

describe('NoteForm', () => {
  const mutateAsyncMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCreateNote).mockReturnValue({
      mutateAsync: mutateAsyncMock,
      isPending: false,
      error: null,
    } as CreateNoteMutation);
    useAuthStore.setState({ token: 'token' });
  });

  it('affiche le formulaire avec textarea, select tag et bouton', () => {
    renderNoteForm();
    expect(screen.getByRole('heading', { name: /ajouter une note/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/texte de la note/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/choisir un tag/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ajouter la note/i })).toBeInTheDocument();
  });

  it('affiche les options de tags', () => {
    renderNoteForm();
    expect(screen.getByRole('option', { name: 'Work' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Personal' })).toBeInTheDocument();
  });

  it('appelle createNote avec text et tag_id au submit', async () => {
    mutateAsyncMock.mockResolvedValue({ id: 1, text: 'Test', tag_id: 2 });
    renderNoteForm();
    fireEvent.change(screen.getByLabelText(/texte de la note/i), { target: { value: 'Test note' } });
    fireEvent.change(screen.getByLabelText(/choisir un tag/i), { target: { value: '2' } });
    fireEvent.submit(screen.getByRole('button', { name: /ajouter la note/i }).closest('form')!);
    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalledWith({ text: 'Test note', tag_id: 2 });
    });
  });

  it('vide les champs après création réussie', async () => {
    mutateAsyncMock.mockResolvedValue({ id: 1, text: 'Done', tag_id: 1 });
    renderNoteForm();
    const textarea = screen.getByLabelText(/texte de la note/i);
    const select = screen.getByLabelText(/choisir un tag/i);
    fireEvent.change(textarea, { target: { value: 'Done' } });
    fireEvent.change(select, { target: { value: '1' } });
    fireEvent.submit(screen.getByRole('button', { name: /ajouter la note/i }).closest('form')!);
    await waitFor(() => {
      expect(textarea).toHaveValue('');
      expect(select).toHaveValue('');
    });
  });

  it('affiche l\'erreur de la mutation', () => {
    vi.mocked(useCreateNote).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      error: new Error('Tag requis'),
    } as CreateNoteMutation);
    renderNoteForm();
    expect(screen.getByRole('alert')).toHaveTextContent('Tag requis');
  });

  it('désactive le bouton si texte ou tag manquant', () => {
    renderNoteForm();
    expect(screen.getByRole('button', { name: /ajouter la note/i })).toBeDisabled();
    fireEvent.change(screen.getByLabelText(/texte de la note/i), { target: { value: 'x' } });
    expect(screen.getByRole('button', { name: /ajouter la note/i })).toBeDisabled();
    fireEvent.change(screen.getByLabelText(/choisir un tag/i), { target: { value: '1' } });
    expect(screen.getByRole('button', { name: /ajouter la note/i })).not.toBeDisabled();
  });
});
