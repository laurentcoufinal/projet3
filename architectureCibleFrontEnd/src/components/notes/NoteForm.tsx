import { useState, FormEvent } from 'react';
import { useCreateNote } from '@/hooks/useNotes';
import { useTags } from '@/hooks/useTags';

export function NoteForm() {
  const [text, setText] = useState('');
  const [tagId, setTagId] = useState<string>('');
  const createNote = useCreateNote();
  const { data: tags, isLoading: tagsLoading } = useTags();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const tid = Number(tagId);
    if (!text.trim() || !tid) return;
    try {
      await createNote.mutateAsync({ text: text.trim(), tag_id: tid });
      setText('');
      setTagId('');
    } catch {
      // Error is in createNote.error
    }
  };

  return (
    <div style={{ marginTop: 16 }}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: 8 }}>Ajouter une note</h2>
      <form onSubmit={handleSubmit}>
        {createNote.error && (
          <div role="alert" style={{ color: 'red', marginBottom: 8 }}>
            {createNote.error.message}
          </div>
        )}
        <div style={{ marginBottom: 8 }}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Écrire une note..."
            disabled={createNote.isPending}
            rows={3}
            style={{ width: '100%', padding: 8 }}
            aria-label="Texte de la note"
          />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label htmlFor="note-tag">Tag</label>
          <select
            id="note-tag"
            value={tagId}
            onChange={(e) => setTagId(e.target.value)}
            disabled={createNote.isPending || tagsLoading}
            style={{ display: 'block', marginTop: 4, padding: 8, minWidth: 200 }}
            aria-label="Choisir un tag"
          >
            <option value="">-- Choisir un tag --</option>
            {tags?.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={createNote.isPending || !text.trim() || !tagId}
          style={{ padding: '8px 16px' }}
        >
          {createNote.isPending ? 'Ajout...' : 'Ajouter la note'}
        </button>
      </form>
    </div>
  );
}
