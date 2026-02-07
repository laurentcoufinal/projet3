import { useNotes, useDeleteNote } from '@/hooks/useNotes';

export function NoteList() {
  const { data: notes, isLoading, error } = useNotes();
  const deleteNote = useDeleteNote();

  if (isLoading) return <p>Chargement des notes...</p>;
  if (error) return <p role="alert">Erreur : {error.message}</p>;
  if (!notes?.length) return <p>Aucune note.</p>;

  return (
    <div style={{ marginTop: 16 }}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: 8 }}>Vos notes</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {notes.map((note) => (
          <li
            key={note.id}
            style={{
              padding: 12,
              marginBottom: 8,
              border: '1px solid #e5e5e5',
              borderRadius: 8,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <div>
              <p style={{ margin: 0 }}>{note.text}</p>
              <small style={{ color: '#737373' }}>
                Tag : {note.tag?.name ?? '—'}
              </small>
            </div>
            <button
              type="button"
              onClick={() => deleteNote.mutate(note.id)}
              disabled={deleteNote.isPending}
              style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}
              aria-label={`Supprimer la note ${note.id}`}
            >
              Supprimer
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
