import React from 'react';
import { createPortal } from 'react-dom';
import { getImageUrl } from '../../utils/imageUtils';

export const AdminUserDocumentsModal = ({ user, onClose, onVerify, actionLoading = false }) => {
  if (!user) return null;

  const parseUrls = (raw) => {
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
        // Fallback
      }
    }
    return str
      .split(/[,;\n]+/)
      .map((s) => s.replace(/^[\[\]"']+|[\[\]"']+$/g, '').trim())
      .filter(Boolean);
  };

  const getDocuments = (u) => {
    if (!u) return [];
    const isClient = u.role === 'CLIENT';
    const isAgency = u.role === 'PROFESSIONAL' || u.role === 'AGENCE';

    let rawSources = [];
    if (isClient) {
      if (u.identityDocumentUrl) rawSources.push(u.identityDocumentUrl);
      else if (u.documentUrl) rawSources.push(u.documentUrl);
      else if (u.documents) rawSources.push(u.documents);
    } else if (isAgency) {
      if (u.agencyDocumentUrl) rawSources.push(u.agencyDocumentUrl);
      else if (u.documentUrl) rawSources.push(u.documentUrl);
      else if (u.identityDocumentUrl) rawSources.push(u.identityDocumentUrl);
      else if (u.documents) rawSources.push(u.documents);
    } else {
      if (u.identityDocumentUrl) rawSources.push(u.identityDocumentUrl);
      if (u.agencyDocumentUrl) rawSources.push(u.agencyDocumentUrl);
      if (u.documentUrl) rawSources.push(u.documentUrl);
      if (u.documents) rawSources.push(u.documents);
    }

    const allUrls = rawSources.flatMap(parseUrls);
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
          documentUrl: clean,
          url: clean,
        });
      }
    });

    return docs;
  };

  // Liste de documents strictement dédupliqués
  const documents = getDocuments(user);

  const isPdf = (url) => {
    if (!url) return false;
    return String(url).toLowerCase().includes('.pdf');
  };

  const firstName = user?.firstName || '';
  const lastName = user?.lastName || '';
  const userName = (firstName + ' ' + lastName).trim() || 'Utilisateur';
  const isAgency = user?.role === 'PROFESSIONAL' || user?.role === 'AGENCE';
  const roleLabel = isAgency ? 'Agence Immobilière' : 'Client Particulier';
  const isVerified = Boolean(user?.isIdentityVerified);

  return createPortal(
    <div
      className="admin-modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
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
          background: '#ffffff',
          color: '#0f172a',
          borderRadius: '16px',
          maxWidth: '860px',
          width: '100%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
        }}
      >
        {/* En-tête de la modale */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#f8fafc',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.25rem' }}>📄</span>
              <h3 style={{ margin: 0, fontSize: '1.18rem', color: '#0f172a', fontWeight: 700 }}>
                Documents Justificatifs
              </h3>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
              Dossier {roleLabel} • {userName} ({user.email})
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                display: 'inline-block',
                padding: '4px 12px',
                borderRadius: '9999px',
                fontSize: '0.78rem',
                fontWeight: 600,
                background: isVerified ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                color: isVerified ? '#059669' : '#d97706',
                border: isVerified ? '1px solid #10b981' : '1px solid #f59e0b',
              }}
            >
              {isVerified ? '✓ Compte Approuvé' : '⏳ En attente de validation'}
            </span>

            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '1.4rem',
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
        </div>

        {/* Corps défilable de la modale */}
        <div
          className="admin-modal-body"
          style={{ padding: '24px', overflowY: 'auto', flex: 1, background: '#f8fafc' }}
        >
          {/* Bloc d'informations du titulaire */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              padding: '16px 20px',
              marginBottom: '20px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            }}
          >
            <h4
              style={{
                margin: '0 0 12px 0',
                fontSize: '0.98rem',
                color: '#0284c7',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>ℹ️</span> Informations du compte
            </h4>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px',
                fontSize: '0.88rem',
              }}
            >
              <div>
                <span style={{ color: '#64748b' }}>Titulaire :</span>{' '}
                <strong style={{ color: '#0f172a' }}>{user.firstName} {user.lastName}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Email :</span>{' '}
                <strong style={{ color: '#0f172a' }}>{user.email}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Téléphone :</span>{' '}
                <strong style={{ color: '#0f172a' }}>{user.phone || 'Non renseigné'}</strong>
              </div>
              {isAgency && user.companyName && (
                <div>
                  <span style={{ color: '#64748b' }}>Entreprise :</span>{' '}
                  <strong style={{ color: '#0f172a' }}>{user.companyName}</strong>
                </div>
              )}
              {isAgency && user.rcNumber && (
                <div>
                  <span style={{ color: '#64748b' }}>Numéro RC :</span>{' '}
                  <strong style={{ color: '#0f172a' }}>{user.rcNumber}</strong>
                </div>
              )}
              {isAgency && user.iceNumber && (
                <div>
                  <span style={{ color: '#64748b' }}>Numéro ICE :</span>{' '}
                  <strong style={{ color: '#0f172a' }}>{user.iceNumber}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Liste des documents */}
          <div className="admin-doc-viewer-list">
            {documents && documents.length > 0 ? (
              documents.map((doc, index) => {
                const docUrl = doc.documentUrl || doc.url;
                return (
                  <div key={index} className="admin-doc-item-card">
                    <div className="admin-doc-item-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.1rem' }}>{isPdf(docUrl) ? '📄' : '🖼️'}</span>
                        <strong style={{ fontSize: '0.92rem', color: '#1e293b' }}>
                          {doc.title || `Document ${index + 1}`}
                        </strong>
                      </div>
                      <a
                        href={getImageUrl(docUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: '0.82rem',
                          color: '#0284c7',
                          textDecoration: 'none',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          background: 'rgba(2, 132, 199, 0.08)',
                          border: '1px solid rgba(2, 132, 199, 0.2)',
                        }}
                      >
                        Ouvrir dans un nouvel onglet ↗
                      </a>
                    </div>
                    <div className="admin-doc-item-preview">
                      {isPdf(docUrl) ? (
                        <iframe
                          src={getImageUrl(docUrl)}
                          title={doc.title}
                          style={{
                            width: '100%',
                            height: '520px',
                            border: 'none',
                            borderRadius: '6px',
                            background: '#ffffff',
                          }}
                        />
                      ) : (
                        <img
                          src={getImageUrl(docUrl)}
                          alt={doc.title || `Document ${index + 1}`}
                          style={{
                            maxWidth: '100%',
                            maxHeight: '520px',
                            objectFit: 'contain',
                            display: 'block',
                            margin: '0 auto',
                            borderRadius: '6px',
                          }}
                        />
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div
                style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  color: '#64748b',
                  background: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <p style={{ margin: 0 }}>Aucun document justificatif téléversé pour cet utilisateur.</p>
              </div>
            )}
          </div>
        </div>

        {/* Pied de la modale */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #e2e8f0',
            background: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="btn-action btn-secondary"
            style={{
              padding: '8px 18px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#334155',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Fermer
          </button>

          {!user.isIdentityVerified && onVerify && (
            <button
              type="button"
              className="btn-action btn-action-approve"
              style={{
                padding: '8px 20px',
                fontSize: '0.88rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: 600,
                borderRadius: '6px',
                border: 'none',
                background: '#10b981',
                color: '#ffffff',
                cursor: 'pointer',
              }}
              onClick={() => onVerify(user.id)}
              disabled={actionLoading}
            >
              <span>{actionLoading ? 'Approbation en cours...' : 'Approuver ce compte maintenant'}</span>
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AdminUserDocumentsModal;
