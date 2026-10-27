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

  // Message transmis depuis la page d'inscription ou redirection
  const successMessage = location.state?.successMessage;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedUser = await login(email.trim(), password);
      // Redirection selon le rôle
      if (loggedUser.role === 'PROFESSIONAL') {
        navigate('/profile/agency');
      } else {
        navigate('/profile/client');
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Identifiants incorrects ou compte inactif.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        {/* Logo Urbanet */}
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
          <h1 className="auth-title">Connexion</h1>
          <p className="auth-subtitle">Accédez à votre espace Urbanet</p>
        </div>

        {/* Message de succès (ex: après inscription) */}
        {successMessage && <div className="auth-alert auth-alert-success">{successMessage}</div>}

        {/* Message d'erreur */}
        {error && <div className="auth-alert auth-alert-error">{error}</div>}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="login-email">Adresse email</label>
            <input
              id="login-email"
              type="email"
              required
              className="input-field"
              placeholder="votre.email@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <div className="form-label-with-link">
              <label htmlFor="login-password">Mot de passe</label>
            </div>
            <input
              id="login-password"
              type="password"
              required
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" disabled={loading} className="btn-auth-submit">
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>

        <div className="auth-footer-link">
          <span>Pas encore de compte ? </span>
          <Link to="/register" className="link-highlight">
            Créer un compte
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
