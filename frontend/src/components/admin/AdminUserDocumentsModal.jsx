import React from 'react';
import { createPortal } from 'react-dom';
import DocumentPrintPage from './DocumentPrintPage';

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
    const docs = [];
    const isClient = u.role === 'CLIENT';
    const isAgency = u.role === 'PROFESSIONAL' || u.role === 'AGENCE';

    if (isClient) {
      const urls = [
        ...parseUrls(u.identityDocumentUrl),
        ...parseUrls(u.documentUrl),
        ...parseUrls(u.documents),
      ];
      Array.from(new Set(urls)).forEach((url, idx) => {
        docs.push({
          title: urls.length > 1 ? `Pièce d'identité (CIN) - Page ${idx + 1}` : "Pièce d'identité (CIN)",
          documentUrl: url,
        });
      });
      return docs;
    }

    if (isAgency) {
      const urls = [
        ...parseUrls(u.agencyDocumentUrl),
        ...parseUrls(u.documentUrl),
        ...parseUrls(u.identityDocumentUrl),
        ...parseUrls(u.documents),
      ];
      Array.from(new Set(urls)).forEach((url, idx) => {
        const isPdfDoc = url.toLowerCase().includes('.pdf');
        docs.push({
          title: `Justificatif légal ${idx + 1} (${isPdfDoc ? 'PDF' : 'Image'})`,
          documentUrl: url,
        });
      });
      return docs;
    }

    const otherUrls = [
      ...parseUrls(u.identityDocumentUrl),
      ...parseUrls(u.agencyDocumentUrl),
      ...parseUrls(u.documentUrl),
      ...parseUrls(u.documents),
    ];
    Array.from(new Set(otherUrls)).forEach((url, idx) => {
      docs.push({
        title: `Document ${idx + 1}`,
        documentUrl: url,
      });
    });
    return docs;
  };

  // Liste de documents dédupliqués
  const documents = getDocuments(user);

  const handlePrint = () => {
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const firstName = user?.firstName || '';
  const lastName = user?.lastName || '';
  const userName = (firstName + ' ' + lastName).trim() || 'Utilisateur';
  const isAgency = user?.role === 'PROFESSIONAL' || user?.role === 'AGENCE';
  const roleLabel = isAgency ? 'Agence Immobilière Professionnelle' : 'Client Particulier';
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
        {/* En-tête de la modale (masqué à l'impression) */}
        <div
          className="no-print"
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
                Documents Justificatifs & Fiche de Conformité
              </h3>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
              {roleLabel} • {userName} ({user.email}) — {documents.length} document{documents.length > 1 ? 's' : ''}
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
              onClick={handlePrint}
              style={{
                background: '#0284c7',
                color: '#ffffff',
                padding: '7px 14px',
                borderRadius: '6px',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
              title="Lancer l'impression"
            >
              <span>🖨️ Imprimer cette fiche de conformité</span>
            </button>

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

        {/* Corps défilable à l'écran, devenant la zone d'impression lors du print */}
        <div
          className="admin-modal-body"
          style={{ padding: '24px', overflowY: 'auto', flex: 1, background: '#f8fafc' }}
        >
          <DocumentPrintPage user={user} documents={documents} />
        </div>

        {/* Pied de la modale avec actions rapides (masqué à l'impression) */}
        <div
          className="no-print"
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-action btn-secondary"
              style={{
                padding: '8px 16px',
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
            <button
              type="button"
              onClick={handlePrint}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: '1px solid #0284c7',
                background: '#0284c7',
                color: '#ffffff',
                cursor: 'pointer',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              🖨️ Imprimer cette fiche de conformité
            </button>
          </div>

          {!user.isIdentityVerified && onVerify && (
            <button
              type="button"
              className="btn-action btn-action-approve"
              style={{
                padding: '8px 18px',
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
