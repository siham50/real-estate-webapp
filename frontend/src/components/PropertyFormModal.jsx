import React, { useState } from 'react';
import { createProperty } from '../services/api';
import { useAuth } from '../context/AuthContext';

const EMPTY_FORM = {
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
};

const PROPERTY_TYPES = [
  { value: 'HOUSE', label: 'Maison' },
  { value: 'VILLA', label: 'Villa' },
  { value: 'APARTMENT', label: 'Appartement' },
  { value: 'LAND', label: 'Terrain' },
  { value: 'COMMERCIAL', label: 'Local commercial' },
  { value: 'OFFICE', label: 'Bureau' },
];

const PROPERTY_PURPOSES = [
  { value: 'SALE', label: 'Vente' },
  { value: 'RENT', label: 'Location' },
];

const PropertyFormModal = ({ onClose, onCreated, residences }) => {
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
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: formData.type,
        purpose: formData.purpose,
        price: parseFloat(formData.price),
        surfaceArea: parseFloat(formData.surfaceArea),
        address: formData.address.trim(),
        city: formData.city.trim(),
        latitude: formData.latitude !== '' ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude !== '' ? parseFloat(formData.longitude) : null,
        owner: { id: user.id },
        residence: formData.residenceId ? { id: parseInt(formData.residenceId) } : null,
      };
      const created = await createProperty(payload);
      onCreated(created);
      onClose();
    } catch (err) {
      setError(err.message || 'Erreur lors de la création du bien.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="agency-modal-overlay" onClick={onClose}>
      <div className="agency-modal-card agency-modal-card-wide" onClick={(e) => e.stopPropagation()}>
        <div className="agency-modal-header">
          <h2 className="agency-modal-title">Nouveau bien immobilier</h2>
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
            <label htmlFor="prop-title">Titre *</label>
            <input
              id="prop-title"
              name="title"
              type="text"
              required
              className="agency-input"
              placeholder="Ex : Appartement lumineux 3 pièces"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          <div className="agency-field-group">
            <label htmlFor="prop-description">Description</label>
            <textarea
              id="prop-description"
              name="description"
              rows={3}
              className="agency-input agency-textarea"
              placeholder="Décrivez le bien..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="agency-form-row-2">
            <div className="agency-field-group">
              <label htmlFor="prop-type">Type de bien *</label>
              <select
                id="prop-type"
                name="type"
                required
                className="agency-input agency-select"
                value={formData.type}
                onChange={handleChange}
              >
                {PROPERTY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div className="agency-field-group">
              <label htmlFor="prop-purpose">Usage *</label>
              <select
                id="prop-purpose"
                name="purpose"
                required
                className="agency-input agency-select"
                value={formData.purpose}
                onChange={handleChange}
              >
                {PROPERTY_PURPOSES.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="agency-form-row-2">
            <div className="agency-field-group">
              <label htmlFor="prop-price">Prix (MAD) *</label>
              <input
                id="prop-price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                required
                className="agency-input"
                placeholder="1 200 000"
                value={formData.price}
                onChange={handleChange}
              />
            </div>
            <div className="agency-field-group">
              <label htmlFor="prop-surface">Surface (m²) *</label>
              <input
                id="prop-surface"
                name="surfaceArea"
                type="number"
                min="0"
                step="0.01"
                required
                className="agency-input"
                placeholder="85"
                value={formData.surfaceArea}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="agency-field-group">
            <label htmlFor="prop-address">Adresse *</label>
            <input
              id="prop-address"
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
            <label htmlFor="prop-city">Ville *</label>
            <input
              id="prop-city"
              name="city"
              type="text"
              required
              className="agency-input"
              placeholder="Ex : Rabat"
              value={formData.city}
              onChange={handleChange}
            />
          </div>

          <div className="agency-form-row-2">
            <div className="agency-field-group">
              <label htmlFor="prop-lat">Latitude</label>
              <input
                id="prop-lat"
                name="latitude"
                type="number"
                step="any"
                className="agency-input"
                placeholder="33.9716"
                value={formData.latitude}
                onChange={handleChange}
              />
            </div>
            <div className="agency-field-group">
              <label htmlFor="prop-lng">Longitude</label>
              <input
                id="prop-lng"
                name="longitude"
                type="number"
                step="any"
                className="agency-input"
                placeholder="-6.8498"
                value={formData.longitude}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Résidence optionnelle */}
          <div className="agency-field-group">
            <label htmlFor="prop-residence">Rattacher à une résidence (optionnel)</label>
            <select
              id="prop-residence"
              name="residenceId"
              className="agency-input agency-select"
              value={formData.residenceId}
              onChange={handleChange}
            >
              <option value="">— Aucune résidence —</option>
              {(residences || []).map((r) => (
                <option key={r.id} value={r.id}>{r.name} — {r.city}</option>
              ))}
            </select>
          </div>

          <div className="agency-modal-actions">
            <button type="button" className="agency-btn-cancel" onClick={onClose} disabled={loading}>
              Annuler
            </button>
            <button type="submit" className="agency-btn-submit" disabled={loading}>
              {loading ? 'Création...' : 'Créer le bien'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PropertyFormModal;
