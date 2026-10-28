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

  if (requiredRole && user.role !== requiredRole) {
    // Si l'utilisateur est client et essaie d'accéder à l'espace agence (ou inversement), on redirige vers son espace
    const target = user.role === 'PROFESSIONAL' ? '/profile/agency' : '/profile/client';
    return <Navigate to={target} replace />;
  }

  return children;
};

export default ProtectedRoute;
