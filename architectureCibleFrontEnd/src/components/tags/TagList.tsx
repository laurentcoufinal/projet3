import { useTags } from '@/hooks/useTags';

export function TagList() {
  const { data: tags, isLoading, error } = useTags();

  if (isLoading) return <p>Chargement des tags...</p>;
  if (error) return <p role="alert">Erreur : {error.message}</p>;
  if (!tags?.length) return <p>Aucun tag.</p>;

  return (
    <div style={{ marginTop: 16 }}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: 8 }}>Tags</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {tags.map((tag) => (
          <li key={tag.id} style={{ padding: '4px 0' }}>
            {tag.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
