import React, { useState, useEffect } from 'react';
import { getAdminStats } from '../../services/api';

const AdminStats = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProperties: 0,
    totalBookings: 0,
    pendingReports: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getAdminStats();
        if (isMounted && data) {
          setStats({
            totalUsers: data.totalUsers ?? 0,
            totalProperties: data.totalProperties ?? 0,
            totalBookings: data.totalBookings ?? 0,
            pendingReports: data.pendingReports ?? 0,
          });
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Impossible de charger les statistiques.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchStats();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="admin-stats-view">
      <div className="admin-view-header">
        <h2 className="admin-view-title">Vue d'ensemble</h2>
        <p className="admin-view-subtitle">Indicateurs clés de performance et d'activité</p>
      </div>

      {error && (
        <div className="auth-alert auth-alert-error" style={{ marginBottom: '24px' }}>
          {error}
        </div>
      )}

      {/* Grille de 4 cartes */}
      <div className="stats-grid">
        {/* 1. Total Utilisateurs */}
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon-wrapper stat-icon-users">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <span className="stat-label">Utilisateurs</span>
          </div>
          <div className="stat-card-body">
            <span className="stat-number">
              {loading ? '...' : Number(stats.totalUsers).toLocaleString('fr-FR')}
            </span>
            <p className="stat-desc">Comptes particuliers & agences enregistrés</p>
          </div>
        </div>

        {/* 2. Total Biens */}
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon-wrapper stat-icon-properties">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <span className="stat-label">Biens immobiliers</span>
          </div>
          <div className="stat-card-body">
            <span className="stat-number">
              {loading ? '...' : Number(stats.totalProperties).toLocaleString('fr-FR')}
            </span>
            <p className="stat-desc">Annonces actives publiées sur la plateforme</p>
          </div>
        </div>

        {/* 3. Total Réservations */}
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon-wrapper stat-icon-bookings">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <span className="stat-label">Réservations</span>
          </div>
          <div className="stat-card-body">
            <span className="stat-number">
              {loading ? '...' : Number(stats.totalBookings).toLocaleString('fr-FR')}
            </span>
            <p className="stat-desc">Demandes de visites et créneaux réservés</p>
          </div>
        </div>

        {/* 4. Signalements en attente */}
        <div className="stat-card">
          <div className="stat-card-header">
            <div className={`stat-icon-wrapper ${stats.pendingReports > 0 ? 'stat-icon-danger' : 'stat-icon-reports'}`}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                <line x1="4" y1="22" x2="4" y2="15" />
              </svg>
            </div>
            <span className="stat-label">Signalements en attente</span>
          </div>
          <div className="stat-card-body">
            <span className={`stat-number ${stats.pendingReports > 0 ? 'stat-number-danger' : ''}`}>
              {loading ? '...' : Number(stats.pendingReports).toLocaleString('fr-FR')}
            </span>
            <p className="stat-desc">
              {stats.pendingReports > 0
                ? 'Signalements nécessitant une modération immédiate'
                : 'Aucun signalement en attente de traitement'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStats;
