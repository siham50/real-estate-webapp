import React, { useState, useEffect, useCallback } from 'react';
import { getReviewsByClient } from '../../services/api';

const ClientReviewsList = ({ clientId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReviews = useCallback(async () => {
    if (!clientId) return;
    setLoading(true);
    setError('');
    try {
      const data = await getReviewsByClient(clientId);
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement de vos avis.');
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

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
    <div className="client-reviews-card" style={{
      background: '#ffffff',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      padding: '24px',
      marginTop: '24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        borderBottom: '1px solid #f1f5f9',
        paddingBottom: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: '#eff6ff',
            color: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem'
          }}>
            💬
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: 600 }}>
              Mes Avis et Notes sur d'autres annonces
            </h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
              Consultez l'historique des notes et commentaires que vous avez publiés suite à vos visites.
            </p>
          </div>
        </div>
        <span style={{
          background: '#f1f5f9',
          color: '#334155',
          padding: '4px 10px',
          borderRadius: '20px',
          fontSize: '0.82rem',
          fontWeight: 600
        }}>
          {reviews.length} avis publié{reviews.length > 1 ? 's' : ''}
        </span>
      </div>

      {loading && (
        <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
          Chargement de vos avis...
        </div>
      )}

      {error && (
        <div style={{
          background: '#fee2e2',
          color: '#b91c1c',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '0.9rem',
          marginBottom: '16px'
        }}>
          {error}
        </div>
      )}

      {!loading && !error && reviews.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          background: '#f8fafc',
          borderRadius: '8px',
          border: '1px dashed #cbd5e1'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>✍️</div>
          <p style={{ color: '#0f172a', fontWeight: 600, margin: '0 0 4px 0' }}>
            Aucun avis publié pour le moment
          </p>
          <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>
            Après avoir effectué et terminé une visite de bien, vous pourrez noter et laisser un avis sur l'annonce.
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

            const targetName = rev.targetUser
              ? `${rev.targetUser.firstName || ''} ${rev.targetUser.lastName || ''}`.trim() || rev.targetUser.email
              : 'Propriétaire / Agence';

            return (
              <div
                key={rev.id}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '16px 20px',
                  background: '#fafafa',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                  <div>
                    {rev.propertyTitle && (
                      <div style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>🏠</span>
                        <span>{rev.propertyTitle}</span>
                        {rev.propertyCity && (
                          <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 400 }}>
                            ({rev.propertyCity})
                          </span>
                        )}
                      </div>
                    )}
                    <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '2px' }}>
                      Destinataire : <strong>{targetName}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                      {renderStars(rev.rating)}
                    </div>
                    <span style={{
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      color: '#0f172a',
                      background: '#fef3c7',
                      padding: '2px 8px',
                      borderRadius: '6px'
                    }}>
                      {rev.rating}/5
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginLeft: '6px' }}>
                      {dateStr}
                    </span>
                  </div>
                </div>

                {rev.comment ? (
                  <p style={{
                    margin: 0,
                    fontSize: '0.92rem',
                    color: '#334155',
                    background: '#ffffff',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    lineHeight: '1.5'
                  }}>
                    « {rev.comment} »
                  </p>
                ) : (
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>
                    Aucun commentaire rédigé (note seule).
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClientReviewsList;
