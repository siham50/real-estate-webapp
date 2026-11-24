import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api, { rescheduleBooking } from '../../services/api';

const RescheduleModal = ({ booking, isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [availabilities, setAvailabilities] = useState([]);
  const [selectedAvailabilityId, setSelectedAvailabilityId] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const ownerId =
    booking?.property?.owner?.id ||
    booking?.property?.ownerId ||
    booking?.availability?.user?.id ||
    user?.id;

  useEffect(() => {
    if (!isOpen || !ownerId) return;

    const fetchSlots = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get(`/availabilities/owner/${ownerId}`);
        const data = Array.isArray(response.data) ? response.data : [];
        // Filtre ceux avec isBooked === false et exclut le créneau actuel
        const unbooked = data.filter(
          (a) => !a.isBooked && a.id !== booking?.availability?.id
        );
        setAvailabilities(unbooked);
        if (unbooked.length > 0) {
          setSelectedAvailabilityId(String(unbooked[0].id));
        } else {
          setSelectedAvailabilityId('');
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          'Impossible de charger vos créneaux disponibles.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [isOpen, ownerId, booking?.availability?.id]);

  if (!isOpen || !booking) return null;

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return 'Date non spécifiée';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatSlotOption = (slot) => {
    let dateStr = slot.date;
    try {
      const d = new Date(slot.date);
      dateStr = d.toLocaleDateString('fr-FR', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      // conserver format brut
    }
    const start = slot.startTime ? String(slot.startTime).substring(0, 5) : '';
    const end = slot.endTime ? String(slot.endTime).substring(0, 5) : '';
    const time = start && end ? ` de ${start} à ${end}` : (start ? ` à ${start}` : '');
    return `${dateStr}${time}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAvailabilityId) {
      setError('Veuillez sélectionner un créneau de visite.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await rescheduleBooking(booking.id, Number(selectedAvailabilityId));
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Erreur lors de la proposition de replanification.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const currentAvail = booking.availability;

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
        {/* Header */}
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
              Replanifier la visite
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

        {/* Corps */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
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

          {/* Rappel du créneau actuel */}
          {currentAvail && (
            <div
              style={{
                marginBottom: '18px',
                padding: '12px 14px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '0.88rem',
              }}
            >
              <div style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '4px' }}>
                Créneau initialement réservé :
              </div>
              <div style={{ fontWeight: 600, color: '#334155' }}>
                🗓️ {formatDateDisplay(currentAvail.date)}
                {(currentAvail.startTime || currentAvail.endTime) && (
                  <span>
                    {' '}(de {String(currentAvail.startTime).substring(0, 5)} à {String(currentAvail.endTime).substring(0, 5)})
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Sélection du nouveau créneau */}
          <div style={{ marginBottom: '22px' }}>
            <label
              htmlFor="reschedule-slot-select"
              style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.9rem', color: '#334155' }}
            >
              Sélectionner un nouveau créneau disponible <span style={{ color: '#ef4444' }}>*</span>
            </label>

            {loading ? (
              <div style={{ padding: '12px', textAlign: 'center', color: '#64748b', fontSize: '0.88rem' }}>
                Chargement de vos créneaux...
              </div>
            ) : availabilities.length === 0 ? (
              <div
                style={{
                  padding: '12px 14px',
                  background: '#fef3c7',
                  border: '1px solid #fde68a',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  color: '#92400e',
                }}
              >
                ⚠️ Aucun autre créneau libre disponible. Veuillez d'abord ajouter de nouvelles disponibilités dans votre calendrier.
              </div>
            ) : (
              <select
                id="reschedule-slot-select"
                value={selectedAvailabilityId}
                onChange={(e) => setSelectedAvailabilityId(e.target.value)}
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
                required
              >
                {availabilities.map((slot) => (
                  <option key={slot.id} value={slot.id}>
                    {formatSlotOption(slot)}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Actions */}
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
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting || loading || availabilities.length === 0}
              style={{
                padding: '9px 20px',
                borderRadius: '8px',
                border: 'none',
                background: availabilities.length === 0 ? '#94a3b8' : '#2563eb',
                color: '#fff',
                cursor: availabilities.length === 0 ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                fontSize: '0.88rem',
              }}
            >
              {submitting ? 'Envoi en cours...' : 'Proposer la nouvelle date'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RescheduleModal;
