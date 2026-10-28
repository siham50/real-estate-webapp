import React, { useState } from 'react';
import { deleteResidence } from '../services/api';

const AgencyResidenceList = ({ residences, onDeleted }) => {
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Supprimer la résidence "${name}" ? Cette action est irréversible.`)) return;
    setDeletingId(id);
    setError('');
    try {
      await deleteResidence(id);
      onDeleted(id);
    } catch (err) {
      setError(err.message || 'Erreur lors de la suppression.');
    } finally {
      setDeletingId(null);
    }
  };

  if (residences.length === 0) {
    return (
      <div className="agency-empty-state">
        <div className="agency-empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
        <p className="agency-empty-title">Aucune résidence</p>
        <p className="agency-empty-desc">Ajoutez votre première résidence en cliquant sur "+ Ajouter".</p>
      </div>
    );
  }

  return (
    <div>
      {error && <div className="agency-alert-error">{error}</div>}
      <div className="agency-table-wrapper">
        <table className="agency-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Ville</th>
              <th>Adresse</th>
              <th>Statut</th>
              <th>Vérification</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {residences.map((r) => (
              <tr key={r.id}>
                <td>
                  <span className="agency-table-name">{r.name}</span>
                </td>
                <td>{r.city}</td>
                <td className="agency-table-address">{r.address}</td>
                <td>
                  {r.isAvailable ? (
                    <span className="agency-badge agency-badge-available">Disponible</span>
                  ) : (
                    <span className="agency-badge agency-badge-hidden">Masqué</span>
                  )}
                </td>
                <td>
                  {r.verificationStatus === 'APPROVED' ? (
                    <span className="agency-badge agency-badge-verified">Approuvée</span>
                  ) : r.verificationStatus === 'REJECTED' ? (
                    <span className="agency-badge agency-badge-rejected">Rejetée</span>
                  ) : (
                    <span className="agency-badge agency-badge-pending">En attente</span>
                  )}
                </td>
                <td>
                  <button
                    type="button"
                    className="agency-btn-delete"
                    onClick={() => handleDelete(r.id, r.name)}
                    disabled={deletingId === r.id}
                  >
                    {deletingId === r.id ? (
                      <span className="agency-spinner-sm" />
                    ) : (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14H6L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4h6v2" />
                      </svg>
                    )}
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AgencyResidenceList;
