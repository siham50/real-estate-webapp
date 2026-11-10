import React, { useState, useEffect } from 'react';
import { getAllPropertiesAdmin, togglePropertyAvailability, hardDeleteProperty } from '../../services/api';

const AdminProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const fetchProperties = async () => {
    setLoading(true);
    setFeedback({ type: '', message: '' });
    try {
      const data = await getAllPropertiesAdmin();
      if (Array.isArray(data)) {
        setProperties(data);
      } else {
        setProperties([]);
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Erreur lors du chargement des annonces.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleToggle = async (id) => {
    setActionLoading(id);
    setFeedback({ type: '', message: '' });
    try {
      await togglePropertyAvailability(id);
      setFeedback({
        type: 'success',
        message: `La visibilité du bien #${id} a été modifiée avec succès.`,
      });
      // Recharger la liste comme demandé
      await fetchProperties();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Erreur lors de la modification de visibilité.',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer DÉFINITIVEMENT le bien #${id} ? Cette action est irréversible.`
    );
    if (!confirmed) return;

    setActionLoading(id);
    setFeedback({ type: '', message: '' });
    try {
      await hardDeleteProperty(id);
      setFeedback({
        type: 'success',
        message: `Le bien #${id} a été définitivement supprimé.`,
      });
      // Recharger la liste comme demandé
      await fetchProperties();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Erreur lors de la suppression définitive.',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const filteredProperties = properties.filter((p) => {
    // Filtre statut
    if (filterStatus === 'AVAILABLE' && (!p.isAvailable || p.isDeleted)) return false;
    if (filterStatus === 'HIDDEN' && (p.isAvailable || p.isDeleted)) return false;
    if (filterStatus === 'DELETED' && !p.isDeleted) return false;

    // Filtre recherche par titre, ville ou propriétaire
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const title = (p.title || '').toLowerCase();
      const city = (p.city || '').toLowerCase();
      const owner = `${p.owner?.firstName || ''} ${p.owner?.lastName || ''}`.toLowerCase();
      return title.includes(q) || city.includes(q) || owner.includes(q);
    }

    return true;
  });

  const countTotal = properties.length;
  const countAvailable = properties.filter((p) => p.isAvailable && !p.isDeleted).length;
  const countHidden = properties.filter((p) => !p.isAvailable && !p.isDeleted).length;
  const countDeleted = properties.filter((p) => p.isDeleted).length;

  return (
    <div className="admin-properties-view">
      {/* Header section */}
      <div className="admin-view-header">
        <div>
          <h2 className="admin-view-title">Gestion des Annonces</h2>
          <p className="admin-view-subtitle">
            Supervisez les biens immobiliers, gérez leur visibilité ou supprimez définitivement les annonces frauduleuses.
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

      {/* Toolbar: Filtres et recherche */}
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
            className={`admin-filter-pill ${filterStatus === 'AVAILABLE' ? 'active' : ''}`}
            onClick={() => setFilterStatus('AVAILABLE')}
          >
            Disponibles <span className="pill-count">{countAvailable}</span>
          </button>
          <button
            type="button"
            className={`admin-filter-pill ${filterStatus === 'HIDDEN' ? 'active' : ''}`}
            onClick={() => setFilterStatus('HIDDEN')}
          >
            Masqués <span className="pill-count">{countHidden}</span>
          </button>
          {countDeleted > 0 && (
            <button
              type="button"
              className={`admin-filter-pill ${filterStatus === 'DELETED' ? 'active' : ''}`}
              onClick={() => setFilterStatus('DELETED')}
            >
              Supprimés <span className="pill-count">{countDeleted}</span>
            </button>
          )}
        </div>

        <div className="admin-search-wrapper">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher par titre, ville, propriétaire..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="admin-search-input"
          />
        </div>
      </div>

      {/* Table des biens */}
      <div className="admin-table-container">
        {loading ? (
          <div className="admin-table-loading">
            <div className="spinner-sm"></div>
            <span>Chargement des annonces...</span>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="admin-table-empty">
            <p>Aucune annonce trouvée pour ce filtre.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>ID</th>
                <th>Titre</th>
                <th>Propriétaire</th>
                <th>Ville</th>
                <th>Statut</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProperties.map((p) => {
                const ownerName =
                  `${p.owner?.firstName || ''} ${p.owner?.lastName || ''}`.trim() ||
                  p.owner?.email ||
                  '—';
                const isProcessing = actionLoading === p.id;

                return (
                  <tr key={p.id}>
                    <td className="user-cell-id">#{p.id}</td>
                    <td>
                      <div className="property-title-cell">
                        <span className="user-fullname">{p.title || 'Sans titre'}</span>
                        {p.price && (
                          <span className="property-price-hint">
                            {Number(p.price).toLocaleString('fr-FR')} MAD
                          </span>
                        )}
                      </div>
                    </td>
                    <td>{ownerName}</td>
                    <td>{p.city || '—'}</td>
                    <td>
                      {p.isDeleted ? (
                        <span className="badge badge-danger">Supprimé</span>
                      ) : p.isAvailable ? (
                        <span className="badge badge-success">Disponible</span>
                      ) : (
                        <span className="badge badge-warning">Masqué</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {/* Bouton Masquer / Afficher (orange) */}
                      {!p.isDeleted && (
                        <button
                          type="button"
                          className="btn-action btn-warning"
                          onClick={() => handleToggle(p.id)}
                          disabled={isProcessing}
                          title={p.isAvailable ? 'Masquer cette annonce' : 'Rendre cette annonce visible'}
                        >
                          {isProcessing ? '...' : p.isAvailable ? 'Masquer' : 'Afficher'}
                        </button>
                      )}

                      {/* Bouton Supprimer Définitivement (rouge) */}
                      <button
                        type="button"
                        className="btn-action btn-danger"
                        onClick={() => handleDelete(p.id)}
                        disabled={isProcessing}
                        title="Supprimer définitivement cette annonce"
                      >
                        {isProcessing ? '...' : 'Supprimer Définitivement'}
                      </button>
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

export default AdminProperties;
