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

const AgencyPropertyList = ({ properties, onDeleted }) => {
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
                // Cherche l'image avec isPrimary = true
                const primaryImg = p.images.find((img) => img.isPrimary === true);
                // Si elle existe, on la prend, sinon on prend la première par défaut
                displayImage = primaryImg ? primaryImg : p.images[0];
              }
              const imageSrc = displayImage
                ? getImageUrl(typeof displayImage === 'string' ? displayImage : displayImage.imageUrl)
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
