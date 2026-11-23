import React from 'react';
import { getImageUrl } from '../../utils/imageUtils';

export const DocumentPrintPage = ({ user, documents = [] }) => {
  if (!user) return null;

  const isPdf = (url) => url && url.toLowerCase().includes('.pdf');
  const isAgency = user?.role === 'PROFESSIONAL' || user?.role === 'AGENCE';

  return (
    <div className="print-container">
      {/* BLOC INFOS : Affiché une seule fois */}
      <div className="print-header-info">
        <h2>Urbanet Real Estate • Document Justificatif</h2>
        <p><strong>Titulaire :</strong> {user.firstName} {user.lastName}</p>
        <p><strong>Email :</strong> {user.email}</p>
        <p><strong>Téléphone :</strong> {user.phone || 'Non renseigné'}</p>
        {isAgency && user.companyName && (
          <p><strong>Entreprise :</strong> {user.companyName}</p>
        )}
        {isAgency && user.rcNumber && (
          <p><strong>Numéro RC :</strong> {user.rcNumber}</p>
        )}
        {isAgency && user.iceNumber && (
          <p><strong>Numéro ICE :</strong> {user.iceNumber}</p>
        )}
      </div>

      {/* BLOC IMAGES : Affiché à la suite */}
      {documents && documents.length > 0 ? (
        documents.map((doc, index) => (
          <div key={index} className="print-document-page">
            <div
              className="no-print"
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px',
              }}
            >
              <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#334155' }}>
                {doc.title || `Document ${index + 1}`}
              </span>
              <a
                href={getImageUrl(doc.documentUrl)}
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
                }}
              >
                Ouvrir dans un nouvel onglet ↗
              </a>
            </div>
            {isPdf(doc.documentUrl) ? (
              <iframe
                src={getImageUrl(doc.documentUrl)}
                width="100%"
                height="80vh"
                title={`Document PDF ${index + 1}`}
                style={{ border: 'none', borderRadius: '6px' }}
              />
            ) : (
              <img
                src={getImageUrl(doc.documentUrl)}
                alt="Preuve"
                style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', display: 'block' }}
              />
            )}
          </div>
        ))
      ) : (
        <div className="no-print" style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
          <p>Aucun document disponible pour cet utilisateur.</p>
        </div>
      )}
    </div>
  );
};

export default DocumentPrintPage;
