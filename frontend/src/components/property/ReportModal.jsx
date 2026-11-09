import React, { useState } from 'react';
import { createReport } from '../../services/api';

const ReportModal = ({ property, user, onClose }) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!reason.trim()) {
      setError('Veuillez préciser la raison du signalement.');
      return;
    }

    const reportedUserId =
      property?.owner?.id ||
      property?.ownerId ||
      (typeof property?.owner === 'number' ? property.owner : null);

    if (!user?.id) {
      setError('Vous devez être connecté pour signaler une annonce.');
      return;
    }

    if (!reportedUserId) {
      setError('Impossible d’identifier le propriétaire de cette annonce.');
      return;
    }

    if (user.id === reportedUserId) {
      setError('Vous ne pouvez pas signaler votre propre annonce.');
      return;
    }

    setLoading(true);

    try {
      await createReport({
        reporterId: user.id,
        reportedUserId: reportedUserId,
        reason: reason.trim(),
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Erreur lors de la transmission du signalement.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="agency-modal-overlay" onClick={onClose}>
      <div className="agency-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="agency-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.25rem' }}>🚩</span>
            <h2 className="agency-modal-title">Signaler cette annonce</h2>
          </div>
          {onClose && (
            <button
              type="button"
              className="agency-modal-close"
              onClick={onClose}
              aria-label="Fermer"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {success ? (
          <div style={{ padding: '24px 28px 28px', textAlign: 'center' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.12)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '1.6rem',
              }}
            >
              ✓
            </div>
            <h3
              style={{
                fontSize: '1.15rem',
                fontWeight: 700,
                color: '#0f172a',
                marginBottom: '8px',
              }}
            >
              Votre signalement a été transmis à l'administrateur.
            </h3>
            <p
              style={{
                fontSize: '0.9rem',
                color: '#64748b',
                lineHeight: 1.5,
                margin: '0 0 24px',
              }}
            >
              Merci de nous aider à maintenir la qualité et la sécurité de notre
              plateforme. Notre équipe examinera cette annonce dans les meilleurs délais.
            </p>
            <button
              type="button"
              className="agency-btn-submit"
              onClick={onClose}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Fermer
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="agency-modal-form">
            <p
              style={{
                fontSize: '0.88rem',
                color: '#64748b',
                margin: 0,
                lineHeight: 1.45,
              }}
            >
              Vous êtes sur le point de signaler le bien{' '}
              <strong>"{property?.title || 'cette annonce'}"</strong>.
            </p>

            {error && (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#b91c1c',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '0.88rem',
                }}
              >
                {error}
              </div>
            )}

            <div className="agency-field-group">
              <label htmlFor="report-reason" style={{ fontWeight: 600 }}>
                Motif du signalement *
              </label>
              <textarea
                id="report-reason"
                className="agency-input agency-textarea"
                rows="4"
                placeholder="Expliquez la raison de votre signalement (ex : fausse annonce, coordonnées incorrectes, photos trompeuses, etc.)..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                style={{ resize: 'vertical', minHeight: '110px' }}
              />
            </div>

            <div className="agency-modal-actions">
              {onClose && (
                <button
                  type="button"
                  className="agency-btn-cancel"
                  onClick={onClose}
                  disabled={loading}
                >
                  Annuler
                </button>
              )}
              <button
                type="submit"
                className="agency-btn-submit"
                disabled={loading || !reason.trim()}
                style={{
                  backgroundColor: '#ef4444',
                  borderColor: '#ef4444',
                  color: '#ffffff',
                }}
              >
                {loading ? 'Envoi en cours...' : 'Envoyer le signalement'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReportModal;

