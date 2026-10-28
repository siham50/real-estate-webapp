import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // On considère l'utilisateur connecté uniquement s'il possède un id valide
  const isLoggedIn = Boolean(user && user.id);

  const handleProfileClick = () => {
    if (user?.role === 'PROFESSIONAL' || user?.role === 'AGENCE') {
      navigate('/profile/agency');
    } else {
      navigate('/profile/client');
    }
  };

  return (
    <header className="urbanet-header">
      <div className="urbanet-header-container">
        {/* Logo Urbanet vers la racine / */}
        <span
          onClick={() => navigate('/')}
          className="urbanet-logo"
          style={{ cursor: 'pointer' }}
        >
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
        </span>

        {/* Navigation centrale */}
        <nav className="urbanet-nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `urbanet-nav-pill ${isActive ? 'active' : ''}`
            }
          >
            Accueil
          </NavLink>
          <a href="/#annonces" className="urbanet-nav-link">
            Biens
          </a>
          <a href="/#residences" className="urbanet-nav-link">
            Résidences
          </a>
        </nav>

        {/* Actions à droite */}
        <div className="urbanet-header-actions">
          <button type="button" className="urbanet-icon-btn" aria-label="Recherche">
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
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>

          {isLoggedIn ? (
            <div className="urbanet-user-header-group">
              {/* Bouton "Mon Espace Agence" uniquement pour les professionnels */}
              {(user.role === 'PROFESSIONAL' || user.role === 'AGENCE') && (
                <button
                  type="button"
                  className="agency-header-dashboard-btn"
                  onClick={() => navigate('/agency/dashboard')}
                  title="Tableau de bord agence"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                  Mon Espace
                </button>
              )}
              <button
                type="button"
                onClick={handleProfileClick}
                className="urbanet-header-profile-btn"
              >
                <div className="header-avatar-circle">
                  {user.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="header-user-name">{user.firstName}</span>
                <span className="header-user-role-badge">
                  {user.role === 'PROFESSIONAL' || user.role === 'AGENCE' ? 'Agence' : 'Client'}
                </span>
              </button>
              <button
                type="button"
                onClick={logout}
                className="urbanet-btn-header-logout"
                title="Se déconnecter"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                className="urbanet-btn-outline"
                onClick={() => navigate('/login')}
              >
                Se connecter
              </button>
              <button
                type="button"
                className="urbanet-btn-primary"
                onClick={() => navigate('/register')}
              >
                S'inscrire
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
