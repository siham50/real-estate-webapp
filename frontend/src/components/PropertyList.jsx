import React, { useState, useEffect } from 'react';
import {
  fetchProperties,
  togglePropertyAvailability,
  deleteProperty,
} from '../services/api';

const PropertyList = ({ onEdit, refreshTrigger = 0 }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [actionInProgressId, setActionInProgressId] = useState(null);

  const loadProperties = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchProperties();
      const list = response.data || [];
      setProperties(list);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Erreur lors du chargement des biens'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, [refreshTrigger]);

  const handleToggleAvailability = async (id) => {
    setActionError(null);
    setActionInProgressId(id);
    try {
      const result = await togglePropertyAvailability(id);
      if (result.success) {
        await loadProperties();
      } else {
        setActionError(result.error || 'Erreur lors du changement de disponibilité');
      }
    } catch (err) {
      setActionError(err.message || 'Erreur lors du changement de disponibilité');
    } finally {
      setActionInProgressId(null);
    }
  };

  const handleDelete = async (property) => {
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer le bien "${property.title}" ?`
    );
    if (!confirmed) return;

    setActionError(null);
    setActionInProgressId(property.id);
    try {
      const result = await deleteProperty(property.id);
      if (result.success) {
        await loadProperties();
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

  const formatPrice = (price) => {
    if (price == null) return '-';
    return Number(price).toLocaleString('fr-FR') + ' DH';
  };

  const getTypeLabel = (type) => {
    const map = {
      APARTMENT: 'Appartement',
      VILLA: 'Villa',
      HOUSE: 'Maison',
      LAND: 'Terrain',
      COMMERCIAL: 'Local Commercial',
      OFFICE: 'Bureau',
    };
    return map[type] || type;
  };

  return (
    <section className="crud-list property-list">
      {actionError && <div className="alert-error">{actionError}</div>}

      {loading && <p className="user-loading">Chargement des biens immobiliers...</p>}

      {error && (
        <p className="user-error">Erreur lors de la récupération : {error}</p>
      )}

      {!loading && !error && properties.length === 0 && (
        <p className="user-empty">Aucun bien immobilier enregistré pour le moment.</p>
      )}

      {!loading && !error && properties.length > 0 && (
        <div className="table-responsive">
          <table className="crud-table property-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Titre</th>
                <th>Type</th>
                <th>Prix</th>
                <th>Ville</th>
                <th>Statut</th>
                <th className="th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((property) => {
                const isAvailable =
                  property.isAvailable !== undefined
                    ? property.isAvailable
                    : property.available !== undefined
                      ? property.available
                      : true;

                return (
                  <tr key={property.id}>
                    <td>{property.id}</td>
                    <td className="font-semibold">{property.title}</td>
                    <td>
                      <span className="badge-type">{getTypeLabel(property.type)}</span>
                    </td>
                    <td className="font-semibold price-cell">
                      {formatPrice(property.price)}
                    </td>
                    <td>{property.city}</td>
                    <td>
                      <span
                        className={`badge-status ${isAvailable ? 'badge-available' : 'badge-hidden'
                          }`}
                      >
                        {isAvailable ? 'Disponible' : 'Masquée'}
                      </span>
                    </td>
                    <td className="td-actions">
                      <button
                        type="button"
                        className="btn-action btn-edit"
                        onClick={() => onEdit && onEdit(property)}
                        disabled={actionInProgressId === property.id}
                      >
                        Modifier
                      </button>

                      <button
                        type="button"
                        className="btn-action btn-toggle"
                        onClick={() => handleToggleAvailability(property.id)}
                        disabled={actionInProgressId === property.id}
                      >
                        {isAvailable ? 'Masquer' : 'Afficher'}
                      </button>

                      <button
                        type="button"
                        className="btn-action btn-delete"
                        onClick={() => handleDelete(property)}
                        disabled={actionInProgressId === property.id}
                      >
                        {actionInProgressId === property.id ? 'Patientez...' : 'Supprimer'}
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

export default PropertyList;
