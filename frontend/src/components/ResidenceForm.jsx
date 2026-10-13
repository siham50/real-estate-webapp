import React, { useState, useEffect } from 'react';
import { createResidence, updateResidence, fetchUsers } from '../services/api';

const INITIAL_FORM = {
  name: '',
  description: '',
  address: '',
  city: '',
  latitude: '',
  longitude: '',
  ownerId: '',
};

const ResidenceForm = ({ residenceToEdit = null, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const isEditMode = Boolean(residenceToEdit && residenceToEdit.id);

  // Load available users for the owner select dropdown
  useEffect(() => {
    const loadUsersList = async () => {
      try {
        const result = await fetchUsers();
        if (result.success && Array.isArray(result.data)) {
          setUsers(result.data);
          if (!isEditMode && result.data.length > 0 && !formData.ownerId) {
            setFormData((prev) => ({ ...prev, ownerId: result.data[0].id }));
          }
        }
      } catch (err) {
        console.error('Erreur chargement utilisateurs:', err);
      }
    };
    loadUsersList();
  }, [isEditMode]);

  useEffect(() => {
    if (residenceToEdit && residenceToEdit.id) {
      setFormData({
        name: residenceToEdit.name || '',
        description: residenceToEdit.description || '',
        address: residenceToEdit.address || '',
        city: residenceToEdit.city || '',
        latitude: residenceToEdit.latitude != null ? residenceToEdit.latitude : '',
        longitude: residenceToEdit.longitude != null ? residenceToEdit.longitude : '',
        ownerId: residenceToEdit.owner?.id || '',
      });
    } else {
      setFormData((prev) => ({
        ...INITIAL_FORM,
        ownerId: users.length > 0 ? users[0].id : '',
      }));
    }
    setSuccessMessage('');
    setErrorMessage('');
  }, [residenceToEdit, users]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        address: formData.address,
        city: formData.city,
        latitude: formData.latitude !== '' ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude !== '' ? parseFloat(formData.longitude) : null,
        owner: formData.ownerId ? { id: parseInt(formData.ownerId, 10) } : null,
      };

      if (!payload.owner) {
        setErrorMessage('Veuillez sélectionner un propriétaire.');
        setLoading(false);
        return;
      }

      if (isEditMode) {
        await updateResidence(residenceToEdit.id, payload);
        setSuccessMessage('Résidence modifiée avec succès !');
      } else {
        await createResidence(payload);
        setSuccessMessage('Résidence créée avec succès !');
        setFormData(INITIAL_FORM);
      }

      if (onSuccess) onSuccess();
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || err.message || 'Erreur lors de l’enregistrement de la résidence'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="crud-form residence-form">
      <h2>{isEditMode ? 'Modifier la résidence' : 'Ajouter une résidence'}</h2>

      {successMessage && <div className="alert-success">{successMessage}</div>}
      {errorMessage && <div className="alert-error">{errorMessage}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="residenceName">Nom de la résidence *</label>
            <input
              type="text"
              id="residenceName"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="residenceCity">Ville *</label>
            <input
              type="text"
              id="residenceCity"
              name="city"
              className="form-input"
              value={formData.city}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="residenceAddress">Adresse complète *</label>
          <input
            type="text"
            id="residenceAddress"
            name="address"
            className="form-input"
            value={formData.address}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="residenceLatitude">Latitude</label>
            <input
              type="number"
              step="any"
              id="residenceLatitude"
              name="latitude"
              className="form-input"
              value={formData.latitude}
              onChange={handleChange}
              placeholder="Ex: 33.5731"
            />
          </div>

          <div className="form-group">
            <label htmlFor="residenceLongitude">Longitude</label>
            <input
              type="number"
              step="any"
              id="residenceLongitude"
              name="longitude"
              className="form-input"
              value={formData.longitude}
              onChange={handleChange}
              placeholder="Ex: -7.5898"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="residenceOwner">Propriétaire / Promoteur *</label>
          {users.length > 0 ? (
            <select
              id="residenceOwner"
              name="ownerId"
              className="form-select"
              value={formData.ownerId}
              onChange={handleChange}
              required
            >
              <option value="">Sélectionnez un propriétaire</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.firstName} {u.lastName} ({u.email}) - {u.role}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="number"
              id="residenceOwner"
              name="ownerId"
              className="form-input"
              value={formData.ownerId}
              onChange={handleChange}
              placeholder="ID de l’utilisateur propriétaire (ex: 1)"
              required
            />
          )}
        </div>

        <div className="form-group">
          <label htmlFor="residenceDescription">Description</label>
          <textarea
            id="residenceDescription"
            name="description"
            className="form-input form-textarea"
            rows="3"
            value={formData.description}
            onChange={handleChange}
            placeholder="Détails sur les prestations de la résidence (ascenseur, piscine, sécurité...)"
          />
        </div>

        <div className="form-actions">
          {onCancel && (
            <button
              type="button"
              className="btn-secondary btn-cancel"
              onClick={onCancel}
              disabled={loading}
            >
              Annuler
            </button>
          )}
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading
              ? 'Enregistrement...'
              : isEditMode
              ? 'Mettre à jour'
              : 'Créer la résidence'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResidenceForm;
