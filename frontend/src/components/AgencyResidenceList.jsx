import React, { useState } from 'react';
import { deleteResidence } from '../services/api';
import { getImageUrl, DEFAULT_PLACEHOLDER_IMAGE } from '../utils/imageUtils';

const AgencyResidenceList = ({ residences, onDeleted, onEdit }) => {
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
        <table className="agency-table" style={{ width: '100%', tableLayout: 'auto' }}>
          <thead>
            <tr>
              <th style={{ width: '28%' }}>Nom</th>
              <th style={{ width: '16%' }}>Ville</th>
              <th style={{ width: '26%' }}>Adresse</th>
              <th style={{ width: '12%' }}>Statut</th>
              <th style={{ width: '6%' }}>Vues</th>
              <th style={{ width: '12%', textAlign: 'right', paddingRight: '20px', whiteSpace: 'nowrap' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {residences.map((r) => {
              let displayImage = null;
              if (r.images && r.images.length > 0) {
                // Cherche spécifiquement l'image qui a isPrimary = true
                const primaryImg = r.images.find((img) => img.isPrimary === true || img.primary === true);
                // Si elle n'existe pas (bug), prend la première par défaut
                displayImage = primaryImg ? primaryImg : r.images[0];
              }
              const imageSrc = displayImage
                ? getImageUrl(displayImage.imageUrl || displayImage)
                : (r.image ? getImageUrl(r.image) : DEFAULT_PLACEHOLDER_IMAGE);

              return (
                <tr key={r.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img
                        src={imageSrc}
                        alt={r.name}
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '6px',
                          objectFit: 'cover',
                          flexShrink: 0,
                          backgroundColor: '#e2e8f0',
                        }}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = DEFAULT_PLACEHOLDER_IMAGE;
                        }}
                      />
                      <span className="agency-table-name">{r.name}</span>
                    </div>
                  </td>
                <td>{r.city}</td>
                <td className="agency-table-address" style={{ maxWidth: 'none' }}>{r.address}</td>
                <td>
                  {r.isAvailable ? (
                    <span className="agency-badge agency-badge-available">Disponible</span>
                  ) : (
                    <span className="agency-badge agency-badge-hidden">Masqué</span>
                  )}
                </td>
                <td>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#64748b', fontWeight: 600 }}>
                    <span>👁️</span> {r.views != null ? r.views : 0}
                  </span>
                </td>
                <td style={{ textAlign: 'right', paddingRight: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', flexWrap: 'wrap' }}>
                    {onEdit && (
                      <button
                        type="button"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: '#f0fdf4',
                          color: '#15803d',
                          border: '1px solid #bbf7d0',
                          borderRadius: '6px',
                          padding: '5px 10px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                        onClick={() => onEdit(r)}
                        title="Modifier les infos et photos de la résidence"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        Modifier
                      </button>
                    )}

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
                  </div>
                </td>
              </tr>
            );
          })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AgencyResidenceList;
