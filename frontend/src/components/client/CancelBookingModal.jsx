import React, { useState } from 'react';
import api from '../../services/api';

const REASON_OPTIONS = [
  'Empêchement personnel',
  'Changement d\'avis',
  'Bien déjà loué',
  'Autre',
];

const CancelBookingModal = ({ booking, isOpen, onClose, onCancelled }) => {
  const [selectedReason, setSelectedReason] = useState(REASON_OPTIONS[0]);
  const [customDetails, setCustomDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !booking) return null;

  const handleConfirmCancel = async (e) => {
    e.preventDefault();
    setError('');

    let finalReason = selectedReason;
    if (selectedReason === 'Autre') {
      if (!customDetails.trim()) {
        setError('Veuillez préciser la raison de votre annulation.');
        return;
      }
      finalReason = customDetails.trim();
    } else if (customDetails.trim()) {
      finalReason = `${selectedReason} - ${customDetails.trim()}`;
    }

    setSubmitting(true);
    try {
      const response = await api.patch(
        `/bookings/${booking.id}/status?status=CANCELLED&reason=${encodeURIComponent(finalReason)}`
      );

      if (onCancelled) {
        onCancelled(response.data);
      }
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Erreur lors de l'annulation de la réservation."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="modal-overlay urbanet-modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
      }}
    >
      <div
        className="modal-content urbanet-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#fff',
          borderRadius: '14px',
          maxWidth: '520px',
          width: '100%',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
          overflow: 'hidden',
        }}
      >
        {/* Header de la modale */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: 600 }}>
              Annuler votre réservation
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748b' }}>
              Réservation #{booking.id} — {booking.property?.title || 'Bien immobilier'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
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

        {/* Formulaire */}
        <form onSubmit={handleConfirmCancel} style={{ padding: '24px' }}>
          {error && (
            <div
              style={{
                marginBottom: '16px',
                padding: '10px 14px',
                borderRadius: '8px',
                background: '#fee2e2',
                color: '#b91c1c',
                fontSize: '0.85rem',
              }}
            >
              ⚠️ {error}
            </div>
          )}

          <div style={{ marginBottom: '18px' }}>
            <label
              htmlFor="cancel-reason-select"
              style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.9rem', color: '#334155' }}
            >
              Motif de l'annulation <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select
              id="cancel-reason-select"
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                backgroundColor: '#fff',
                color: '#0f172a',
                outline: 'none',
              }}
            >
              {REASON_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '22px' }}>
            <label
              htmlFor="cancel-details-textarea"
              style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.9rem', color: '#334155' }}
            >
              {selectedReason === 'Autre'
                ? 'Précisez la raison *'
                : 'Détails complémentaires (facultatif)'}
            </label>
            <textarea
              id="cancel-details-textarea"
              rows={3}
              value={customDetails}
              onChange={(e) => setCustomDetails(e.target.value)}
              placeholder={
                selectedReason === 'Autre'
                  ? 'Veuillez indiquer la raison de votre annulation...'
                  : 'Vous pouvez laisser un message explicatif pour l\'agence / le propriétaire...'
              }
              required={selectedReason === 'Autre'}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.88rem',
                color: '#0f172a',
                outline: 'none',
                resize: 'vertical',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              style={{
                padding: '9px 18px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#fff',
                color: '#475569',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '0.88rem',
              }}
            >
              Conserver la visite
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '9px 20px',
                borderRadius: '8px',
                border: 'none',
                background: '#dc2626',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.88rem',
              }}
            >
              {submitting ? 'Annulation en cours...' : "Confirmer l'annulation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CancelBookingModal;
