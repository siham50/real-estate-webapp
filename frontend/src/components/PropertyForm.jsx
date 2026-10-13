import React, { useState, useEffect } from 'react';
import {
  createProperty,
  updateProperty,
  fetchUsers,
  fetchResidences,
} from '../services/api';

const PROPERTY_TYPES = [
  { value: 'APARTMENT', label: 'Appartement' },
  { value: 'VILLA', label: 'Villa' },
  { value: 'HOUSE', label: 'Maison' },
  { value: 'LAND', label: 'Terrain' },
  { value: 'COMMERCIAL', label: 'Local Commercial' },
  { value: 'OFFICE', label: 'Bureau' },
];

const PROPERTY_PURPOSES = [
  { value: 'SALE', label: 'Vente' },
  { value: 'RENT', label: 'Location' },
];

const INITIAL_FORM = {
  title: '',
  description: '',
  type: 'APARTMENT',
  purpose: 'SALE',
  price: '',
  surfaceArea: '',
  address: '',
  city: '',
  latitude: '',
  longitude: '',
  residenceId: '',
  ownerId: '',
};

const PropertyForm = ({ propertyToEdit = null, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [users, setUsers] = useState([]);
  const [residences, setResidences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const isEditMode = Boolean(propertyToEdit && propertyToEdit.id);

  // Load users and residences for dropdown selects
  useEffect(() => {
    const loadRelations = async () => {
      try {
        const [usersRes, residencesRes] = await Promise.all([
          fetchUsers(),
          fetchResidences(),
        ]);

        if (usersRes.success && Array.isArray(usersRes.data)) {
          setUsers(usersRes.data);
          if (!isEditMode && usersRes.data.length > 0 && !formData.ownerId) {
            setFormData((prev) => ({ ...prev, ownerId: usersRes.data[0].id }));
          }
        }

        if (residencesRes.data && Array.isArray(residencesRes.data)) {
          setResidences(residencesRes.data);
        }
      } catch (err) {
        console.error('Erreur chargement des relations:', err);
      }
    };

    loadRelations();
  }, [isEditMode]);

  useEffect(() => {
    if (propertyToEdit && propertyToEdit.id) {
      setFormData({
        title: propertyToEdit.title || '',
        description: propertyToEdit.description || '',
        type: propertyToEdit.type || 'APARTMENT',
        purpose: propertyToEdit.purpose || 'SALE',
        price: propertyToEdit.price != null ? propertyToEdit.price : '',
        surfaceArea: propertyToEdit.surfaceArea != null ? propertyToEdit.surfaceArea : '',
        address: propertyToEdit.address || '',
        city: propertyToEdit.city || '',
        latitude: propertyToEdit.latitude != null ? propertyToEdit.latitude : '',
        longitude: propertyToEdit.longitude != null ? propertyToEdit.longitude : '',
        residenceId: propertyToEdit.residence?.id || '',
        ownerId: propertyToEdit.owner?.id || '',
      });
    } else {
      setFormData((prev) => ({
        ...INITIAL_FORM,
        ownerId: users.length > 0 ? users[0].id : '',
      }));
    }
    setSuccessMessage('');
    setErrorMessage('');
  }, [propertyToEdit, users]);

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
        title: formData.title,
        description: formData.description,
        type: formData.type,
        purpose: formData.purpose,
        price: parseFloat(formData.price),
        surfaceArea: parseFloat(formData.surfaceArea),
        address: formData.address,
        city: formData.city,
        latitude: formData.latitude !== '' ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude !== '' ? parseFloat(formData.longitude) : null,
        residence: formData.residenceId ? { id: parseInt(formData.residenceId, 10) } : null,
        owner: formData.ownerId ? { id: parseInt(formData.ownerId, 10) } : null,
      };

      if (!payload.owner) {
        setErrorMessage('Veuillez sélectionner un propriétaire.');
        setLoading(false);
        return;
      }

      if (isEditMode) {
        await updateProperty(propertyToEdit.id, payload);
        setSuccessMessage('Bien immobilier modifié avec succès !');
      } else {
        await createProperty(payload);
        setSuccessMessage('Bien immobilier créé avec succès !');
        setFormData(INITIAL_FORM);
      }

      if (onSuccess) onSuccess();
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || err.message || 'Erreur lors de l’enregistrement du bien'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="crud-form property-form">
      <h2>{isEditMode ? 'Modifier le bien immobilier' : 'Ajouter un bien immobilier'}</h2>

      {successMessage && <div className="alert-success">{successMessage}</div>}
      {errorMessage && <div className="alert-error">{errorMessage}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="propTitle">Titre de l’annonce *</label>
          <input
            type="text"
            id="propTitle"
            name="title"
            className="form-input"
            value={formData.title}
            onChange={handleChange}
            placeholder="Ex: Bel appartement avec vue sur mer"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="propType">Type de bien *</label>
            <select
              id="propType"
              name="type"
              className="form-select"
              value={formData.type}
              onChange={handleChange}
              required
            >
              {PROPERTY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="propPurpose">Objectif *</label>
            <select
              id="propPurpose"
              name="purpose"
              className="form-select"
              value={formData.purpose}
              onChange={handleChange}
              required
            >
              {PROPERTY_PURPOSES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="propPrice">Prix (MAD / DH) *</label>
            <input
              type="number"
              step="any"
              id="propPrice"
              name="price"
              className="form-input"
              value={formData.price}
              onChange={handleChange}
              placeholder="Ex: 1200000"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="propSurfaceArea">Surface (m²) *</label>
            <input
              type="number"
              step="any"
              id="propSurfaceArea"
              name="surfaceArea"
              className="form-input"
              value={formData.surfaceArea}
              onChange={handleChange}
              placeholder="Ex: 110"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="propCity">Ville *</label>
            <input
              type="text"
              id="propCity"
              name="city"
              className="form-input"
              value={formData.city}
              onChange={handleChange}
              placeholder="Ex: Casablanca, Rabat, Marrakech..."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="propAddress">Adresse *</label>
            <input
              type="text"
              id="propAddress"
              name="address"
              className="form-input"
              value={formData.address}
              onChange={handleChange}
              placeholder="Ex: 45 Boulevard d'Anfa"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="propOwner">Propriétaire *</label>
            {users.length > 0 ? (
              <select
                id="propOwner"
                name="ownerId"
                className="form-select"
                value={formData.ownerId}
                onChange={handleChange}
                required
              >
                <option value="">Sélectionnez un propriétaire</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.firstName} {u.lastName} ({u.email})
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="number"
                id="propOwner"
                name="ownerId"
                className="form-input"
                value={formData.ownerId}
                onChange={handleChange}
                placeholder="ID de l’utilisateur"
                required
              />
            )}
          </div>

          <div className="form-group">
            <label htmlFor="propResidence">Résidence parente (Optionnel)</label>
            <select
              id="propResidence"
              name="residenceId"
              className="form-select"
              value={formData.residenceId}
              onChange={handleChange}
            >
              <option value="">Aucune (Bien indépendant)</option>
              {residences.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} - {r.city}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="propDescription">Description détaillée</label>
          <textarea
            id="propDescription"
            name="description"
            className="form-input form-textarea"
            rows="3"
            value={formData.description}
            onChange={handleChange}
            placeholder="Étage, orientation, finitions, nombre de chambres, etc."
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
              : 'Créer le bien'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PropertyForm;
