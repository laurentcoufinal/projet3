import { useAuthStore } from '@/stores/authStore';
import { TagList } from '@/components/tags/TagList';
import { TagForm } from '@/components/tags/TagForm';
import { NoteList } from '@/components/notes/NoteList';
import { NoteForm } from '@/components/notes/NoteForm';

export function Dashboard() {
  const user = useAuthStore((state) => state.user);

  return (
    <div style={{ padding: 24 }}>
      <h1>Dashboard</h1>
      {user && (
        <p>
          Bienvenue, <strong>{user.name}</strong>.
        </p>
      )}
      <NoteList />
      <NoteForm />
      <TagList />
      <TagForm />
    </div>
  );
}
