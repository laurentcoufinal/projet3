import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuthStore();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await register(name, email, password, passwordConfirmation);
      navigate('/dashboard', { replace: true });
    } catch {
      // Error is set in store
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto', padding: 16 }}>
      <h1 style={{ marginBottom: 16 }}>Inscription</h1>
      <form onSubmit={handleSubmit}>
        {error && (
          <div role="alert" style={{ color: 'red', marginBottom: 12 }}>
            {error}
          </div>
        )}
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="register-name">Nom</label>
          <input
            id="register-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
            disabled={isLoading}
            style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="register-email">Email</label>
          <input
            id="register-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            disabled={isLoading}
            style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="register-password">Mot de passe</label>
          <input
            id="register-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            disabled={isLoading}
            style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="register-password-confirmation">Confirmer le mot de passe</label>
          <input
            id="register-password-confirmation"
            type="password"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            disabled={isLoading}
            style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }}
          />
        </div>
        <button type="submit" disabled={isLoading} style={{ padding: '8px 16px' }}>
          {isLoading ? 'Inscription...' : 'S\'inscrire'}
        </button>
      </form>
      <p style={{ marginTop: 16 }}>
        <Link to="/login">Déjà un compte ? Se connecter</Link>
      </p>
    </div>
  );
}
