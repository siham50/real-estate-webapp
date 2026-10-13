import React, { useState, useEffect } from 'react';
import {
  fetchResidences,
  toggleResidenceAvailability,
  deleteResidence,
} from '../services/api';

const ResidenceList = ({ onEdit, refreshTrigger = 0 }) => {
  const [residences, setResidences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [actionInProgressId, setActionInProgressId] = useState(null);

  const loadResidences = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchResidences();
      const list = response.data || [];
      setResidences(list);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Erreur lors du chargement des résidences'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResidences();
  }, [refreshTrigger]);

  const handleToggleAvailability = async (id) => {
    setActionError(null);
    setActionInProgressId(id);
    try {
      const result = await toggleResidenceAvailability(id);
      if (result.success) {
        await loadResidences();
      } else {
        setActionError(result.error || 'Erreur lors du changement de disponibilité');
      }
    } catch (err) {
      setActionError(err.message || 'Erreur lors du changement de disponibilité');
    } finally {
      setActionInProgressId(null);
    }
  };

  const handleDelete = async (residence) => {
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer la résidence "${residence.name}" ?`
    );
    if (!confirmed) return;

    setActionError(null);
    setActionInProgressId(residence.id);
    try {
      const result = await deleteResidence(residence.id);
      if (result.success) {
        await loadResidences();
      } else {
        setActionError(result.error || 'Erreur lors de la suppression');
      }
    } catch (err) {
      setActionError(
        err.response?.data?.message || err.message || 'Erreur lors de la suppression'
      );
    } finally {
      setActionInProgressId(null);
    }
  };

  return (
    <section className="crud-list residence-list">
      {actionError && <div className="alert-error">{actionError}</div>}

      {loading && <p className="user-loading">Chargement des résidences...</p>}

      {error && (
        <p className="user-error">Erreur lors de la récupération : {error}</p>
      )}

      {!loading && !error && residences.length === 0 && (
        <p className="user-empty">Aucune résidence enregistrée pour le moment.</p>
      )}

      {!loading && !error && residences.length > 0 && (
        <div className="table-responsive">
          <table className="crud-table residence-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nom</th>
                <th>Ville</th>
                <th>Adresse</th>
                <th>Statut</th>
                <th className="th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {residences.map((residence) => {
                const isAvailable =
                  residence.isAvailable !== undefined
                    ? residence.isAvailable
                    : residence.available !== undefined
                    ? residence.available
                    : true;

                return (
                  <tr key={residence.id}>
                    <td>{residence.id}</td>
                    <td className="font-semibold">{residence.name}</td>
                    <td>{residence.city}</td>
                    <td>{residence.address}</td>
                    <td>
                      <span
                        className={`badge-status ${
                          isAvailable ? 'badge-available' : 'badge-hidden'
                        }`}
                      >
                        {isAvailable ? 'Disponible' : 'Masquée'}
                      </span>
                    </td>
                    <td className="td-actions">
                      <button
                        type="button"
                        className="btn-action btn-edit"
                        onClick={() => onEdit && onEdit(residence)}
                        disabled={actionInProgressId === residence.id}
                      >
                        Modifier
                      </button>

                      <button
                        type="button"
                        className="btn-action btn-toggle"
                        onClick={() => handleToggleAvailability(residence.id)}
                        disabled={actionInProgressId === residence.id}
                      >
                        {isAvailable ? 'Masquer' : 'Afficher'}
                      </button>

                      <button
                        type="button"
                        className="btn-action btn-delete"
                        onClick={() => handleDelete(residence)}
                        disabled={actionInProgressId === residence.id}
                      >
                        {actionInProgressId === residence.id ? 'Patientez...' : 'Supprimer'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default ResidenceList;
