import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getOwnerBookings, updateBookingStatus } from '../../services/api';

const STATUS_BADGES = {
  PENDING: { label: 'En attente', className: 'agency-badge-pending' },
  CONFIRMED: { label: 'Confirmée', className: 'agency-badge-confirmed' },
  CANCELLED: { label: 'Annulée', className: 'agency-badge-cancelled' },
  COMPLETED: { label: 'Terminée', className: 'agency-badge-completed' },
  RESCHEDULED: { label: 'Replanifiée', className: 'agency-badge-pending' },
};

const AgencyBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');

  const fetchBookings = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError('');
    try {
      const data = await getOwnerBookings(user.id);
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Impossible de récupérer les réservations.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    setError('');
    try {
      const updated = await updateBookingStatus(id, newStatus);
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: updated.status || newStatus } : b))
      );
    } catch (err) {
      setError(err.message || 'Erreur lors de la mise à jour du statut.');
    } finally {
      setUpdatingId(null);
    }
  };

  const formatClientName = (client) => {
    if (!client) return 'Client';
    const name = `${client.firstName || ''} ${client.lastName || ''}`.trim();
    return name || client.email || 'Client';
  };

  const formatVisitDate = (availability) => {
    if (!availability) return 'Non spécifiée';
    const dateStr = availability.date;
    const start = availability.startTime ? String(availability.startTime).substring(0, 5) : '';
    const end = availability.endTime ? String(availability.endTime).substring(0, 5) : '';

    let formattedDate = dateStr;
    try {
      const d = new Date(dateStr);
      formattedDate = d.toLocaleDateString('fr-FR', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      // conserver format brut
    }

    if (start && end) {
      return `${formattedDate} (${start} - ${end})`;
    } else if (start) {
      return `${formattedDate} à ${start}`;
    }
    return formattedDate;
  };

  const filteredBookings = bookings.filter((b) => {
    if (filterStatus === 'ALL') return true;
    return b.status === filterStatus;
  });

  if (loading) {
    return (
      <div className="agency-loading-state">
        <div className="agency-spinner" />
        <p>Chargement des demandes de visites...</p>
      </div>
    );
  }

  return (
    <div className="agency-bookings-wrapper">
      {error && <div className="agency-alert-error mb-16">{error}</div>}

      {/* Barre de filtres et d'état */}
      <div className="agency-bookings-header-bar">
        <div className="agency-filter-pills">
          <button
            type="button"
            className={`agency-filter-pill-btn ${filterStatus === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilterStatus('ALL')}
          >
            Toutes ({bookings.length})
          </button>
          <button
            type="button"
            className={`agency-filter-pill-btn ${filterStatus === 'PENDING' ? 'active' : ''}`}
            onClick={() => setFilterStatus('PENDING')}
          >
            En attente ({bookings.filter((b) => b.status === 'PENDING').length})
          </button>
          <button
            type="button"
            className={`agency-filter-pill-btn ${filterStatus === 'CONFIRMED' ? 'active' : ''}`}
            onClick={() => setFilterStatus('CONFIRMED')}
          >
            Confirmées ({bookings.filter((b) => b.status === 'CONFIRMED').length})
          </button>
          <button
            type="button"
            className={`agency-filter-pill-btn ${filterStatus === 'COMPLETED' ? 'active' : ''}`}
            onClick={() => setFilterStatus('COMPLETED')}
          >
            Terminées ({bookings.filter((b) => b.status === 'COMPLETED').length})
          </button>
        </div>

        <button
          type="button"
          onClick={fetchBookings}
          className="agency-btn-refresh"
          title="Actualiser la liste"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
          Actualiser
        </button>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="agency-empty-state">
          <div className="agency-empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <p className="agency-empty-title">Aucune demande de visite</p>
          <p className="agency-empty-desc">
            {filterStatus === 'ALL'
              ? "Vous n'avez reçu aucune réservation pour vos biens pour le moment."
              : 'Aucune demande ne correspond à ce filtre.'}
          </p>
        </div>
      ) : (
        <div className="agency-table-wrapper">
          <table className="agency-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Client</th>
                <th>Bien Immobilier</th>
                <th>Date de Visite</th>
                <th>Statut</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => {
                const statusMeta = STATUS_BADGES[booking.status] || {
                  label: booking.status,
                  className: 'agency-badge-pending',
                };
                const isUpdating = updatingId === booking.id;

                return (
                  <tr key={booking.id}>
                    <td>
                      <span className="agency-table-id">#{booking.id}</span>
                    </td>
                    <td>
                      <div className="booking-client-cell">
                        <div className="client-avatar-mini">
                          {formatClientName(booking.client).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <strong className="agency-table-name">
                            {formatClientName(booking.client)}
                          </strong>
                          {booking.client?.email && (
                            <span className="client-email-sub">{booking.client.email}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="booking-property-title">
                        {booking.property?.title || 'Bien non spécifié'}
                      </span>
                      {booking.property?.city && (
                        <span className="booking-property-city">
                          📍 {booking.property.city}
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="booking-date-cell">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <span>{formatVisitDate(booking.availability)}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`agency-badge ${statusMeta.className}`}>
                        {statusMeta.label}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="booking-actions-row">
                        {isUpdating ? (
                          <div className="agency-spinner-sm" />
                        ) : (
                          <>
                            {/* Actions si PENDING */}
                            {booking.status === 'PENDING' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(booking.id, 'CONFIRMED')}
                                  className="agency-btn-action agency-btn-confirm"
                                  title="Confirmer la visite"
                                >
                                  Confirmer
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(booking.id, 'CANCELLED')}
                                  className="agency-btn-action agency-btn-cancel"
                                  title="Annuler la visite"
                                >
                                  Annuler
                                </button>
                              </>
                            )}

                            {/* Actions si CONFIRMED */}
                            {booking.status === 'CONFIRMED' && (
                              <button
                                type="button"
                                onClick={() => handleStatusChange(booking.id, 'COMPLETED')}
                                className="agency-btn-action agency-btn-complete"
                                title="Marquer comme effectuée"
                              >
                                Marquer comme Terminée
                              </button>
                            )}

                            {/* Si CANCELLED ou COMPLETED */}
                            {(booking.status === 'CANCELLED' || booking.status === 'COMPLETED') && (
                              <span className="agency-action-inactive-hint">
                                Aucune action requise
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AgencyBookings;
