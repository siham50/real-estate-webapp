import React, { useState } from 'react';
import { createReview } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ReviewModal = ({ booking, isOpen, onClose, onReviewAdded }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen || !booking) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const clientId = booking.client?.id || user?.id;
    const targetUserId =
      booking.property?.owner?.id ||
      booking.property?.ownerId ||
      booking.targetUser?.id ||
      (typeof booking.property?.owner === 'number' ? booking.property?.owner : 1);

    if (!clientId) {
      setError("Impossible d'identifier le client connecté.");
      return;
    }
    if (!targetUserId) {
      setError("Impossible d'identifier le propriétaire ou l'agence cible.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        bookingId: booking.id,
        clientId,
        targetUserId,
        rating,
        comment: comment.trim(),
      };

      const newReview = await createReview(payload);
      setSuccess('Votre avis a été publié avec succès !');

      if (onReviewAdded) {
        onReviewAdded(newReview);
      }

      setTimeout(() => {
        setComment('');
        setRating(5);
        setSuccess('');
        onClose();
      }, 1200);
    } catch (err) {
      setError(err.message || "Erreur lors de l'enregistrement de votre avis.");
    } finally {
      setSubmitting(false);
    }
  };

  const currentRating = hoverRating || rating;

  return (
    <div className="modal-overlay urbanet-modal-overlay" onClick={onClose}>
      <div
        className="modal-content urbanet-modal-card review-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header urbanet-modal-header">
          <div>
            <span className="modal-badge-review">⭐ Avis sur la visite</span>
            <h3 className="modal-title">Évaluer votre visite</h3>
            <p className="modal-subtitle">
              Bien : <strong>{booking.property?.title || 'Bien immobilier'}</strong>
            </p>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-review-form">
          {error && (
            <div className="client-booking-alert-error mb-12" role="alert">
              <span>⚠️ {error}</span>
            </div>
          )}

          {success && (
            <div className="agency-alert-success mb-12" role="alert">
              <span>✓ {success}</span>
            </div>
          )}

          {/* Système de notation par étoiles (1 à 5) */}
          <div className="rating-select-group">
            <label className="rating-label">Votre note globale :</label>
            <div className="stars-row stars-rating-interactive">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className={`star-btn ${star <= currentRating ? 'is-active active' : ''}`}
                  title={`${star} étoile${star > 1 ? 's' : ''}`}
                >
                  ★
                </button>
              ))}
              <span className="rating-num-label">{rating} / 5</span>
            </div>
          </div>

          {/* Commentaire */}
          <div className="form-group-review">
            <label htmlFor="review-modal-comment">Votre commentaire :</label>
            <textarea
              id="review-modal-comment"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Partagez vos impressions sur le bien, la ponctualité et l'accueil du propriétaire/agent..."
              className="review-textarea"
              required
            />
          </div>

          <div className="modal-actions-row">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="btn-modal-cancel"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="urbanet-btn-primary btn-modal-submit"
            >
              {submitting ? 'Envoi...' : "Envoyer l'avis"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
