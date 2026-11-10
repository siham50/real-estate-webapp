import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from '../components/layout/NotificationDropdown';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-layout">
      {/* Sidebar gauche fixe */}
      <AdminSidebar />

      {/* Contenu principal droite */}
      <div className="admin-content">
        {/* Header avec titre, notifications, retour au site et déconnexion */}
        <header className="admin-header">
          <div>
            <h1 className="admin-header-title">Espace Administrateur</h1>
            <p className="admin-header-subtitle">Supervision globale et gestion de la plateforme Urbanet</p>
          </div>

          <div className="admin-header-right">
            {/* Cloche de notifications pour l'Admin */}
            <NotificationDropdown />

            {/* Bouton Retour au site */}
            <Link to="/" className="admin-btn-back" title="Revenir au site public">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span>Retour au site</span>
            </Link>

            {/* Bouton Se déconnecter */}
            <button
              type="button"
              onClick={handleLogout}
              className="admin-btn-logout"
              title="Se déconnecter"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Se déconnecter</span>
            </button>

            {/* Profil Administrateur */}
            <div className="admin-header-user">
              <div className="admin-avatar-badge">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div className="admin-header-user-meta">
                <span className="admin-badge-label">Administrateur</span>
                <span className="admin-user-email">{user?.email || 'admin@urbanet.ma'}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Sous-pages injectées via Outlet */}
        <main className="admin-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
