import React, { useState, useEffect } from 'react';
import { getAllUsersAdmin, toggleUserStatus, verifyUser } from '../../services/api';
import AdminUserDocumentsModal from './AdminUserDocumentsModal';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Modal pour visualiser les documents uploadés
  const [selectedUserForDocs, setSelectedUserForDocs] = useState(null);

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

  const parseDocumentUrls = (raw) => {
    if (!raw) return [];
    if (Array.isArray(raw)) {
      return raw
        .map((item) => (typeof item === 'string' ? item : item?.url || item?.documentUrl || ''))
        .filter(Boolean);
    }
    const str = String(raw).trim();
    if (!str) return [];
    if (str.startsWith('[') && str.endsWith(']')) {
      try {
        const parsed = JSON.parse(str);
        if (Array.isArray(parsed)) {
          return parsed
            .map((item) => (typeof item === 'string' ? item : item?.url || item?.documentUrl || ''))
            .filter(Boolean);
        }
      } catch (e) {
        // Fallback vers split classique
      }
    }
    return str
      .split(/[,;\n]+/)
      .map((s) => s.replace(/^[\[\]"']+|[\[\]"']+$/g, '').trim())
      .filter(Boolean);
  };

  const getUserDocuments = (user) => {
    if (!user) return [];
    const isClient = user.role === 'CLIENT';
    const isAgency = user.role === 'PROFESSIONAL' || user.role === 'AGENCE';

    let rawSources = [];
    if (isClient) {
      if (user.identityDocumentUrl) rawSources.push(user.identityDocumentUrl);
      else if (user.documentUrl) rawSources.push(user.documentUrl);
      else if (user.documents) rawSources.push(user.documents);
    } else if (isAgency) {
      if (user.agencyDocumentUrl) rawSources.push(user.agencyDocumentUrl);
      else if (user.documentUrl) rawSources.push(user.documentUrl);
      else if (user.identityDocumentUrl) rawSources.push(user.identityDocumentUrl);
      else if (user.documents) rawSources.push(user.documents);
    } else {
      if (user.identityDocumentUrl) rawSources.push(user.identityDocumentUrl);
      if (user.agencyDocumentUrl) rawSources.push(user.agencyDocumentUrl);
      if (user.documentUrl) rawSources.push(user.documentUrl);
      if (user.documents) rawSources.push(user.documents);
    }

    const allUrls = rawSources.flatMap(parseDocumentUrls);
    const seenFilenames = new Set();
    const docs = [];

    allUrls.forEach((url) => {
      const clean = String(url).trim().replace(/^[\[\]"']+|[\[\]"']+$/g, '').trim();
      const filename = clean.split(/[/\\]/).pop().toLowerCase();
      if (filename && !seenFilenames.has(filename)) {
        seenFilenames.add(filename);
        const isPdfDoc = filename.endsWith('.pdf');
        docs.push({
          title: isClient
            ? (allUrls.length > 1 ? `Pièce d'identité (CIN) - Page ${docs.length + 1}` : "Pièce d'identité (CIN)")
            : `Justificatif légal ${docs.length + 1} (${isPdfDoc ? 'PDF' : 'Image'})`,
          url: clean,
          documentUrl: clean,
        });
      }
    });

    return docs;
  };

  const resolveDocUrl = (url, useApiFallback = false) => {
    if (!url) return '';
    let trimmed = String(url).trim().replace(/^[\[\]"']+|[\[\]"']+$/g, '').trim();

    // Remplacer un éventuel port frontend par le port backend 8080
    if (trimmed.includes('localhost:5173') || trimmed.includes('localhost:3000')) {
      trimmed = trimmed.replace(/http:\/\/localhost:(5173|3000)/, 'http://localhost:8080');
    }

    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
      return trimmed;
    }

    // Normaliser le chemin : préfixer par /uploads/ si nécessaire
    let cleanPath = trimmed;
    if (!cleanPath.startsWith('/uploads/') && !cleanPath.startsWith('uploads/') && !cleanPath.startsWith('/api/')) {
      cleanPath = cleanPath.startsWith('/') ? `/uploads${cleanPath}` : `/uploads/${cleanPath}`;
    } else if (!cleanPath.startsWith('/')) {
      cleanPath = `/${cleanPath}`;
    }

    if (useApiFallback && cleanPath.startsWith('/uploads/')) {
      const filename = cleanPath.replace('/uploads/', '');
      return `http://localhost:8080/api/files/download/${filename}`;
    }

    return `http://localhost:8080${cleanPath}`;
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

      {/* MODAL DE VISUALISATION DES DOCUMENTS POUR APPROBATION ET IMPRESSION */}
      {selectedUserForDocs && (
        <AdminUserDocumentsModal
          user={selectedUserForDocs}
          onClose={() => setSelectedUserForDocs(null)}
          onVerify={handleVerify}
          actionLoading={actionLoading === selectedUserForDocs.id}
        />
      )}
    </div>
  );
};

export default AdminUsers;
