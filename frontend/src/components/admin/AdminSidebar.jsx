import React from 'react';
import { NavLink, Link } from 'react-router-dom';

const AdminSidebar = () => {
  return (
    <aside className="sidebar">
      {/* Top Logo */}
      <div className="sidebar-header">
        <Link to="/admin" className="sidebar-logo-brand">
          <div className="sidebar-logo-badge">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <div className="sidebar-logo-text">
            <span className="sidebar-brand-name">Urbanet</span>
            <span className="sidebar-badge-admin">Admin</span>
          </div>
        </Link>
      </div>

      {/* Navigation menu */}
      <nav className="sidebar-nav">
        <NavLink
          to="/admin"
          end
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
          <span>Tableau de bord</span>
        </NavLink>

        <NavLink
          to="/admin/users"
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span>Utilisateurs</span>
        </NavLink>

        <NavLink
          to="/admin/properties"
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span>Annonces</span>
        </NavLink>

        <NavLink
          to="/admin/reports"
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
            <line x1="4" y1="22" x2="4" y2="15" />
          </svg>
          <span>Signalements</span>
        </NavLink>
      </nav>

      {/* Bottom Button Retour au site */}
      <div className="sidebar-footer">
        <Link to="/" className="sidebar-back-link">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span>Retour au site</span>
        </Link>
      </div>
    </aside>
  );
};

export default AdminSidebar;
