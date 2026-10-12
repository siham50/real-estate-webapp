import React, { useState, useEffect } from 'react';
import { fetchResidences, deleteResidence } from '../services/api';

const ResidenceList = ({ onEdit, refreshTrigger = 0 }) => {
  const [residences, setResidences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const loadResidences = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchResidences();
      const list = response.data || [];
      setResidences(list);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Erreur lors du chargement des résidences');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResidences();
  }, [refreshTrigger]);

  const handleDelete = async (residence) => {
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer la résidence "${residence.name}" ?`
    );
    if (!confirmed) return;

    setActionError(null);
    setDeletingId(residence.id);
    try {
      await deleteResidence(residence.id);
      await loadResidences();
    } catch (err) {
      setActionError(
        err.response?.data?.message || err.message || 'Erreur lors de la suppression de la résidence'
      );
    } finally {
      setDeletingId(null);
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
                <th>Propriétaire</th>
                <th>Biens associés</th>
                <th className="th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {residences.map((residence) => (
                <tr key={residence.id}>
                  <td>{residence.id}</td>
                  <td className="font-semibold">{residence.name}</td>
                  <td>{residence.city}</td>
                  <td>{residence.address}</td>
                  <td>
                    {residence.owner
                      ? `${residence.owner.firstName || ''} ${residence.owner.lastName || ''} (ID: ${residence.owner.id})`
                      : '-'}
                  </td>
                  <td>
                    <span className="badge-count">
                      {residence.properties ? residence.properties.length : 0}
                    </span>
                  </td>
                  <td className="td-actions">
                    <button
                      type="button"
                      className="btn-action btn-edit"
                      onClick={() => onEdit && onEdit(residence)}
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      className="btn-action btn-delete"
                      onClick={() => handleDelete(residence)}
                      disabled={deletingId === residence.id}
                    >
                      {deletingId === residence.id ? 'Suppression...' : 'Supprimer'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default ResidenceList;
