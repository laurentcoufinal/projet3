import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Login } from './Login';
import { useAuthStore } from '@/stores/authStore';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderLogin() {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );
}

describe('Login', () => {
  const loginMock = vi.fn();
  const clearErrorMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      login: loginMock,
      clearError: clearErrorMock,
      error: null,
      isLoading: false,
    });
  });

  it('affiche le formulaire de connexion avec email et mot de passe', () => {
    renderLogin();
    expect(screen.getByRole('heading', { name: /connexion/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument();
  });

  it('affiche un lien vers la page d\'inscription', () => {
    renderLogin();
    const link = screen.getByRole('link', { name: /créer un compte/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/register');
  });

  it('appelle clearError au submit', async () => {
    renderLogin();
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/mot de passe/i), { target: { value: 'password123' } });
    fireEvent.submit(screen.getByRole('button', { name: /se connecter/i }).closest('form')!);
    expect(clearErrorMock).toHaveBeenCalled();
  });

  it('appelle login avec email et mot de passe au submit', async () => {
    loginMock.mockResolvedValue(undefined);
    renderLogin();
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@test.com' } });
    fireEvent.change(screen.getByLabelText(/mot de passe/i), { target: { value: 'secret' } });
    fireEvent.submit(screen.getByRole('button', { name: /se connecter/i }).closest('form')!);
    expect(loginMock).toHaveBeenCalledWith('user@test.com', 'secret');
  });

  it('redirige vers /dashboard après login réussi', async () => {
    loginMock.mockResolvedValue(undefined);
    renderLogin();
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'u@u.com' } });
    fireEvent.change(screen.getByLabelText(/mot de passe/i), { target: { value: 'pass' } });
    fireEvent.submit(screen.getByRole('button', { name: /se connecter/i }).closest('form')!);
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
    });
  });

  it('affiche l\'erreur du store', () => {
    useAuthStore.setState({ error: 'Invalid credentials' });
    renderLogin();
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials');
  });

  it('affiche le bouton désactivé et le libellé pendant le chargement', () => {
    useAuthStore.setState({ isLoading: true });
    renderLogin();
    expect(screen.getByRole('button', { name: /connexion/i })).toBeDisabled();
  });
});
