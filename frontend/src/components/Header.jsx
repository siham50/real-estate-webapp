import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './layout/NotificationDropdown';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchCity, setSearchCity] = useState('');

  // On considère l'utilisateur connecté uniquement s'il possède un id valide
  const isLoggedIn = Boolean(user && user.id);
  const userRole = String(user?.role || '').toUpperCase();
  const isAgency =
    userRole === 'PROFESSIONAL' ||
    userRole === 'AGENCE' ||
    userRole === 'AGENCY' ||
    userRole.includes('PRO') ||
    userRole.includes('AGENC') ||
    Boolean(user?.companyName);
  const isAdmin = userRole === 'ADMIN' || userRole.includes('ADMIN');
  const isClient = userRole === 'CLIENT' || (!isAgency && !isAdmin && isLoggedIn);

  const handleHeaderSearch = (e) => {
    e.preventDefault();
    const trimmed = searchCity.trim();
    if (trimmed) {
      navigate(`/properties?city=${encodeURIComponent(trimmed)}`);
    } else {
      navigate('/properties');
    }
  };

  const handleLogoClick = () => {
    if (isAdmin) {
      navigate('/admin');
    } else if (isAgency) {
      navigate('/agency/dashboard');
    } else {
      navigate('/');
    }
  };

  const handleProfileClick = () => {
    if (isAdmin) {
      navigate('/admin');
    } else if (isAgency) {
      navigate('/profile/agency');
    } else {
      navigate('/profile/client');
    }
  };

  return (
    <header className="urbanet-header">
      <div className="urbanet-header-container">
        {/* Logo Urbanet vers la racine ou l'espace utilisateur */}
        <span
          onClick={handleLogoClick}
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

        {/* Navigation centrale (uniquement pour les visiteurs et clients, masquée pour l'agence et l'admin) */}
        {!isAgency && !isAdmin && (
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
        )}

        {/* Actions à droite */}
        <div className="urbanet-header-actions">
          {/* Barre de recherche dans le Header (masquée pour les agences et administrateurs) */}
          {!isAgency && !isAdmin && (
            <form onSubmit={handleHeaderSearch} className="urbanet-header-search-wrap">
              <input
                type="text"
                placeholder="Ville (ex: Casablanca)..."
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                className="urbanet-header-search-input"
                aria-label="Rechercher par ville"
              />
              <button
                type="submit"
                className="urbanet-header-search-btn"
                aria-label="Rechercher"
                title="Rechercher"
              >
                <svg
                  width="16"
                  height="16"
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
            </form>
          )}

          {isLoggedIn ? (
            <div className="urbanet-user-header-group">
              {/* Bouton "Mon Espace" pour les agences */}
              {isAgency && (
                <button
                  type="button"
                  className="agency-header-dashboard-btn"
                  onClick={() => navigate('/agency/dashboard')}
                  title="Mon Espace Agence"
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

              {/* Bouton "Administration" pour les admins */}
              {isAdmin && (
                <button
                  type="button"
                  className="agency-header-dashboard-btn"
                  onClick={() => navigate('/admin')}
                  title="Tableau de bord administrateur"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                  Admin
                </button>
              )}

              {/* Notifications */}
              <NotificationDropdown />

              {/* Bouton Messages pour Client ou Agence */}
              <button
                type="button"
                className="urbanet-header-messages-btn"
                onClick={() => navigate('/messages')}
                title="Mes discussions"
              >
                <span className="header-messages-icon">✉️</span>
                <span className="header-messages-text">Messages</span>
              </button>

              {/* Bouton "Mon Espace" pour les clients */}
              {isClient && (
                <button
                  type="button"
                  className="agency-header-dashboard-btn"
                  onClick={() => navigate('/client/dashboard')}
                  title="Mon Espace Client"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Mon Espace
                </button>
              )}

              {/* Bouton Profil */}
              <button
                type="button"
                onClick={handleProfileClick}
                className="urbanet-header-profile-btn"
                title="Mon profil"
              >
                <div className="header-avatar-circle">
                  {user.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="header-user-name">{user.firstName}</span>
                <span className="header-user-role-badge">
                  {isAdmin ? 'Admin' : isAgency ? 'Agence' : 'Client'}
                </span>
              </button>

              {/* Bouton Déconnexion */}
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
                <span>Se déconnecter</span>
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
