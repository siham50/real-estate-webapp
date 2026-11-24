import React, { useState } from 'react';
import { deleteProperty } from '../services/api';
import { getImageUrl, DEFAULT_PLACEHOLDER_IMAGE } from '../utils/imageUtils';

const TYPE_LABELS = {
  HOUSE: 'Maison',
  VILLA: 'Villa',
  APARTMENT: 'Appartement',
  LAND: 'Terrain',
  COMMERCIAL: 'Commerce',
  OFFICE: 'Bureau',
};

const PURPOSE_LABELS = {
  SALE: 'Vente',
  RENT: 'Location',
};

const AgencyPropertyList = ({ properties, onDeleted, onEdit, onViewReviews }) => {
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Supprimer le bien "${title}" ? Cette action est irréversible.`)) return;
    setDeletingId(id);
    setError('');
    try {
      await deleteProperty(id);
      onDeleted(id);
    } catch (err) {
      setError(err.message || 'Erreur lors de la suppression.');
    } finally {
      setDeletingId(null);
    }
  };

  const formatPrice = (price) => {
    if (!price) return '-';
    return Number(price).toLocaleString('fr-MA') + ' MAD';
  };

  if (properties.length === 0) {
    return (
      <div className="agency-empty-state">
        <div className="agency-empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
        </div>
        <p className="agency-empty-title">Aucun bien immobilier</p>
        <p className="agency-empty-desc">Ajoutez votre premier bien en cliquant sur "+ Ajouter".</p>
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
              <th>Titre</th>
              <th>Type</th>
              <th>Usage</th>
              <th>Ville</th>
              <th>Prix</th>
              <th>Surface</th>
              <th>Vues</th>
              <th>Statut</th>
              <th>Résidence</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {properties.map((p) => {
              let displayImage = null;
              if (p.images && p.images.length > 0) {
                // Cherche spécifiquement l'image qui a isPrimary = true
                const primaryImg = p.images.find((img) => img.isPrimary === true || img.primary === true);
                // Si elle n'existe pas (bug), prend la première par défaut
                displayImage = primaryImg ? primaryImg : p.images[0];
              }
              const imageSrc = displayImage
                ? getImageUrl(displayImage.imageUrl || displayImage)
                : (p.image ? getImageUrl(p.image) : DEFAULT_PLACEHOLDER_IMAGE);

              return (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img
                        src={imageSrc}
                        alt={p.title}
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
                      <span className="agency-table-name">{p.title}</span>
                    </div>
                  </td>
                <td>{TYPE_LABELS[p.type] || p.type}</td>
                <td>
                  <span className={`agency-badge ${p.purpose === 'SALE' ? 'agency-badge-sale' : 'agency-badge-rent'}`}>
                    {PURPOSE_LABELS[p.purpose] || p.purpose}
                  </span>
                </td>
                <td>{p.city}</td>
                <td className="agency-table-price">{formatPrice(p.price)}</td>
                <td>{p.surfaceArea ? `${p.surfaceArea} m²` : '-'}</td>
                <td>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontWeight: 600,
                      color: '#475569',
                      fontSize: '0.88rem',
                    }}
                  >
                    <span>👁️</span> {p.views != null ? p.views : 0}
                  </span>
                </td>
                <td>
                  {p.isAvailable ? (
                    <span className="agency-badge agency-badge-available">Disponible</span>
                  ) : (
                    <span className="agency-badge agency-badge-hidden">Masqué</span>
                  )}
                </td>
                <td>{p.residence?.name || <span className="agency-table-muted">—</span>}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
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
                        onClick={() => onEdit(p)}
                        title="Modifier les infos et photos"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        Modifier
                      </button>
                    )}

                    {onViewReviews && (
                      <button
                        type="button"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: '#fefce8',
                          color: '#854d0e',
                          border: '1px solid #fef08a',
                          borderRadius: '6px',
                          padding: '5px 10px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                        onClick={() => onViewReviews(p)}
                        title="Voir les avis laissés sur cette annonce"
                      >
                        <span>⭐</span>
                        Avis
                      </button>
                    )}

                    <button
                      type="button"
                      className="agency-btn-delete"
                      onClick={() => handleDelete(p.id, p.title)}
                      disabled={deletingId === p.id}
                    >
                      {deletingId === p.id ? (
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

export default AgencyPropertyList;
