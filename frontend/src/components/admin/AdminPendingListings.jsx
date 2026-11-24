import React, { useState, useEffect } from 'react';
import {
  getPendingListings,
  getPendingResidences,
  approveProperty,
  approveResidence,
  rejectPropertyListing,
  rejectResidenceListing,
} from '../../services/api';
import { getImageUrl } from '../../utils/imageUtils';

const AdminPendingListings = () => {
  const [properties, setProperties] = useState([]);
  const [residences, setResidences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL'); // 'ALL', 'PROPERTY', 'RESIDENCE'
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Modal pour visualiser les documents
  const [selectedItemForDocs, setSelectedItemForDocs] = useState(null);

  const fetchListings = async () => {
    setLoading(true);
    setFeedback({ type: '', message: '' });
    try {
      const [listingsData, residencesData] = await Promise.all([
        getPendingListings().catch(() => ({ properties: [] })),
        getPendingResidences().catch(() => []),
      ]);

      let propsList = [];
      let resList = [];

      if (listingsData && Array.isArray(listingsData.properties)) {
        propsList = listingsData.properties;
      } else if (Array.isArray(listingsData)) {
        propsList = listingsData.filter((item) => item.itemType === 'PROPERTY' || item.type || item.purpose);
      }

      if (Array.isArray(residencesData) && residencesData.length > 0) {
        resList = residencesData;
      } else if (listingsData && Array.isArray(listingsData.residences)) {
        resList = listingsData.residences;
      }

      setProperties(propsList);
      setResidences(resList);
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Erreur lors du chargement des annonces en attente.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  // Normalisation des annonces pour affichage dans les tableaux
  const normalizedProperties = properties.map((p) => {
    const docs = Array.isArray(p.documents) && p.documents.length > 0
      ? p.documents.map((d) => (typeof d === 'string' ? d : d.documentUrl)).filter(Boolean)
      : (p.documentUrl ? [p.documentUrl] : []);
    const clientName = p.owner
      ? `${p.owner.firstName || ''} ${p.owner.lastName || ''}`.trim() || p.owner.email
      : 'Client inconnu';

    return {
      ...p,
      itemType: 'PROPERTY',
      displayTitle: p.title,
      displayType: p.type ? `Bien (${p.type})` : 'Bien immobilier',
      allDocs: docs,
      docUrl: docs[0] || null,
      clientName,
    };
  });

  const normalizedResidences = residences.map((r) => {
    const docs = Array.isArray(r.documents) && r.documents.length > 0
      ? r.documents.map((d) => (typeof d === 'string' ? d : d.documentUrl)).filter(Boolean)
      : (r.documentUrl ? [r.documentUrl] : []);
    const clientName = r.owner
      ? `${r.owner.firstName || ''} ${r.owner.lastName || ''}`.trim() || r.owner.email
      : 'Client inconnu';

    return {
      ...r,
      itemType: 'RESIDENCE',
      displayTitle: r.name,
      displayType: 'Résidence',
      allDocs: docs,
      docUrl: docs[0] || null,
      clientName,
    };
  });

  const handleApprove = async (item) => {
    const isProp = item.itemType === 'PROPERTY';
    const actionKey = `${item.itemType}-${item.id}`;
    setActionLoading(actionKey);
    setFeedback({ type: '', message: '' });

    try {
      if (isProp) {
        await approveProperty(item.id);
      } else {
        await approveResidence(item.id);
      }

      setFeedback({
        type: 'success',
        message: `L'annonce "${item.displayTitle}" a été approuvée avec succès et est désormais publiée.`,
      });

      if (selectedItemForDocs && selectedItemForDocs.id === item.id && selectedItemForDocs.itemType === item.itemType) {
        setSelectedItemForDocs(null);
      }

      // Rafraîchir les listes
      await fetchListings();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || "Erreur lors de l'approbation de l'annonce.",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (item) => {
    const isProp = item.itemType === 'PROPERTY';
    const actionKey = `${item.itemType}-${item.id}`;
    if (!window.confirm(`Êtes-vous sûr de vouloir rejeter l'annonce "${item.displayTitle}" ?`)) {
      return;
    }

    setActionLoading(actionKey);
    setFeedback({ type: '', message: '' });

    try {
      if (isProp) {
        await rejectPropertyListing(item.id);
        setProperties((prev) => prev.filter((p) => p.id !== item.id));
      } else {
        await rejectResidenceListing(item.id);
        setResidences((prev) => prev.filter((r) => r.id !== item.id));
      }

      setFeedback({
        type: 'success',
        message: `L'annonce "${item.displayTitle}" a été rejetée.`,
      });

      if (selectedItemForDocs && selectedItemForDocs.id === item.id && selectedItemForDocs.itemType === item.itemType) {
        setSelectedItemForDocs(null);
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || "Erreur lors du rejet de l'annonce.",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const filterList = (list) => {
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter((item) => {
      const title = (item.displayTitle || '').toLowerCase();
      const city = (item.city || '').toLowerCase();
      const address = (item.address || '').toLowerCase();
      const owner = `${item.owner?.firstName || ''} ${item.owner?.lastName || ''} ${item.owner?.email || ''}`.toLowerCase();
      return title.includes(q) || city.includes(q) || address.includes(q) || owner.includes(q);
    });
  };

  const filteredProps = filterList(normalizedProperties);
  const filteredRes = filterList(normalizedResidences);

  const countProps = properties.length;
  const countRes = residences.length;
  const countTotal = countProps + countRes;

  const isPdf = (url) => typeof url === 'string' && url.toLowerCase().includes('.pdf');

  const renderTable = (items, itemTypeLabel) => {
    if (items.length === 0) {
      return (
        <div className="admin-table-empty" style={{ padding: '30px 20px', background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
          <p className="empty-title" style={{ fontSize: '0.95rem', margin: 0, color: '#64748b' }}>
            Aucun {itemTypeLabel.toLowerCase()} en attente de validation.
          </p>
        </div>
      );
    }

    return (
      <div className="admin-table-container" style={{ marginBottom: '28px' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>{itemTypeLabel === 'Bien' ? 'Titre du bien' : 'Nom de la résidence'}</th>
              <th>Type / Catégorie</th>
              <th>Propriétaire</th>
              <th>Statut</th>
              <th>Documents</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const actionKey = `${item.itemType}-${item.id}`;
              const isProcessing = actionLoading === actionKey;
              const ownerName = item.owner
                ? `${item.owner.firstName || ''} ${item.owner.lastName || ''}`.trim() || item.owner.email
                : 'Client inconnu';

              return (
                <tr key={actionKey}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.displayTitle}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      📍 {item.address ? `${item.address}, ` : ''}{item.city || 'Maroc'}
                    </div>
                  </td>

                  <td>
                    <span className={`admin-role-badge ${item.itemType === 'RESIDENCE' ? 'role-agency' : 'role-client'}`}>
                      {item.displayType}
                    </span>
                  </td>

                  <td>
                    <div style={{ fontWeight: 500, color: '#334155' }}>{ownerName}</div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{item.owner?.email || '-'}</div>
                  </td>

                  <td>
                    <span className="admin-status-badge status-warning" style={{ background: '#fef3c7', color: '#b45309' }}>
                      En attente
                    </span>
                  </td>

                  <td>
                    {item.allDocs && item.allDocs.length > 0 ? (
                      <button
                        type="button"
                        className="btn-action btn-action-view"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: '#f1f5f9',
                          color: '#1e293b',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          padding: '5px 10px',
                          fontSize: '0.82rem',
                          fontWeight: 500,
                          cursor: 'pointer',
                        }}
                        onClick={() => setSelectedItemForDocs(item)}
                      >
                        <span>📄 Voir documents ({item.allDocs.length})</span>
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Aucun document</span>
                    )}
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        className="btn-action btn-action-approve"
                        style={{
                          background: '#dcfce7',
                          color: '#15803d',
                          border: '1px solid #86efac',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                        disabled={isProcessing}
                        onClick={() => handleApprove(item)}
                      >
                        {isProcessing ? 'Traitement...' : '✓ Approuver'}
                      </button>

                      <button
                        type="button"
                        className="btn-action btn-action-delete"
                        style={{
                          background: '#fee2e2',
                          color: '#b91c1c',
                          border: '1px solid #fca5a5',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                        disabled={isProcessing}
                        onClick={() => handleReject(item)}
                      >
                        ✕ Rejeter
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="admin-properties-view">
      {/* Header section */}
      <div className="admin-view-header">
        <div>
          <h2 className="admin-view-title">Validation des Annonces</h2>
          <p className="admin-view-subtitle">
            Vérifiez les documents de propriété soumis par les clients et approuvez ou rejetez les annonces avant diffusion.
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
            className={`admin-filter-pill ${filterType === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilterType('ALL')}
          >
            Toutes les annonces <span className="pill-count">{countTotal}</span>
          </button>
          <button
            type="button"
            className={`admin-filter-pill ${filterType === 'PROPERTY' ? 'active' : ''}`}
            onClick={() => setFilterType('PROPERTY')}
          >
            Biens en attente <span className="pill-count">{countProps}</span>
          </button>
          <button
            type="button"
            className={`admin-filter-pill ${filterType === 'RESIDENCE' ? 'active' : ''}`}
            onClick={() => setFilterType('RESIDENCE')}
          >
            Résidences en attente <span className="pill-count">{countRes}</span>
          </button>
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

      {loading ? (
        <div className="admin-table-loading" style={{ padding: '40px 0' }}>
          <div className="admin-spinner" />
          <p>Chargement des annonces en attente...</p>
        </div>
      ) : (
        <>
          {/* Tableau 1 : Biens en attente */}
          {(filterType === 'ALL' || filterType === 'PROPERTY') && (
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🏠 Biens en attente de validation</span>
                  <span style={{ fontSize: '0.78rem', background: '#e0e7ff', color: '#3730a3', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                    {filteredProps.length}
                  </span>
                </h3>
              </div>
              {renderTable(filteredProps, 'Bien')}
            </div>
          )}

          {/* Tableau 2 : Résidences en attente */}
          {(filterType === 'ALL' || filterType === 'RESIDENCE') && (
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🏢 Résidences en attente de validation</span>
                  <span style={{ fontSize: '0.78rem', background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                    {filteredRes.length}
                  </span>
                </h3>
              </div>
              {renderTable(filteredRes, 'Résidence')}
            </div>
          )}
        </>
      )}

      {/* Modale de visualisation des documents de propriété */}
      {selectedItemForDocs && (
        <div
          className="admin-modal-overlay"
          onClick={() => setSelectedItemForDocs(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
        >
          <div
            className="admin-modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#fff',
              borderRadius: '14px',
              maxWidth: '650px',
              width: '100%',
              overflow: 'hidden',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '90vh',
            }}
          >
            {/* Header de la modale */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '18px 24px',
                borderBottom: '1px solid #e2e8f0',
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: 600 }}>
                  Documents de propriété
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                  {selectedItemForDocs.displayTitle} — {selectedItemForDocs.displayType}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItemForDocs(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '20px',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px 8px',
                }}
              >
                ✕
              </button>
            </div>

            {/* Corps de la modale */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              {selectedItemForDocs.allDocs && selectedItemForDocs.allDocs.length > 0 ? (
                <div>
                  <div style={{ marginBottom: '16px' }}>
                    <span style={{ fontWeight: 600, color: '#334155', fontSize: '0.95rem' }}>
                      Documents de propriété / Titres fonciers ({selectedItemForDocs.allDocs.length})
                    </span>
                    <p style={{ margin: '4px 0 12px', fontSize: '0.84rem', color: '#64748b' }}>
                      Transmis par <strong>{selectedItemForDocs.clientName}</strong> ({selectedItemForDocs.owner?.email || 'Client'}).
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {selectedItemForDocs.allDocs.map((url, idx) => {
                      const pdf = isPdf(url);
                      const fullUrl = getImageUrl(url);
                      return (
                        <div
                          key={idx}
                          style={{
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            background: '#f8fafc',
                            padding: '16px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b' }}>
                              {pdf ? '📕 Document PDF' : '🖼️ Document Image'} #{idx + 1}
                            </span>
                            <a
                              href={fullUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                fontSize: '0.84rem',
                                color: '#0284c7',
                                textDecoration: 'none',
                                fontWeight: 600,
                              }}
                            >
                              Ouvrir dans un nouvel onglet ↗
                            </a>
                          </div>

                          {pdf ? (
                            <div style={{ textAlign: 'center', padding: '16px', background: '#ffffff', borderRadius: '6px', border: '1px dashed #cbd5e1' }}>
                              <span style={{ fontSize: '36px', display: 'block', marginBottom: '6px' }}>📕</span>
                              <p style={{ margin: '0 0 10px', fontSize: '0.85rem', color: '#475569' }}>
                                Titre foncier ou acte notarié au format PDF
                              </p>
                              <a
                                href={fullUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  padding: '7px 14px',
                                  borderRadius: '6px',
                                  background: '#0284c7',
                                  color: '#fff',
                                  fontSize: '0.84rem',
                                  fontWeight: 500,
                                  textDecoration: 'none',
                                }}
                              >
                                Consulter le PDF ↗
                              </a>
                            </div>
                          ) : (
                            <div style={{ textAlign: 'center', background: '#ffffff', borderRadius: '6px', overflow: 'hidden', padding: '10px' }}>
                              <img
                                src={fullUrl}
                                alt={`Document ${idx + 1}`}
                                style={{
                                  maxWidth: '100%',
                                  maxHeight: '340px',
                                  objectFit: 'contain',
                                  display: 'inline-block',
                                  borderRadius: '4px',
                                }}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '30px 20px', color: '#94a3b8' }}>
                  <p>Aucun document de propriété joint à cette annonce.</p>
                </div>
              )}
            </div>

            {/* Footer de la modale avec actions rapides */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
                padding: '16px 24px',
                borderTop: '1px solid #e2e8f0',
                background: '#f8fafc',
              }}
            >
              <button
                type="button"
                onClick={() => setSelectedItemForDocs(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#fff',
                  color: '#475569',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                Fermer
              </button>

              <button
                type="button"
                className="btn-action btn-action-delete"
                style={{
                  background: '#fee2e2',
                  color: '#b91c1c',
                  border: '1px solid #fca5a5',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                disabled={actionLoading === `${selectedItemForDocs.itemType}-${selectedItemForDocs.id}`}
                onClick={() => handleReject(selectedItemForDocs)}
              >
                Rejeter l'annonce
              </button>

              <button
                type="button"
                className="btn-action btn-action-approve"
                style={{
                  background: '#16a34a',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 18px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                disabled={actionLoading === `${selectedItemForDocs.itemType}-${selectedItemForDocs.id}`}
                onClick={() => handleApprove(selectedItemForDocs)}
              >
                Approuver et Publier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPendingListings;

