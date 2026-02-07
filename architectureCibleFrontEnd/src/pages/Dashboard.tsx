import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { TagList } from '@/components/tags/TagList';
import { TagForm } from '@/components/tags/TagForm';
import { NoteList } from '@/components/notes/NoteList';
import { NoteForm } from '@/components/notes/NoteForm';

export function Dashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>Dashboard</h1>
        <button type="button" onClick={handleLogout} style={{ padding: '8px 16px' }} aria-label="Se déconnecter">
          Déconnexion
        </button>
      </div>
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
