import React, { useState, useEffect } from 'react';
import { getAllReportsAdmin, updateReportStatus } from '../../services/api';

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [actionLoading, setActionLoading] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const fetchReports = async () => {
    setLoading(true);
    setFeedback({ type: '', message: '' });
    try {
      const data = await getAllReportsAdmin();
      if (Array.isArray(data)) {
        setReports(data);
      } else {
        setReports([]);
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Erreur lors du chargement des signalements.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    setActionLoading(id);
    setFeedback({ type: '', message: '' });
    try {
      await updateReportStatus(id, status);
      setFeedback({
        type: 'success',
        message:
          status === 'RESOLVED'
            ? `Le signalement #${id} a été marqué comme résolu.`
            : `Le signalement #${id} a été ignoré.`,
      });
      // Recharger la liste après action comme demandé
      await fetchReports();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Erreur lors du traitement du signalement.',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const filteredReports = reports.filter((r) => {
    if (filterStatus === 'PENDING' && r.status !== 'PENDING') return false;
    if (filterStatus === 'RESOLVED' && r.status !== 'RESOLVED') return false;
    if (filterStatus === 'DISMISSED' && r.status !== 'DISMISSED') return false;
    return true;
  });

  const countTotal = reports.length;
  const countPending = reports.filter((r) => r.status === 'PENDING').length;
  const countResolved = reports.filter((r) => r.status === 'RESOLVED').length;
  const countDismissed = reports.filter((r) => r.status === 'DISMISSED').length;

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="admin-reports-view">
      {/* Header section */}
      <div className="admin-view-header">
        <div>
          <h2 className="admin-view-title">Gestion des Signalements</h2>
          <p className="admin-view-subtitle">
            Traitez les signalements émis par les utilisateurs et modérez les comportements suspects.
          </p>
        </div>
      </div>

      {/* Feedback banner */}
      {feedback.message && (
        <div
          className={`auth-alert ${feedback.type === 'success' ? 'auth-alert-success' : 'auth-alert-error'}`}
          style={{ marginBottom: '20px' }}
        >
          {feedback.message}
        </div>
      )}

      {/* Toolbar: Filtres */}
      <div className="admin-table-toolbar">
        <div className="admin-filter-group">
          <button
            type="button"
            className={`admin-filter-pill ${filterStatus === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilterStatus('ALL')}
          >
            Tous <span className="pill-count">{countTotal}</span>
          </button>
          <button
            type="button"
            className={`admin-filter-pill ${filterStatus === 'PENDING' ? 'active' : ''}`}
            onClick={() => setFilterStatus('PENDING')}
          >
            En attente{' '}
            <span
              className="pill-count"
              style={{
                backgroundColor: countPending > 0 ? '#fee2e2' : undefined,
                color: countPending > 0 ? '#dc2626' : undefined,
                fontWeight: countPending > 0 ? '700' : undefined,
              }}
            >
              {countPending}
            </span>
          </button>
          <button
            type="button"
            className={`admin-filter-pill ${filterStatus === 'RESOLVED' ? 'active' : ''}`}
            onClick={() => setFilterStatus('RESOLVED')}
          >
            Résolus <span className="pill-count">{countResolved}</span>
          </button>
          <button
            type="button"
            className={`admin-filter-pill ${filterStatus === 'DISMISSED' ? 'active' : ''}`}
            onClick={() => setFilterStatus('DISMISSED')}
          >
            Ignorés <span className="pill-count">{countDismissed}</span>
          </button>
        </div>
      </div>

      {/* Tableau des signalements */}
      <div className="admin-table-container">
        {loading ? (
          <div className="admin-table-loading">
            <div className="spinner-sm"></div>
            <span>Chargement des signalements...</span>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="admin-table-empty">
            <p>Aucun signalement trouvé pour ce filtre.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>ID</th>
                <th>Utilisateur signalé</th>
                <th>Raison</th>
                <th>Date</th>
                <th>Statut</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((r) => {
                const reported = r.reportedUser;
                const reportedDisplay = reported
                  ? reported.email ||
                    `${reported.firstName || ''} ${reported.lastName || ''}`.trim() ||
                    `Utilisateur #${reported.id}`
                  : `ID #${r.reportedUserId || '—'}`;

                const reporterDisplay = r.reporter
                  ? r.reporter.email || `${r.reporter.firstName || ''} ${r.reporter.lastName || ''}`.trim()
                  : null;

                const isProcessing = actionLoading === r.id;

                return (
                  <tr key={r.id}>
                    <td className="user-cell-id">#{r.id}</td>

                    {/* Utilisateur signalé (ID ou email) */}
                    <td>
                      <div className="user-name-wrapper">
                        <div
                          className="user-avatar-mini"
                          style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}
                        >
                          !
                        </div>
                        <div>
                          <span className="user-fullname">{reportedDisplay}</span>
                          {reporterDisplay && (
                            <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                              Par : {reporterDisplay}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Raison */}
                    <td style={{ maxWidth: '300px' }}>
                      <span className="report-reason-text">{r.reason || 'Non spécifiée'}</span>
                    </td>

                    {/* Date */}
                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.84rem', color: '#64748b' }}>
                      {formatDate(r.createdAt)}
                    </td>

                    {/* Statut */}
                    <td>
                      {r.status === 'PENDING' ? (
                        <span className="badge badge-warning">En attente</span>
                      ) : r.status === 'RESOLVED' ? (
                        <span className="badge badge-success">Résolu</span>
                      ) : (
                        <span className="badge badge-secondary">Ignoré</span>
                      )}
                    </td>

                    {/* Actions : Résoudre (vert) & Ignorer (gris) uniquement si PENDING */}
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {r.status === 'PENDING' ? (
                        <>
                          <button
                            type="button"
                            className="btn-action btn-success"
                            onClick={() => handleUpdateStatus(r.id, 'RESOLVED')}
                            disabled={isProcessing}
                            title="Résoudre le signalement"
                          >
                            {isProcessing ? '...' : 'Résoudre'}
                          </button>
                          <button
                            type="button"
                            className="btn-action btn-secondary"
                            onClick={() => handleUpdateStatus(r.id, 'DISMISSED')}
                            disabled={isProcessing}
                            title="Ignorer le signalement"
                          >
                            {isProcessing ? '...' : 'Ignorer'}
                          </button>
                        </>
                      ) : (
                        <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontStyle: 'italic' }}>
                          Traité
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminReports;
