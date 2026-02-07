import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Register } from './Register';
import { useAuthStore } from '@/stores/authStore';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderRegister() {
  return render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>
  );
}

describe('Register', () => {
  const registerMock = vi.fn();
  const clearErrorMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      register: registerMock,
      clearError: clearErrorMock,
      error: null,
      isLoading: false,
    });
  });

  it('affiche le formulaire d\'inscription avec nom, email, mot de passe et confirmation', () => {
    renderRegister();
    expect(screen.getByRole('heading', { name: /inscription/i })).toBeInTheDocument();
    expect(screen.getByLabelText('Nom')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^mot de passe$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirmer le mot de passe/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /s'inscrire/i })).toBeInTheDocument();
  });

  it('affiche un lien vers la page de connexion', () => {
    renderRegister();
    const link = screen.getByRole('link', { name: /déjà un compte/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/login');
  });

  it('appelle clearError au submit', async () => {
    renderRegister();
    fireEvent.change(screen.getByLabelText('Nom'), { target: { value: 'Jean Dupont' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'jean@example.com' } });
    fireEvent.change(screen.getByLabelText(/^mot de passe$/i), { target: { value: 'secret123' } });
    fireEvent.change(screen.getByLabelText(/confirmer le mot de passe/i), { target: { value: 'secret123' } });
    fireEvent.submit(screen.getByRole('button', { name: /s'inscrire/i }).closest('form')!);
    expect(clearErrorMock).toHaveBeenCalled();
  });

  it('appelle register avec nom, email, mot de passe et confirmation au submit', async () => {
    registerMock.mockResolvedValue(undefined);
    renderRegister();
    fireEvent.change(screen.getByLabelText('Nom'), { target: { value: 'Marie Martin' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'marie@test.com' } });
    fireEvent.change(screen.getByLabelText(/^mot de passe$/i), { target: { value: 'pass12345' } });
    fireEvent.change(screen.getByLabelText(/confirmer le mot de passe/i), { target: { value: 'pass12345' } });
    fireEvent.submit(screen.getByRole('button', { name: /s'inscrire/i }).closest('form')!);
    expect(registerMock).toHaveBeenCalledWith('Marie Martin', 'marie@test.com', 'pass12345', 'pass12345');
  });

  it('redirige vers /dashboard après inscription réussie', async () => {
    registerMock.mockResolvedValue(undefined);
    renderRegister();
    fireEvent.change(screen.getByLabelText('Nom'), { target: { value: 'A' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'a@a.com' } });
    fireEvent.change(screen.getByLabelText(/^mot de passe$/i), { target: { value: 'password' } });
    fireEvent.change(screen.getByLabelText(/confirmer le mot de passe/i), { target: { value: 'password' } });
    fireEvent.submit(screen.getByRole('button', { name: /s'inscrire/i }).closest('form')!);
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
    });
  });

  it('affiche l\'erreur du store', () => {
    useAuthStore.setState({ error: 'Email already taken' });
    renderRegister();
    expect(screen.getByRole('alert')).toHaveTextContent('Email already taken');
  });

  it('affiche le bouton désactivé et le libellé pendant le chargement', () => {
    useAuthStore.setState({ isLoading: true });
    renderRegister();
    expect(screen.getByRole('button', { name: /inscription/i })).toBeDisabled();
  });
});
