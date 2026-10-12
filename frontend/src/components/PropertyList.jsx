import React, { useState, useEffect } from 'react';
import { fetchProperties, deleteProperty } from '../services/api';

const PropertyList = ({ onEdit, refreshTrigger = 0 }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const loadProperties = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchProperties();
      const list = response.data || [];
      setProperties(list);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Erreur lors du chargement des biens'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, [refreshTrigger]);

  const handleDelete = async (property) => {
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer le bien "${property.title}" ?`
    );
    if (!confirmed) return;

    setActionError(null);
    setDeletingId(property.id);
    try {
      await deleteProperty(property.id);
      await loadProperties();
    } catch (err) {
      setActionError(
        err.response?.data?.message || err.message || 'Erreur lors de la suppression'
      );
    } finally {
      setDeletingId(null);
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
                <th>Objectif</th>
                <th>Prix</th>
                <th>Surface</th>
                <th>Ville</th>
                <th>Résidence</th>
                <th>Propriétaire</th>
                <th className="th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((property) => (
                <tr key={property.id}>
                  <td>{property.id}</td>
                  <td className="font-semibold">{property.title}</td>
                  <td>
                    <span className="badge-type">{getTypeLabel(property.type)}</span>
                  </td>
                  <td>
                    <span
                      className={`badge-purpose ${
                        property.purpose === 'SALE' ? 'badge-sale' : 'badge-rent'
                      }`}
                    >
                      {property.purpose === 'SALE' ? 'Vente' : 'Location'}
                    </span>
                  </td>
                  <td className="font-semibold price-cell">
                    {formatPrice(property.price)}
                  </td>
                  <td>{property.surfaceArea ? `${property.surfaceArea} m²` : '-'}</td>
                  <td>{property.city}</td>
                  <td>{property.residence ? property.residence.name : '-'}</td>
                  <td>
                    {property.owner
                      ? `${property.owner.firstName || ''} ${property.owner.lastName || ''}`
                      : '-'}
                  </td>
                  <td className="td-actions">
                    <button
                      type="button"
                      className="btn-action btn-edit"
                      onClick={() => onEdit && onEdit(property)}
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      className="btn-action btn-delete"
                      onClick={() => handleDelete(property)}
                      disabled={deletingId === property.id}
                    >
                      {deletingId === property.id ? 'Suppression...' : 'Supprimer'}
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

export default PropertyList;
