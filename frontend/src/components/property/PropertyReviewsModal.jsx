import React, { useState, useEffect, useCallback } from 'react';
import { getReviewsByProperty, getReviewsByTargetUser } from '../../services/api';

const PropertyReviewsModal = ({ property, targetUserId, onClose }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      let data = [];
      if (property?.id) {
        data = await getReviewsByProperty(property.id);
      } else if (targetUserId) {
        data = await getReviewsByTargetUser(targetUserId);
      }
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des avis.');
    } finally {
      setLoading(false);
    }
  }, [property?.id, targetUserId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : null;

  const renderStars = (rating) => {
    const stars = [];
    const num = Math.min(Math.max(rating || 0, 1), 5);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          style={{
            color: i <= num ? '#f59e0b' : '#cbd5e1',
            fontSize: '1.1rem',
          }}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div
      className="agency-modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(3px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        className="agency-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '650px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#f8fafc',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.3rem' }}>⭐</span>
              <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a', fontWeight: 700 }}>
                {property ? `Avis sur : ${property.title}` : 'Avis reçus sur vos annonces'}
              </h2>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
              {property
                ? `Consultez les notes et retours des visiteurs pour ce bien (${property.city || 'Maroc'}).`
                : 'Tous les retours et notes laissés par les clients suite à des visites.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748b',
              fontSize: '1rem',
            }}
            title="Fermer"
          >
            ✕
          </button>
        </div>

        {/* Note moyenne si avis existants */}
        {averageRating && (
          <div
            style={{
              padding: '14px 24px',
              background: '#fefce8',
              borderBottom: '1px solid #fef08a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.3rem', fontWeight: 700, color: '#854d0e' }}>
                {averageRating} / 5
              </span>
              <div style={{ display: 'flex', gap: '2px' }}>
                {renderStars(Math.round(Number(averageRating)))}
              </div>
            </div>
            <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#713f12' }}>
              Basé sur {reviews.length} évaluation{reviews.length > 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Content Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              Chargement des avis...
            </div>
          )}

          {error && (
            <div
              style={{
                background: '#fee2e2',
                color: '#b91c1c',
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '0.9rem',
              }}
            >
              {error}
            </div>
          )}

          {!loading && !error && reviews.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 20px',
                background: '#f8fafc',
                borderRadius: '10px',
                border: '1px dashed #cbd5e1',
              }}
            >
              <div style={{ fontSize: '2.2rem', marginBottom: '8px' }}>📭</div>
              <p style={{ color: '#0f172a', fontWeight: 600, margin: '0 0 4px 0' }}>
                Aucun avis pour le moment
              </p>
              <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>
                {property
                  ? "Aucun client n'a encore laissé de note ou de commentaire sur cette annonce."
                  : "Vous n'avez pas encore reçu d'avis sur vos annonces."}
              </p>
            </div>
          )}

          {!loading && !error && reviews.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {reviews.map((rev) => {
                const dateStr = rev.createdAt
                  ? new Date(rev.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : 'Date inconnue';

                const clientName = rev.client
                  ? `${rev.client.firstName || ''} ${rev.client.lastName || ''}`.trim() || rev.client.email
                  : (rev.clientFirstName ? `${rev.clientFirstName} ${rev.clientLastName || ''}`.trim() : 'Client');

                return (
                  <div
                    key={rev.id}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '16px',
                      background: '#ffffff',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '8px',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.95rem' }}>
                          👤 {clientName}
                        </div>
                        {rev.propertyTitle && !property && (
                          <div style={{ fontSize: '0.82rem', color: '#2563eb', marginTop: '2px' }}>
                            Annonce : {rev.propertyTitle}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ display: 'flex', gap: '1px' }}>
                          {renderStars(rev.rating)}
                        </div>
                        <span style={{ fontSize: '0.82rem', color: '#94a3b8', marginLeft: '6px' }}>
                          {dateStr}
                        </span>
                      </div>
                    </div>

                    {rev.comment ? (
                      <p
                        style={{
                          margin: 0,
                          fontSize: '0.9rem',
                          color: '#334155',
                          background: '#f8fafc',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          lineHeight: '1.45',
                        }}
                      >
                        « {rev.comment} »
                      </p>
                    ) : (
                      <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>
                        Note attribuée sans commentaire écrit.
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid #e2e8f0',
            background: '#f8fafc',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="btn-urbanet-secondary"
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
            }}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyReviewsModal;
