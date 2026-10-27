import React from 'react';
import { Link, NavLink } from 'react-router-dom';

const Header = () => {
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
          <a href="#annonces" className="urbanet-nav-link">
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
          <button type="button" className="urbanet-btn-outline">
            Se connecter
          </button>
          <button type="button" className="urbanet-btn-primary">
            S'inscrire
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
