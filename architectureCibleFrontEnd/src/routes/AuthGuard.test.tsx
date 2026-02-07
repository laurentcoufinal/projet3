import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthGuard } from './AuthGuard';
import { useAuthStore } from '@/stores/authStore';

function renderWithRouter(initialEntry = '/dashboard') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/login" element={<div>Page de connexion</div>} />
        <Route path="/" element={<AuthGuard />}>
          <Route path="dashboard" element={<div>Contenu protégé</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe('AuthGuard', () => {
  beforeEach(() => {
    useAuthStore.setState({ token: null, user: null });
  });

  it('redirige vers /login quand il n\'y a pas de token', () => {
    renderWithRouter();
    expect(screen.getByText('Page de connexion')).toBeInTheDocument();
    expect(screen.queryByText('Contenu protégé')).not.toBeInTheDocument();
  });

  it('affiche le contenu enfant quand un token est présent', () => {
    useAuthStore.setState({ token: 'fake-token', user: { id: 1, name: 'Test', email: 'test@test.com' } });
    renderWithRouter();
    expect(screen.getByText('Contenu protégé')).toBeInTheDocument();
    expect(screen.queryByText('Page de connexion')).not.toBeInTheDocument();
  });
});
