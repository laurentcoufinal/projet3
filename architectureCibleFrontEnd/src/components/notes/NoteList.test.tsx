import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NoteList } from './NoteList';
import { useAuthStore } from '@/stores/authStore';
import { useNotes, useDeleteNote } from '@/hooks/useNotes';
import { createQueryWrapper } from '@/test/wrapper';

vi.mock('@/hooks/useNotes', () => ({
  useNotes: vi.fn(),
  useDeleteNote: vi.fn(),
}));

const wrapper = createQueryWrapper();

function renderNoteList() {
  return render(<NoteList />, { wrapper });
}

describe('NoteList', () => {
  const deleteMutateMock = vi.fn();

  beforeEach(() => {
    useAuthStore.setState({ token: 'token' });
    vi.mocked(useDeleteNote).mockReturnValue({
      mutate: deleteMutateMock,
      isPending: false,
    } as any);
  });

  it('affiche un message de chargement quand isLoading', () => {
    vi.mocked(useNotes).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);
    renderNoteList();
    expect(screen.getByText(/chargement des notes/i)).toBeInTheDocument();
  });

  it('affiche un message d\'erreur quand error', () => {
    vi.mocked(useNotes).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Network error'),
    } as any);
    renderNoteList();
    expect(screen.getByRole('alert')).toHaveTextContent(/network error/i);
  });

  it('affiche "Aucune note" quand la liste est vide', () => {
    vi.mocked(useNotes).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any);
    renderNoteList();
    expect(screen.getByText(/aucune note/i)).toBeInTheDocument();
  });

  it('affiche la liste des notes avec tag et bouton supprimer', () => {
    vi.mocked(useNotes).mockReturnValue({
      data: [
        { id: 1, text: 'Note one', tag_id: 1, tag: { id: 1, name: 'Work' } },
        { id: 2, text: 'Note two', tag_id: 2, tag: { id: 2, name: 'Personal' } },
      ],
      isLoading: false,
      error: null,
    } as any);
    renderNoteList();
    expect(screen.getByRole('heading', { name: /vos notes/i })).toBeInTheDocument();
    expect(screen.getByText('Note one')).toBeInTheDocument();
    expect(screen.getByText('Note two')).toBeInTheDocument();
    expect(screen.getByText(/Work/)).toBeInTheDocument();
    expect(screen.getByText(/Personal/)).toBeInTheDocument();
    const deleteButtons = screen.getAllByRole('button', { name: /supprimer/i });
    expect(deleteButtons).toHaveLength(2);
  });

  it('appelle deleteNote au clic sur Supprimer', () => {
    vi.mocked(useNotes).mockReturnValue({
      data: [{ id: 10, text: 'To delete', tag_id: 1, tag: { id: 1, name: 'Work' } }],
      isLoading: false,
      error: null,
    } as any);
    renderNoteList();
    fireEvent.click(screen.getByRole('button', { name: /supprimer la note 10/i }));
    expect(deleteMutateMock).toHaveBeenCalledWith(10);
  });
});
