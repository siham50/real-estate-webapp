import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Message transmis depuis la page d'inscription (ex : après inscription réussie)
  const successMessage = location.state?.successMessage;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedUser = await login({
        email: email.trim(),
        password: password,
      });

      // Redirection selon le rôle reçu du backend
      if (loggedUser?.role === 'PROFESSIONAL' || loggedUser?.role === 'AGENCE') {
        navigate('/profile/agency');
      } else {
        navigate('/profile/client');
      }
    } catch (err) {
      setError(err.message || 'Identifiants incorrects ou serveur indisponible.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* En-tête avec logo Urbanet */}
        <div className="auth-header">
          <Link to="/" className="urbanet-logo auth-logo-center">
            <div className="urbanet-logo-badge">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <span className="urbanet-logo-title">Urbanet</span>
          </Link>
          <h1 className="auth-title">Se connecter</h1>
          <p className="auth-subtitle">Accédez à votre espace Urbanet</p>
        </div>

        {/* Message de succès */}
        {successMessage && <div className="auth-alert auth-alert-success">{successMessage}</div>}

        {/* Message d'erreur */}
        {error && <div className="auth-alert auth-alert-error">{error}</div>}

        {/* Formulaire de connexion */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              className="auth-input"
              placeholder="votre.email@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              required
              className="auth-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" disabled={loading} className="auth-btn">
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>

        <div className="auth-link">
          <span>Pas encore de compte ? </span>
          <Link to="/register" className="link-highlight">
            S'inscrire
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
