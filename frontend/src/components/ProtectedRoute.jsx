import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Chargement en cours...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = String(user.role || '').toUpperCase();
  const reqRole = String(requiredRole || '').toUpperCase();

  if (requiredRole && userRole !== reqRole) {
    let target = '/profile/client';
    if (userRole === 'ADMIN') {
      target = '/admin';
    } else if (userRole === 'PROFESSIONAL' || userRole === 'AGENCE') {
      target = '/profile/agency';
    }
    return <Navigate to={target} replace />;
  }

  return children;
};

export default ProtectedRoute;
