import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getAvailabilitiesByOwner,
  createAvailability,
  deleteAvailability,
} from '../../services/api';

const AgencyAvailabilities = () => {
  const { user } = useAuth();

  const [availabilities, setAvailabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  // Champs du formulaire
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const [deletingId, setDeletingId] = useState(null);

  const fetchAvailabilities = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setFetchError('');
    try {
      const data = await getAvailabilitiesByOwner(user.id);
      setAvailabilities(Array.isArray(data) ? data : []);
    } catch (err) {
      setFetchError(err.message || 'Impossible de charger vos créneaux.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchAvailabilities();
  }, [fetchAvailabilities]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!date || !startTime || !endTime) {
      setFormError('Veuillez renseigner la date, l’heure de début et l’heure de fin.');
      return;
    }

    if (startTime >= endTime) {
      setFormError("L'heure de fin doit être postérieure à l'heure de début.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        userId: user.id,
        date,
        startTime,
        endTime,
      };

      const newSlot = await createAvailability(payload);
      setFormSuccess('Créneau de visite ajouté avec succès !');
      // Réinitialiser les champs de temps pour saisie rapide
      setStartTime('');
      setEndTime('');

      // Ajouter à la liste ou rafraîchir
      if (newSlot && newSlot.id) {
        setAvailabilities((prev) => [newSlot, ...prev]);
      } else {
        fetchAvailabilities();
      }
    } catch (err) {
      setFormError(err.message || "Erreur lors de la création du créneau.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSlot = async (id) => {
    if (!window.confirm('Supprimer ce créneau disponible ?')) return;
    setDeletingId(id);
    setFormError('');
    try {
      await deleteAvailability(id);
      setAvailabilities((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setFormError(err.message || 'Impossible de supprimer ce créneau.');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('fr-FR', {
        weekday: 'short',
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

  // Date minimale aujourd'hui (format YYYY-MM-DD)
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="agency-availabilities-wrapper">
      {fetchError && <div className="agency-alert-error mb-16">{fetchError}</div>}

      {/* Formulaire d'ajout de créneau */}
      <div className="agency-avail-card agency-avail-form-card">
        <div className="agency-avail-form-header">
          <div className="avail-icon-circle">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div>
            <h2 className="agency-avail-title">Ajouter un créneau de disponibilité</h2>
            <p className="agency-avail-subtitle">
              Publiez les plages horaires où vos agents ou collaborateurs peuvent recevoir des visites.
            </p>
          </div>
        </div>

        {formError && (
          <div className="agency-alert-error mb-14" role="alert">
            <span>⚠️ {formError}</span>
          </div>
        )}

        {formSuccess && (
          <div className="agency-alert-success mb-14" role="alert">
            <span>✓ {formSuccess}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="agency-avail-inline-form">
          <div className="avail-form-group">
            <label htmlFor="avail-date">Date de visite *</label>
            <input
              id="avail-date"
              type="date"
              min={todayStr}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="agency-input"
              required
            />
          </div>

          <div className="avail-form-group">
            <label htmlFor="avail-start">Heure de début *</label>
            <input
              id="avail-start"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="agency-input"
              required
            />
          </div>

          <div className="avail-form-group">
            <label htmlFor="avail-end">Heure de fin *</label>
            <input
              id="avail-end"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="agency-input"
              required
            />
          </div>

          <div className="avail-form-action">
            <button
              type="submit"
              disabled={submitting}
              className="agency-btn-primary avail-submit-btn"
            >
              {submitting ? (
                <>
                  <span className="agency-spinner-sm white" />
                  <span>Ajout...</span>
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  <span>Ajouter le créneau</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Liste des créneaux existants */}
      <div className="agency-avail-card agency-avail-list-card">
        <div className="agency-avail-list-header">
          <div>
            <h3 className="agency-avail-title">Mes créneaux configurés</h3>
            <span className="agency-avail-count">
              {availabilities.length} créneau{availabilities.length > 1 ? 'x' : ''} au total
            </span>
          </div>

          <button
            type="button"
            onClick={fetchAvailabilities}
            className="agency-btn-refresh"
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

        {loading ? (
          <div className="agency-loading-state">
            <div className="agency-spinner" />
            <p>Chargement des créneaux...</p>
          </div>
        ) : availabilities.length === 0 ? (
          <div className="agency-empty-state">
            <div className="agency-empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <p className="agency-empty-title">Aucun créneau configuré</p>
            <p className="agency-empty-desc">
              Utilisez le formulaire ci-dessus pour publier vos plages horaires de visite.
            </p>
          </div>
        ) : (
          <div className="agency-table-wrapper">
            <table className="agency-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Date</th>
                  <th>Horaires</th>
                  <th>Statut</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {availabilities.map((slot) => {
                  const isBooked = slot.isBooked === true;
                  const isDeleting = deletingId === slot.id;

                  return (
                    <tr key={slot.id}>
                      <td>
                        <span className="agency-table-id">#{slot.id}</span>
                      </td>
                      <td>
                        <strong className="avail-date-text">
                          📅 {formatDateDisplay(slot.date)}
                        </strong>
                      </td>
                      <td>
                        <span className="avail-hours-pill">
                          {formatTimeDisplay(slot.startTime)} - {formatTimeDisplay(slot.endTime)}
                        </span>
                      </td>
                      <td>
                        {isBooked ? (
                          <span className="agency-badge agency-badge-booked">
                            ● Réservé
                          </span>
                        ) : (
                          <span className="agency-badge agency-badge-free">
                            ● Libre
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {isBooked ? (
                          <span className="agency-table-muted" title="Ce créneau est réservé par un client">
                            Réservé
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleDeleteSlot(slot.id)}
                            disabled={isDeleting}
                            className="agency-btn-delete"
                            title="Supprimer ce créneau libre"
                          >
                            {isDeleting ? (
                              <span className="agency-spinner-sm" />
                            ) : (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6l-1 14H6L5 6" />
                                <path d="M10 11v6M14 11v6" />
                                <path d="M9 6V4h6v2" />
                              </svg>
                            )}
                            Supprimer
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgencyAvailabilities;
