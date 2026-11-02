import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="admin-layout">
      {/* Sidebar gauche fixe */}
      <AdminSidebar />

      {/* Contenu principal droite */}
      <div className="admin-content">
        {/* Header simple avec titre et email */}
        <header className="admin-header">
          <div>
            <h1 className="admin-header-title">Espace Administrateur</h1>
            <p className="admin-header-subtitle">Supervision globale et gestion de la plateforme Urbanet</p>
          </div>

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
