import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getClientBookings, updateBookingStatus } from '../../services/api';
import ReviewModal from './ReviewModal';

const STATUS_CONFIG = {
  PENDING: { label: 'En attente', className: 'status-pill-pending' },
  CONFIRMED: { label: 'Confirmée', className: 'status-pill-confirmed' },
  COMPLETED: { label: 'Terminée', className: 'status-pill-completed' },
  CANCELLED: { label: 'Annulée', className: 'status-pill-cancelled' },
  RESCHEDULED: { label: 'Replanifiée', className: 'status-pill-pending' },
};

const ClientBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Filtre
  const [filter, setFilter] = useState('ALL');

  // Modale Avis
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);

  const fetchBookings = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError('');
    try {
      const data = await getClientBookings(user.id);
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Impossible de charger vos réservations.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Annulation de la réservation
  const handleCancelBooking = async (id, propertyTitle) => {
    const confirmMsg = `Êtes-vous sûr de vouloir annuler votre demande de visite pour "${propertyTitle || 'ce bien'}" ?`;
    if (!window.confirm(confirmMsg)) return;

    setActionLoadingId(id);
    setError('');
    try {
      await updateBookingStatus(id, 'CANCELLED');
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: 'CANCELLED' } : b))
      );
    } catch (err) {
      setError(err.message || "Erreur lors de l'annulation de la visite.");
    } finally {
      setActionLoadingId(null);
    }
  };



  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return 'Date à confirmer';
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

  const formatTimeDisplay = (timeStr) => {
    if (!timeStr) return '';
    return String(timeStr).substring(0, 5);
  };

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'ALL') return true;
    return b.status === filter;
  });

  return (
    <div className="client-bookings-container" id="reservations">
      <div className="client-bookings-header">
        <div>
          <h2 className="client-bookings-title">Mes réservations de visites</h2>
          <p className="client-bookings-subtitle">
            Suivez en temps réel le statut de vos demandes de visite auprès des propriétaires et agences.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchBookings}
          className="client-bookings-refresh-btn"
          title="Rafraîchir"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
          Actualiser
        </button>
      </div>

      {error && (
        <div className="client-booking-alert-error" role="alert">
          <span>⚠️ {error}</span>
        </div>
      )}

      {/* Barre de filtres */}
      <div className="client-bookings-filter-bar">
        <button
          type="button"
          className={`filter-btn ${filter === 'ALL' ? 'active' : ''}`}
          onClick={() => setFilter('ALL')}
        >
          Toutes ({bookings.length})
        </button>
        <button
          type="button"
          className={`filter-btn ${filter === 'PENDING' ? 'active' : ''}`}
          onClick={() => setFilter('PENDING')}
        >
          En attente ({bookings.filter((b) => b.status === 'PENDING').length})
        </button>
        <button
          type="button"
          className={`filter-btn ${filter === 'CONFIRMED' ? 'active' : ''}`}
          onClick={() => setFilter('CONFIRMED')}
        >
          Confirmées ({bookings.filter((b) => b.status === 'CONFIRMED').length})
        </button>
        <button
          type="button"
          className={`filter-btn ${filter === 'COMPLETED' ? 'active' : ''}`}
          onClick={() => setFilter('COMPLETED')}
        >
          Terminées ({bookings.filter((b) => b.status === 'COMPLETED').length})
        </button>
      </div>

      {loading ? (
        <div className="client-bookings-loading">
          <div className="urbanet-spinner-sm" />
          <span>Chargement de vos réservations...</span>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="client-bookings-empty-card">
          <div className="empty-icon-circle">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <h3 className="empty-title">Aucune visite programmée</h3>
          <p className="empty-desc">
            {filter === 'ALL'
              ? 'Vous n’avez pas encore de demande de visite. Parcourez nos annonces et réservez un créneau en direct avec le propriétaire.'
              : 'Aucune réservation ne correspond au filtre sélectionné.'}
          </p>
          <Link to="/" className="urbanet-btn-primary btn-empty-cta">
            Explorer les annonces
          </Link>
        </div>
      ) : (
        <div className="client-bookings-grid">
          {filteredBookings.map((booking) => {
            const statusConfig = STATUS_CONFIG[booking.status] || {
              label: booking.status,
              className: 'status-pill-pending',
            };
            const prop = booking.property || {};
            const avail = booking.availability || {};
            const isCancelling = actionLoadingId === booking.id;

            return (
              <div key={booking.id} className="client-booking-card">
                {/* Header Carte : Statut & ID */}
                <div className="booking-card-top">
                  <span className="booking-id-tag">Réservation #{booking.id}</span>
                  <span className={`status-pill ${statusConfig.className}`}>
                    {statusConfig.label}
                  </span>
                </div>

                {/* Corps Carte : Titre du bien & Ville */}
                <div className="booking-card-body">
                  <h3 className="booking-prop-title" title={prop.title}>
                    {prop.id ? (
                      <Link to={`/properties/${prop.id}`} className="booking-prop-link">
                        {prop.title || 'Bien immobilier'}
                      </Link>
                    ) : (
                      prop.title || 'Bien immobilier'
                    )}
                  </h3>

                  <div className="booking-prop-meta">
                    {prop.city && <span>📍 {prop.city}</span>}
                    {prop.price && (
                      <span className="booking-prop-price">
                        💰 {Number(prop.price).toLocaleString('fr-FR')} MAD
                      </span>
                    )}
                  </div>

                  {/* Date & Horaires */}
                  <div className="booking-schedule-box">
                    <div className="schedule-icon">🗓️</div>
                    <div className="schedule-details">
                      <span className="schedule-date">{formatDateDisplay(avail.date)}</span>
                      {(avail.startTime || avail.endTime) && (
                        <span className="schedule-hours">
                          ⏰ De {formatTimeDisplay(avail.startTime)} à {formatTimeDisplay(avail.endTime)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Carte : Actions */}
                <div className="booking-card-footer">
                  {/* Si PENDING ou CONFIRMED : bouton d'annulation */}
                  {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                    <button
                      type="button"
                      onClick={() => handleCancelBooking(booking.id, prop.title)}
                      disabled={isCancelling}
                      className="btn-booking-cancel"
                    >
                      {isCancelling ? 'Annulation...' : 'Annuler la demande'}
                    </button>
                  )}

                  {/* Bonus : Si COMPLETED : bouton Laisser un avis */}
                  {booking.status === 'COMPLETED' && (
                    <button
                      type="button"
                      onClick={() => setSelectedBookingForReview(booking)}
                      className="btn-booking-review"
                    >
                      ⭐ Laisser un avis
                    </button>
                  )}

                  {/* Si CANCELLED */}
                  {booking.status === 'CANCELLED' && (
                    <span className="booking-cancelled-label">Visite annulée</span>
                  )}

                  {prop.id && (
                    <Link to={`/properties/${prop.id}`} className="btn-booking-view-prop">
                      Voir l'annonce →
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modale Laisser un avis */}
      <ReviewModal
        booking={selectedBookingForReview}
        isOpen={Boolean(selectedBookingForReview)}
        onClose={() => setSelectedBookingForReview(null)}
        onReviewAdded={() => {
          fetchBookings();
        }}
      />
    </div>
  );
};

export default ClientBookings;
