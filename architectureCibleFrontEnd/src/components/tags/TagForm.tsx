import { useState, FormEvent } from 'react';
import { useCreateTag } from '@/hooks/useTags';

export function TagForm() {
  const [name, setName] = useState('');
  const createTag = useCreateTag();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await createTag.mutateAsync(name.trim());
      setName('');
    } catch {
      // Error is in createTag.error
    }
  };

  return (
    <div style={{ marginTop: 16 }}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: 8 }}>Ajouter un tag</h2>
      <form onSubmit={handleSubmit}>
        {createTag.error && (
          <div role="alert" style={{ color: 'red', marginBottom: 8 }}>
            {createTag.error.message}
          </div>
        )}
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nom du tag"
          disabled={createTag.isPending}
          maxLength={50}
          style={{ padding: 8, marginRight: 8, width: 200 }}
          aria-label="Nom du tag"
        />
        <button type="submit" disabled={createTag.isPending || !name.trim()} style={{ padding: '8px 16px' }}>
          {createTag.isPending ? 'Ajout...' : 'Ajouter'}
        </button>
      </form>
    </div>
  );
}
