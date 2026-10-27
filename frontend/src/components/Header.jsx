import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleProfileClick = () => {
    if (user?.role === 'PROFESSIONAL') {
      navigate('/profile/agency');
    } else {
      navigate('/profile/client');
    }
  };

  return (
    <header className="urbanet-header">
      <div className="urbanet-header-container">
        {/* Logo */}
        <Link to="/" className="urbanet-logo">
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

        {/* Center Nav */}
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
            Annonces
          </a>
        </nav>

        {/* Right Actions */}
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

          {user ? (
            <div className="urbanet-user-header-group">
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
                  {user.role === 'PROFESSIONAL' ? 'Agence' : 'Client'}
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
              <Link to="/login" className="urbanet-btn-outline">
                Se connecter
              </Link>
              <Link to="/register" className="urbanet-btn-primary">
                S'inscrire
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
