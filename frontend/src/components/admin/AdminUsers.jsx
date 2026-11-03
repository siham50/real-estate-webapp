import React, { useState, useEffect } from 'react';
import { getAllUsersAdmin, toggleUserStatus, verifyUser } from '../../services/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Modal pour visualiser les documents uploadés
  const [selectedUserForDocs, setSelectedUserForDocs] = useState(null);
  const [activeDocIndex, setActiveDocIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [selectedUserForDocs, activeDocIndex]);

  const fetchUsers = async () => {
    setLoading(true);
    setFeedback({ type: '', message: '' });
    try {
      const data = await getAllUsersAdmin();
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        setUsers([]);
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Erreur lors de la récupération des utilisateurs.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleVerify = async (id) => {
    setActionLoading(id);
    setFeedback({ type: '', message: '' });
    try {
      const updatedUser = await verifyUser(id);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, isIdentityVerified: true, ...updatedUser } : u))
      );
      if (selectedUserForDocs && selectedUserForDocs.id === id) {
        setSelectedUserForDocs((prev) => ({ ...prev, isIdentityVerified: true, ...updatedUser }));
      }
      setFeedback({
        type: 'success',
        message: `L'utilisateur #${id} a été vérifié et approuvé avec succès.`,
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || "Erreur lors de l'approbation de l'utilisateur.",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (id, newStatus) => {
    setActionLoading(id);
    setFeedback({ type: '', message: '' });
    try {
      const updatedUser = await toggleUserStatus(id, newStatus);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, isActive: newStatus, ...updatedUser } : u))
      );
      if (selectedUserForDocs && selectedUserForDocs.id === id) {
        setSelectedUserForDocs((prev) => ({ ...prev, isActive: newStatus, ...updatedUser }));
      }
      setFeedback({
        type: 'success',
        message: newStatus
          ? `L'utilisateur #${id} a été réactivé avec succès.`
          : `L'utilisateur #${id} a été banni.`,
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || "Erreur lors du changement de statut de l'utilisateur.",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getUserDocuments = (user) => {
    if (!user) return [];
    if (user.role === 'CLIENT') {
      if (user.identityDocumentUrl) {
        return [{ title: "Pièce d'identité (CIN)", url: user.identityDocumentUrl }];
      }
      return [];
    }
    if (user.role === 'PROFESSIONAL' || user.role === 'AGENCE') {
      if (!user.agencyDocumentUrl) return [];
      const parts = user.agencyDocumentUrl.split(',').map((s) => s.trim()).filter(Boolean);
      return parts.map((url, idx) => ({
        title: `Justificatif légal ${idx + 1} (${url.toLowerCase().endsWith('.pdf') ? 'PDF' : 'Image'})`,
        url,
      }));
    }
    return [];
  };

  const resolveDocUrl = (url, useApiFallback = false) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    if (useApiFallback && cleanPath.startsWith('/uploads/')) {
      const filename = cleanPath.replace('/uploads/', '');
      return `http://localhost:8080/api/files/download/${filename}`;
    }
    return `http://localhost:8080${cleanPath}`;
  };

  const isPdf = (url) => {
    if (!url) return false;
    return url.toLowerCase().includes('.pdf');
  };

  // Filtrage selon le rôle sélectionné et la recherche
  const filteredUsers = users.filter((u) => {
    if (filterRole === 'CLIENT' && u.role !== 'CLIENT') return false;
    if (filterRole === 'PROFESSIONAL' && u.role !== 'PROFESSIONAL' && u.role !== 'AGENCE') return false;

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const fullName = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
      const email = (u.email || '').toLowerCase();
      return fullName.includes(query) || email.includes(query);
    }

    return true;
  });

  const countTotal = users.length;
  const countClients = users.filter((u) => u.role === 'CLIENT').length;
  const countProfessionals = users.filter((u) => u.role === 'PROFESSIONAL' || u.role === 'AGENCE').length;

  const currentDocs = selectedUserForDocs ? getUserDocuments(selectedUserForDocs) : [];
  const activeDoc = currentDocs[activeDocIndex] || currentDocs[0];
  const activeDocFullUrl = activeDoc ? resolveDocUrl(activeDoc.url) : '';

  return (
    <div className="admin-users-view">
      {/* Header section */}
      <div className="admin-view-header">
        <div>
          <h2 className="admin-view-title">Gestion des Utilisateurs</h2>
          <p className="admin-view-subtitle">
            Consultez les justificatifs légaux (CIN et pièces d'agences) et approuvez les comptes en toute conformité.
          </p>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback.message && (
        <div
          className={`auth-alert ${feedback.type === 'success' ? 'auth-alert-success' : 'auth-alert-error'}`}
          style={{ marginBottom: '20px' }}
        >
          {feedback.message}
        </div>
      )}

      {/* Toolbar: Filtres de Rôle & Recherche */}
      <div className="admin-table-toolbar">
        <div className="admin-filter-group">
          <button
            type="button"
            className={`admin-filter-pill ${filterRole === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilterRole('ALL')}
          >
            Tous <span className="pill-count">{countTotal}</span>
          </button>
          <button
            type="button"
            className={`admin-filter-pill ${filterRole === 'CLIENT' ? 'active' : ''}`}
            onClick={() => setFilterRole('CLIENT')}
          >
            Clients <span className="pill-count">{countClients}</span>
          </button>
          <button
            type="button"
            className={`admin-filter-pill ${filterRole === 'PROFESSIONAL' ? 'active' : ''}`}
            onClick={() => setFilterRole('PROFESSIONAL')}
          >
            Professionnels <span className="pill-count">{countProfessionals}</span>
          </button>
        </div>

        <div className="admin-search-wrapper">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher par nom, prénom ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="admin-search-input"
          />
        </div>
      </div>

      {/* Tableau Utilisateurs */}
      <div className="admin-table-container">
        {loading ? (
          <div className="admin-table-loading">
            <div className="spinner-sm"></div>
            <span>Chargement des utilisateurs...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="admin-table-empty">
            <p>Aucun utilisateur trouvé pour ce filtre.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>ID</th>
                <th>Nom Complet</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Justificatifs</th>
                <th>Vérifié</th>
                <th>Statut</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const fullName = `${u.firstName || ''} ${u.lastName || ''}`.trim() || '—';
                const isVerified = Boolean(u.isIdentityVerified);
                const isActive = u.isActive !== false;
                const isProcessing = actionLoading === u.id;
                const docs = getUserDocuments(u);

                return (
                  <tr key={u.id} className={!isActive ? 'row-banned' : ''}>
                    {/* ID */}
                    <td className="user-cell-id">#{u.id}</td>

                    {/* Nom Complet */}
                    <td className="user-cell-name">
                      <div className="user-name-wrapper">
                        <div className="user-avatar-mini">
                          {u.firstName ? u.firstName.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <span className="user-fullname">{fullName}</span>
                          {u.companyName && (
                            <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>
                              🏢 {u.companyName}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="user-cell-email">{u.email}</td>

                    {/* Rôle */}
                    <td>
                      {u.role === 'ADMIN' ? (
                        <span className="badge badge-danger">ADMIN</span>
                      ) : u.role === 'PROFESSIONAL' || u.role === 'AGENCE' ? (
                        <span className="badge badge-success">PROFESSIONAL</span>
                      ) : (
                        <span className="badge badge-info">CLIENT</span>
                      )}
                    </td>

                    {/* Justificatifs / Documents */}
                    <td>
                      {docs.length > 0 ? (
                        <button
                          type="button"
                          className={`btn-doc-badge ${u.role === 'CLIENT' ? 'btn-doc-client' : 'btn-doc-agency'}`}
                          onClick={() => {
                            setSelectedUserForDocs(u);
                            setActiveDocIndex(0);
                          }}
                          title="Cliquez pour examiner les fichiers uploadés"
                        >
                          {u.role === 'CLIENT' ? (
                            <>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                <rect x="3" y="4" width="18" height="16" rx="3" />
                                <circle cx="9" cy="10" r="2" />
                                <line x1="15" y1="8" x2="17" y2="8" />
                                <line x1="15" y1="12" x2="17" y2="12" />
                              </svg>
                              <span>Voir CIN</span>
                            </>
                          ) : (
                            <>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                              </svg>
                              <span>{docs.length} document{docs.length > 1 ? 's' : ''}</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="doc-empty">Aucun</span>
                      )}
                    </td>

                    {/* Vérifié */}
                    <td>
                      {isVerified ? (
                        <span className="badge badge-success">Oui</span>
                      ) : (
                        <span className="badge badge-secondary">Non</span>
                      )}
                    </td>

                    {/* Statut */}
                    <td>
                      {isActive ? (
                        <span className="badge badge-success">Actif</span>
                      ) : (
                        <span className="badge badge-danger">Banni</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {/* Si non vérifié : Bouton Approuver (bleu) */}
                      {!isVerified && (
                        <button
                          type="button"
                          className="btn-action btn-action-approve"
                          onClick={() => handleVerify(u.id)}
                          disabled={isProcessing}
                          title="Approuver l'identité de l'utilisateur"
                        >
                          {isProcessing ? '...' : 'Approuver'}
                        </button>
                      )}

                      {/* Si actif : Bouton Bannir (rouge) */}
                      {isActive ? (
                        <button
                          type="button"
                          className="btn-action btn-action-ban"
                          onClick={() => handleToggleStatus(u.id, false)}
                          disabled={isProcessing}
                          title="Bannir l'utilisateur"
                        >
                          {isProcessing ? '...' : 'Bannir'}
                        </button>
                      ) : (
                        /* Si banni : Bouton Réactiver (orange) */
                        <button
                          type="button"
                          className="btn-action btn-action-reactivate"
                          onClick={() => handleToggleStatus(u.id, true)}
                          disabled={isProcessing}
                          title="Réactiver l'accès de l'utilisateur"
                        >
                          {isProcessing ? '...' : 'Réactiver'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL DE VISUALISATION DES DOCUMENTS POUR APPROBATION */}
      {selectedUserForDocs && (
        <div className="admin-doc-modal-overlay" onClick={() => setSelectedUserForDocs(null)}>
          <div className="admin-doc-modal-container" onClick={(e) => e.stopPropagation()}>
            {/* Header du modal */}
            <div className="admin-doc-modal-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a', fontWeight: 700 }}>
                    Documents Justificatifs
                  </h3>
                  {selectedUserForDocs.isIdentityVerified ? (
                    <span className="badge badge-success">✓ Compte Approuvé</span>
                  ) : (
                    <span className="badge badge-warning">En attente d'approbation</span>
                  )}
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                  {selectedUserForDocs.role === 'PROFESSIONAL' || selectedUserForDocs.role === 'AGENCE'
                    ? 'Dossier Agence Immobilière'
                    : 'Dossier Pièce d’Identité Client'}{' '}
                  • <strong>{selectedUserForDocs.firstName} {selectedUserForDocs.lastName}</strong> ({selectedUserForDocs.email})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUserForDocs(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '1.6rem',
                  lineHeight: 1,
                  cursor: 'pointer',
                  color: '#94a3b8',
                  padding: '4px 8px',
                }}
                title="Fermer"
              >
                ✕
              </button>
            </div>

            {/* Informations légales Agence si professionnel */}
            {(selectedUserForDocs.role === 'PROFESSIONAL' || selectedUserForDocs.role === 'AGENCE') && (
              <div
                style={{
                  padding: '12px 24px',
                  background: '#f0f9ff',
                  borderBottom: '1px solid #e0f2fe',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '12px',
                  fontSize: '0.85rem',
                }}
              >
                <div>
                  <span style={{ color: '#0369a1', display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>
                    Entreprise / Raison Sociale
                  </span>
                  <strong style={{ color: '#0c4a6e', fontSize: '0.9rem' }}>
                    {selectedUserForDocs.companyName || 'Non renseigné'}
                  </strong>
                </div>
                <div>
                  <span style={{ color: '#0369a1', display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>
                    Numéro Registre du Commerce (RC)
                  </span>
                  <strong style={{ color: '#0c4a6e', fontSize: '0.9rem' }}>
                    {selectedUserForDocs.rcNumber || 'Non renseigné'}
                  </strong>
                </div>
                <div>
                  <span style={{ color: '#0369a1', display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>
                    Identifiant Commun Entreprise (ICE)
                  </span>
                  <strong style={{ color: '#0c4a6e', fontSize: '0.9rem' }}>
                    {selectedUserForDocs.iceNumber || 'Non renseigné'}
                  </strong>
                </div>
              </div>
            )}

            {/* Onglets si plusieurs documents (ex: agence avec jusqu'à 5 fichiers) */}
            {currentDocs.length > 1 && (
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  padding: '10px 24px',
                  background: '#f8fafc',
                  borderBottom: '1px solid #e2e8f0',
                  overflowX: 'auto',
                }}
              >
                {currentDocs.map((doc, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`admin-doc-tab ${activeDocIndex === idx ? 'active' : ''}`}
                    onClick={() => setActiveDocIndex(idx)}
                  >
                    {isPdf(doc.url) ? '📕' : '🖼️'} Document {idx + 1}
                  </button>
                ))}
              </div>
            )}

            {/* Zone d'affichage du document actif */}
            <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, minHeight: '380px', maxHeight: '550px' }}>
              {activeDoc ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontWeight: 600, color: '#334155', fontSize: '0.9rem' }}>
                      {activeDoc.title}
                    </span>
                    <a
                      href={activeDocFullUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-action btn-action-approve"
                      style={{
                        textDecoration: 'none',
                        fontSize: '0.8rem',
                        padding: '6px 12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span>Ouvrir dans un nouvel onglet</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </a>
                  </div>

                  {isPdf(activeDoc.url) ? (
                    <div style={{ width: '100%', height: '480px', border: '1px solid #cbd5e1', borderRadius: '10px', overflow: 'hidden', background: '#f1f5f9' }}>
                      <iframe
                        src={activeDocFullUrl}
                        title={activeDoc.title}
                        style={{ width: '100%', height: '100%', border: 'none' }}
                      />
                    </div>
                  ) : (
                    <div
                      style={{
                        textAlign: 'center',
                        background: '#0f172a',
                        padding: '16px',
                        borderRadius: '10px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: '350px',
                      }}
                    >
                      <img
                        src={imageError ? resolveDocUrl(activeDoc.url, true) : activeDocFullUrl}
                        alt={activeDoc.title}
                        onError={(e) => {
                          if (!imageError) {
                            setImageError(true);
                          }
                        }}
                        style={{
                          maxWidth: '100%',
                          maxHeight: '460px',
                          objectFit: 'contain',
                          borderRadius: '6px',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                        }}
                      />
                      {imageError && (
                        <div style={{ marginTop: '12px', color: '#f87171', fontSize: '0.82rem' }}>
                          <span>Aperçu alternatif chargé via l'API. Si l'image ne s'affiche pas, </span>
                          <a
                            href={activeDocFullUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#60a5fa', textDecoration: 'underline' }}
                          >
                            cliquez ici pour ouvrir directement le fichier
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                  <p>Aucun document disponible pour cet utilisateur.</p>
                </div>
              )}
            </div>

            {/* Pied du modal avec actions d'approbation */}
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid #e2e8f0',
                background: '#f8fafc',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <button
                type="button"
                onClick={() => setSelectedUserForDocs(null)}
                className="btn-action btn-secondary"
                style={{ padding: '8px 16px' }}
              >
                Fermer
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {!selectedUserForDocs.isIdentityVerified ? (
                  <button
                    type="button"
                    className="btn-action btn-action-approve"
                    style={{
                      padding: '9px 18px',
                      fontSize: '0.9rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontWeight: 600,
                    }}
                    onClick={() => handleVerify(selectedUserForDocs.id)}
                    disabled={actionLoading === selectedUserForDocs.id}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>
                      {actionLoading === selectedUserForDocs.id
                        ? 'Approbation en cours...'
                        : 'Approuver ce compte maintenant'}
                    </span>
                  </button>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: '#dcfce7',
                      color: '#166534',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                    }}
                  >
                    <span>✓ Ce compte a déjà été validé et approuvé</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
