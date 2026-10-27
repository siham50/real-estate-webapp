import React, { useState } from 'react';
import { createResidence } from '../services/api';
import { useAuth } from '../context/AuthContext';

const EMPTY_FORM = {
  name: '',
  description: '',
  address: '',
  city: '',
  latitude: '',
  longitude: '',
};

const ResidenceFormModal = ({ onClose, onCreated }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        latitude: formData.latitude !== '' ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude !== '' ? parseFloat(formData.longitude) : null,
        owner: { id: user.id },
        isAvailable: true,
        isDeleted: false,
      };
      const created = await createResidence(payload);
      onCreated(created);
      onClose();
    } catch (err) {
      setError(err.message || 'Erreur lors de la création de la résidence.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="agency-modal-overlay" onClick={onClose}>
      <div className="agency-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="agency-modal-header">
          <h2 className="agency-modal-title">Nouvelle résidence</h2>
          <button type="button" className="agency-modal-close" onClick={onClose} aria-label="Fermer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {error && <div className="agency-alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="agency-modal-form">
          <div className="agency-field-group">
            <label htmlFor="res-name">Nom de la résidence *</label>
            <input
              id="res-name"
              name="name"
              type="text"
              required
              className="agency-input"
              placeholder="Ex : Résidence Al Amal"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="agency-field-group">
            <label htmlFor="res-description">Description</label>
            <textarea
              id="res-description"
              name="description"
              rows={3}
              className="agency-input agency-textarea"
              placeholder="Décrivez la résidence..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="agency-field-group">
            <label htmlFor="res-address">Adresse *</label>
            <input
              id="res-address"
              name="address"
              type="text"
              required
              className="agency-input"
              placeholder="Rue, numéro, quartier"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <div className="agency-field-group">
            <label htmlFor="res-city">Ville *</label>
            <input
              id="res-city"
              name="city"
              type="text"
              required
              className="agency-input"
              placeholder="Ex : Casablanca"
              value={formData.city}
              onChange={handleChange}
            />
          </div>

          <div className="agency-form-row-2">
            <div className="agency-field-group">
              <label htmlFor="res-lat">Latitude</label>
              <input
                id="res-lat"
                name="latitude"
                type="number"
                step="any"
                className="agency-input"
                placeholder="33.5731"
                value={formData.latitude}
                onChange={handleChange}
              />
            </div>
            <div className="agency-field-group">
              <label htmlFor="res-lng">Longitude</label>
              <input
                id="res-lng"
                name="longitude"
                type="number"
                step="any"
                className="agency-input"
                placeholder="-7.5898"
                value={formData.longitude}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="agency-modal-actions">
            <button type="button" className="agency-btn-cancel" onClick={onClose} disabled={loading}>
              Annuler
            </button>
            <button type="submit" className="agency-btn-submit" disabled={loading}>
              {loading ? 'Création...' : 'Créer la résidence'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResidenceFormModal;
