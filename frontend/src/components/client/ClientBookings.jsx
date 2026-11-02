import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getClientBookings, updateBookingStatus, createReview } from '../../services/api';

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
  const [activeReviewBooking, setActiveReviewBooking] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState('');
  const [reviewErrorMsg, setReviewErrorMsg] = useState('');

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

  // Soumission de l'avis
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!activeReviewBooking) return;
    setReviewSubmitting(true);
    setReviewErrorMsg('');
    setReviewSuccessMsg('');

    try {
      const targetUserId =
        activeReviewBooking.property?.owner?.id ||
        activeReviewBooking.property?.ownerId ||
        1;

      await createReview({
        bookingId: activeReviewBooking.id,
        clientId: user.id,
        targetUserId,
        rating,
        comment: comment.trim(),
      });

      setReviewSuccessMsg('Merci ! Votre avis a été enregistré avec succès.');
      setTimeout(() => {
        setActiveReviewBooking(null);
        setComment('');
        setRating(5);
        setReviewSuccessMsg('');
      }, 1500);
    } catch (err) {
      setReviewErrorMsg(err.message || "Impossible d'enregistrer votre avis.");
    } finally {
      setReviewSubmitting(false);
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
                      onClick={() => setActiveReviewBooking(booking)}
                      className="btn-booking-review"
                    >
                      ★ Laisser un avis
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

      {/* Modale "Laisser un avis" */}
      {activeReviewBooking && (
        <div className="urbanet-modal-overlay" onClick={() => setActiveReviewBooking(null)}>
          <div className="urbanet-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="urbanet-modal-header">
              <div>
                <span className="modal-badge-review">⭐ Évaluation visite</span>
                <h3 className="modal-title">Partagez votre expérience</h3>
                <p className="modal-subtitle">
                  Visite de : <strong>{activeReviewBooking.property?.title || 'Bien immobilier'}</strong>
                </p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setActiveReviewBooking(null)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="modal-review-form">
              {reviewErrorMsg && (
                <div className="client-booking-alert-error mb-12">
                  <span>⚠️ {reviewErrorMsg}</span>
                </div>
              )}
              {reviewSuccessMsg && (
                <div className="agency-alert-success mb-12">
                  <span>✓ {reviewSuccessMsg}</span>
                </div>
              )}

              {/* Sélection note étoiles */}
              <div className="rating-select-group">
                <label className="rating-label">Votre note globale :</label>
                <div className="stars-row">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`star-btn ${star <= rating ? 'is-active' : ''}`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="rating-num-label">{rating} / 5</span>
                </div>
              </div>

              {/* Commentaire */}
              <div className="form-group-review">
                <label htmlFor="review-comment">Votre commentaire (facultatif) :</label>
                <textarea
                  id="review-comment"
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Comment s'est déroulée la visite ? Ponctualité, conformité du bien..."
                  className="review-textarea"
                />
              </div>

              <div className="modal-actions-row">
                <button
                  type="button"
                  onClick={() => setActiveReviewBooking(null)}
                  className="btn-modal-cancel"
                >
                  Fermer
                </button>
                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="urbanet-btn-primary btn-modal-submit"
                >
                  {reviewSubmitting ? 'Envoi en cours...' : 'Publier mon avis'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientBookings;
