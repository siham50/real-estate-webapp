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
    const docs = [];
    const isClient = user.role === 'CLIENT';
    const isAgency = user.role === 'PROFESSIONAL' || user.role === 'AGENCE';

    if (isClient) {
      const clientUrls = [
        ...parseDocumentUrls(user.identityDocumentUrl),
        ...parseDocumentUrls(user.documentUrl),
      ];
      const uniqueUrls = Array.from(new Set(clientUrls));
      uniqueUrls.forEach((url, idx) => {
        docs.push({
          title: uniqueUrls.length > 1 ? `Pièce d'identité (CIN) - Page ${idx + 1}` : "Pièce d'identité (CIN)",
          url,
        });
      });
      return docs;
    }

    if (isAgency) {
      const agencyUrls = [
        ...parseDocumentUrls(user.agencyDocumentUrl),
        ...parseDocumentUrls(user.documentUrl),
        ...parseDocumentUrls(user.identityDocumentUrl),
      ];
      const uniqueUrls = Array.from(new Set(agencyUrls));
      uniqueUrls.forEach((url, idx) => {
        const isPdfDoc = url.toLowerCase().includes('.pdf');
        docs.push({
          title: `Justificatif légal ${idx + 1} (${isPdfDoc ? 'PDF' : 'Image'})`,
          url,
        });
      });
      return docs;
    }

    // Fallback pour tout autre rôle
    const otherUrls = [
      ...parseDocumentUrls(user.identityDocumentUrl),
      ...parseDocumentUrls(user.agencyDocumentUrl),
      ...parseDocumentUrls(user.documentUrl),
    ];
    Array.from(new Set(otherUrls)).forEach((url, idx) => {
      docs.push({
        title: `Document Justificatif ${idx + 1}`,
        url,
      });
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

  const isPdf = (url) => {
    if (!url) return false;
    return url.toLowerCase().includes('.pdf');
  };

  const handleOpenDoc = (e, fullUrl, title, autoPrint = false) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!fullUrl) return;

    const newWindow = window.open('', '_blank');
    if (!newWindow) {
      window.location.href = fullUrl;
      return;
    }

    const docName = (fullUrl || '').split('/').pop() || 'document';
    const isDocPdf = isPdf(fullUrl);
    const user = selectedUserForDocs;

    const firstName = user?.firstName || '';
    const lastName = user?.lastName || '';
    const userName = (firstName + ' ' + lastName).trim() || 'Utilisateur';
    const userEmail = user?.email || 'Non renseigné';
    const userPhone = user?.phone || 'Non renseigné';
    const isAgency = user?.role === 'PROFESSIONAL' || user?.role === 'AGENCE';
    const roleLabel = isAgency ? 'Agence Immobilière Professionnelle' : 'Client Particulier';
    const company = isAgency ? (user?.companyName || 'Agence Immobilière') : 'Client Particulier';
    const rc = isAgency ? (user?.rcNumber || 'Enregistré') : 'Non applicable';
    const ice = isAgency ? (user?.iceNumber || 'Enregistré') : 'Non applicable';
    const isVerified = Boolean(user?.isIdentityVerified);
    const statusBadge = isVerified ? '✓ Compte Vérifié & Approuvé' : '⏳ En attente de validation';
    const printScript = autoPrint ? '<script>window.onload = function() { setTimeout(function() { window.print(); }, 400); };</script>' : '';
    const currentDate = new Date().toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    newWindow.document.title = `${title || 'Document Justificatif'} - ${userName} • Urbanet`;
    newWindow.document.body.innerHTML = `
      <!DOCTYPE html>
      <html lang="fr">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>${title || 'Fiche de conformité'} - ${userName} • Urbanet Real Estate</title>
          <style>
            * {
              box-sizing: border-box;
            }
            body {
              margin: 0;
              padding: 32px 16px;
              background: #0b1120;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              color: #f8fafc;
              display: flex;
              justify-content: center;
              align-items: flex-start;
              min-height: 100vh;
            }
            .container {
              max-width: 900px;
              width: 100%;
              margin: 0 auto;
            }
            .card {
              background: #1e293b;
              border: 1px solid #334155;
              border-radius: 16px;
              padding: 32px;
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 1px solid #334155;
              padding-bottom: 20px;
              margin-bottom: 24px;
              gap: 16px;
            }
            .logo-title {
              display: flex;
              align-items: center;
              gap: 12px;
            }
            .logo-icon {
              width: 44px;
              height: 44px;
              background: #0284c7;
              border-radius: 10px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 22px;
              font-weight: bold;
            }
            .title-area h2 {
              margin: 0;
              font-size: 20px;
              font-weight: 700;
              color: #38bdf8;
              letter-spacing: -0.3px;
            }
            .title-area p {
              margin: 4px 0 0 0;
              color: #94a3b8;
              font-size: 13px;
            }
            .badge {
              background: rgba(16, 185, 129, 0.15);
              color: #34d399;
              border: 1px solid #10b981;
              padding: 6px 14px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 600;
              white-space: nowrap;
            }
            .badge-pending {
              background: rgba(245, 158, 11, 0.15);
              color: #fbbf24;
              border-color: #f59e0b;
            }
            .grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 14px;
              margin-bottom: 24px;
              background: #0f172a;
              padding: 20px;
              border-radius: 12px;
              border: 1px solid #1e293b;
            }
            .item-label {
              font-size: 11px;
              color: #94a3b8;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              font-weight: 600;
              margin-bottom: 4px;
            }
            .item-value {
              font-size: 14px;
              color: #f1f5f9;
              font-weight: 600;
              word-break: break-word;
            }
            .doc-preview-card {
              background: #0f172a;
              border: 1px solid #334155;
              border-radius: 12px;
              padding: 20px;
              margin-top: 20px;
              text-align: center;
            }
            .doc-meta-bar {
              display: flex;
              justify-content: space-between;
              align-items: center;
              flex-wrap: wrap;
              gap: 10px;
              padding-bottom: 14px;
              margin-bottom: 16px;
              border-bottom: 1px solid #1e293b;
              font-size: 13px;
              color: #cbd5e1;
            }
            .doc-media-wrapper {
              display: flex;
              justify-content: center;
              align-items: center;
              background: #020617;
              border-radius: 10px;
              padding: 16px;
              min-height: 380px;
              border: 1px solid #1e293b;
              overflow: hidden;
            }
            .doc-img {
              max-width: 100%;
              max-height: 650px;
              object-fit: contain;
              border-radius: 8px;
              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
            }
            .doc-iframe {
              width: 100%;
              height: 680px;
              border: none;
              border-radius: 8px;
              background: #ffffff;
            }
            .actions-bar {
              display: flex;
              justify-content: center;
              gap: 14px;
              margin-top: 24px;
              flex-wrap: wrap;
            }
            .btn {
              padding: 11px 22px;
              border-radius: 8px;
              cursor: pointer;
              font-weight: 600;
              font-size: 14px;
              display: inline-flex;
              align-items: center;
              gap: 8px;
              transition: all 0.2s ease;
              text-decoration: none;
              border: none;
            }
            .btn-primary {
              background: #0284c7;
              color: white;
            }
            .btn-primary:hover {
              background: #0369a1;
            }
            .btn-outline {
              background: transparent;
              color: #94a3b8;
              border: 1px solid #475569;
            }
            .btn-outline:hover {
              background: #334155;
              color: #f8fafc;
            }
            .footer-note {
              margin-top: 20px;
              text-align: center;
              font-size: 12px;
              color: #64748b;
            }

            /* --- PRINT STYLES --- */
            @media print {
              @page {
                margin: 12mm;
                size: portrait;
              }
              body {
                background: #ffffff !important;
                color: #0f172a !important;
                padding: 0 !important;
              }
              .card {
                background: #ffffff !important;
                border: 1px solid #cbd5e1 !important;
                padding: 20px !important;
                box-shadow: none !important;
              }
              .header {
                border-bottom: 2px solid #0284c7 !important;
              }
              .title-area h2 {
                color: #0284c7 !important;
              }
              .title-area p {
                color: #475569 !important;
              }
              .logo-icon {
                background: #0284c7 !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .badge {
                border: 1px solid #10b981 !important;
                color: #047857 !important;
                background: #ecfdf5 !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .grid {
                background: #f8fafc !important;
                border: 1px solid #e2e8f0 !important;
                gap: 10px !important;
                padding: 14px !important;
                page-break-inside: avoid;
              }
              .item-label {
                color: #64748b !important;
              }
              .item-value {
                color: #0f172a !important;
              }
              .doc-preview-card {
                background: #ffffff !important;
                border: 1px solid #cbd5e1 !important;
                padding: 14px !important;
                page-break-inside: avoid;
              }
              .doc-meta-bar {
                color: #334155 !important;
                border-bottom: 1px solid #e2e8f0 !important;
              }
              .doc-media-wrapper {
                background: #ffffff !important;
                border: 1px solid #e2e8f0 !important;
                padding: 8px !important;
                min-height: auto !important;
                page-break-inside: avoid;
              }
              .doc-img {
                max-height: 520px !important;
                box-shadow: none !important;
                border: 1px solid #cbd5e1 !important;
              }
              .no-print {
                display: none !important;
              }
              .footer-note {
                color: #475569 !important;
                border-top: 1px solid #e2e8f0 !important;
                padding-top: 10px !important;
                margin-top: 16px !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="card">
              <!-- Header -->
              <div class="header">
                <div class="logo-title">
                  <div class="logo-icon">🏢</div>
                  <div class="title-area">
                    <h2>Urbanet Real Estate • Fiche de Conformité</h2>
                    <p>Dossier de conformité légale et vérification d'identité officiel</p>
                  </div>
                </div>
                <span class="badge ${isVerified ? '' : 'badge-pending'}">${statusBadge}</span>
              </div>

              <!-- Infos Utilisateur / Agence -->
              <div class="grid">
                <div>
                  <div class="item-label">Titulaire du compte</div>
                  <div class="item-value">${userName}</div>
                </div>
                <div>
                  <div class="item-label">Rôle / Statut</div>
                  <div class="item-value">${roleLabel}</div>
                </div>
                <div>
                  <div class="item-label">Email</div>
                  <div class="item-value">${userEmail}</div>
                </div>
                <div>
                  <div class="item-label">Téléphone</div>
                  <div class="item-value">${userPhone}</div>
                </div>
                ${
                  isAgency
                    ? `
                  <div>
                    <div class="item-label">Entreprise / Raison Sociale</div>
                    <div class="item-value">${company}</div>
                  </div>
                  <div>
                    <div class="item-label">RC / ICE</div>
                    <div class="item-value">RC: ${rc} • ICE: ${ice}</div>
                  </div>
                `
                    : `
                  <div>
                    <div class="item-label">Type de document</div>
                    <div class="item-value">Pièce d'Identité (CIN)</div>
                  </div>
                  <div>
                    <div class="item-label">Identifiant Compte</div>
                    <div class="item-value">Client #${user?.id || '—'}</div>
                  </div>
                `
                }
              </div>

              <!-- Aperçu du document soumis -->
              <div class="doc-preview-card">
                <div class="doc-meta-bar">
                  <div style="font-weight: 600; color: #38bdf8;">
                    📄 ${title || 'Document Justificatif'}
                  </div>
                  <div style="font-size: 12px; color: #94a3b8;">
                    Fichier : ${docName}
                  </div>
                </div>

                <div class="doc-media-wrapper">
                  ${
                    isDocPdf
                      ? `
                    <iframe
                      src="${fullUrl}"
                      title="${title || 'Document'}"
                      class="doc-iframe"
                    ></iframe>
                  `
                      : `
                    <img
                      src="${fullUrl}"
                      alt="${title || 'Justificatif'}"
                      class="doc-img"
                      onerror="if(!this.dataset.tried){this.dataset.tried='1'; this.src='http://localhost:8080/api/files/view/${docName}';}"
                    />
                  `
                  }
                </div>
              </div>

              <!-- Actions (non imprimées) -->
              <div class="actions-bar no-print">
                <button class="btn btn-primary" onclick="window.print()">
                  🖨️ Imprimer cette fiche de conformité
                </button>
                <a class="btn btn-outline" href="${fullUrl}" target="_blank" download="${docName}">
                  ⬇️ Télécharger le fichier
                </a>
                <button class="btn btn-outline" onclick="window.close()">
                  ✕ Fermer l'onglet
                </button>
              </div>

              <div class="footer-note">
                Document officiel généré pour contrôle de conformité Urbanet Real Estate • Date d'édition : ${currentDate}
              </div>
            </div>
          </div>
          ${printScript}
        </body>
      </html>
    `;
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
        <div className="admin-doc-modal-overlay">
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                    <span style={{ fontWeight: 600, color: '#334155', fontSize: '0.9rem' }}>
                      {activeDoc.title}
                    </span>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={(e) => handleOpenDoc(e, activeDocFullUrl, activeDoc.title, true)}
                        className="btn-action"
                        style={{
                          background: '#0284c7',
                          color: '#ffffff',
                          fontSize: '0.8rem',
                          padding: '6px 12px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                          border: 'none',
                          borderRadius: '6px',
                          fontWeight: 600,
                        }}
                        title="Imprimer directement la fiche de conformité avec les informations et l'image"
                      >
                        <span>🖨️ Imprimer la fiche</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleOpenDoc(e, activeDocFullUrl, activeDoc.title, false)}
                        className="btn-action btn-action-approve"
                        style={{
                          textDecoration: 'none',
                          fontSize: '0.8rem',
                          padding: '6px 12px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                          border: 'none',
                        }}
                      >
                        <span>Ouvrir dans un nouvel onglet</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      </button>
                    </div>
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
                        padding: '24px 16px',
                        borderRadius: '10px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: '350px',
                      }}
                    >
                      {imageError ? (
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '24px 20px',
                            color: '#e2e8f0',
                            maxWidth: '520px',
                          }}
                        >
                          <div
                            style={{
                              width: '64px',
                              height: '64px',
                              borderRadius: '16px',
                              background: 'rgba(56, 189, 248, 0.15)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginBottom: '16px',
                              fontSize: '2rem',
                            }}
                          >
                            📄
                          </div>
                          <h4 style={{ margin: '0 0 8px 0', fontSize: '1.15rem', color: '#f8fafc', fontWeight: 600 }}>
                            {activeDoc.title}
                          </h4>
                          <p style={{ margin: '0 0 14px 0', fontSize: '0.85rem', color: '#94a3b8', wordBreak: 'break-all' }}>
                            Fichier : {activeDoc.url.replace('/uploads/', '')}
                          </p>
                          <div
                            style={{
                              background: 'rgba(16, 185, 129, 0.15)',
                              border: '1px solid #10b981',
                              borderRadius: '8px',
                              padding: '8px 16px',
                              color: '#34d399',
                              fontSize: '0.82rem',
                              fontWeight: 600,
                              marginBottom: '16px',
                            }}
                          >
                            ✓ Document téléversé lors de la soumission du dossier
                          </div>
                          <button
                            type="button"
                            onClick={(e) => handleOpenDoc(e, activeDocFullUrl, activeDoc.title)}
                            className="btn-action btn-action-approve"
                            style={{
                              fontSize: '0.82rem',
                              padding: '8px 16px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              cursor: 'pointer',
                              border: 'none',
                            }}
                          >
                            <span>Ouvrir le document dans un nouvel onglet</span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                              <polyline points="15 3 21 3 21 9" />
                              <line x1="10" y1="14" x2="21" y2="3" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <img
                          src={activeDocFullUrl}
                          alt={activeDoc.title}
                          onError={(e) => {
                            const currentSrc = e.target.src;
                            if (currentSrc && currentSrc.includes('/uploads/') && !currentSrc.includes('/api/files/view/')) {
                              const filename = currentSrc.substring(currentSrc.indexOf('/uploads/') + '/uploads/'.length);
                              e.target.src = `http://localhost:8080/api/files/view/${filename}`;
                            } else {
                              setImageError(true);
                            }
                          }}
                          style={{
                            display: imageError ? 'none' : 'block',
                            maxWidth: '100%',
                            maxHeight: '460px',
                            objectFit: 'contain',
                            borderRadius: '6px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                          }}
                        />
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
