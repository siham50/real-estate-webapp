import React, { useState } from 'react';
import { createProperty, uploadFile, uploadCin } from '../services/api';
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

const PropertyForm = ({ onClose, onCreated, residences, isModal = false }) => {
  const { user, updateUserState } = useAuth();
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [propertyDocFile, setPropertyDocFile] = useState(null);
  const [cinFile, setCinFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [error, setError] = useState('');

  const isClient = user?.role === 'CLIENT';
  const isCinVerified = user?.isIdentityVerified === true;
  const hasExistingCin = Boolean(user?.identityDocumentUrl);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Le document de propriété est obligatoire pour les clients, pas pour les agences
    if (isClient && !propertyDocFile) {
      setError('Le document de propriété (Titre Foncier / Acte) est obligatoire.');
      return;
    }

    if (isClient && !isCinVerified && !hasExistingCin && !cinFile) {
      setError("Veuillez sélectionner votre CIN. Votre identité doit être vérifiée avant de publier.");
      return;
    }

    setLoading(true);

    try {
      // 1. Upload du fichier de propriété (si fourni)
      let propertyDocUrl = null;
      if (propertyDocFile) {
        setStatusText('Upload du document de propriété en cours...');
        propertyDocUrl = await uploadFile(propertyDocFile);
      }

      // 2. (Si nécessaire) Upload de la CIN et mise à jour du profil utilisateur
      if (isClient && !isCinVerified && cinFile) {
        setStatusText('Upload de la CIN en cours...');
        const cinUrl = await uploadFile(cinFile);
        const updatedUser = await uploadCin(user.id, cinUrl);
        updateUserState(updatedUser);
      }

      // 3. Envoi de la requête de création avec documentUrl
      setStatusText('Création du bien en cours...');
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
        owner: { id: user?.id },
        residence: formData.residenceId ? { id: parseInt(formData.residenceId, 10) } : null,
        documentUrl: propertyDocUrl,
        isAvailable: true,
        isDeleted: false,
      };

      const created = await createProperty(payload);
      if (onCreated) {
        onCreated(created);
      }
      if (onClose) {
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Erreur lors de la création du bien.');
    } finally {
      setLoading(false);
      setStatusText('');
    }
  };

  const formContent = (
    <div className="agency-modal-card agency-modal-card-wide" onClick={(e) => e.stopPropagation()}>
      <div className="agency-modal-header">
        <h2 className="agency-modal-title">Nouveau bien immobilier</h2>
        {onClose && (
          <button type="button" className="agency-modal-close" onClick={onClose} aria-label="Fermer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {error && (
        <div className="agency-alert-error" style={{ marginBottom: '16px' }}>
          <strong>Erreur : </strong> {error}
        </div>
      )}

      {/* Avertissement CIN si client non vérifié */}
      {isClient && !isCinVerified && (
        <div
          style={{
            marginBottom: '16px',
            padding: '14px 16px',
            background: '#fffbeb',
            border: '1px solid #fef3c7',
            borderRadius: '8px',
            color: '#92400e',
            fontSize: '0.88rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '1.2rem' }}>⚠️</span>
            <strong>Vérification d'identité requise</strong>
          </div>
          <p style={{ margin: 0 }}>
            {hasExistingCin
              ? "Votre CIN est actuellement en cours de validation par un administrateur. Vous devez attendre sa validation avant que votre bien ne soit publié, ou vous pouvez transmettre un nouveau document ci-dessous."
              : "Vous devez faire vérifier votre CIN avant de publier une annonce. Veuillez joindre votre CIN ci-dessous afin qu'elle soit soumise pour validation."}
          </p>
        </div>
      )}

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

        {/* 1. Titre Foncier / Documents de propriété (OBLIGATOIRE POUR CLIENT UNIQUEMENT, PAS POUR LES AGENCES) */}
        {isClient && (
          <div className="agency-field-group">
            <label htmlFor="property-doc">
              Titre Foncier / Documents de propriété (obligatoire) *
            </label>
            <input
              id="property-doc"
              name="propertyDoc"
              type="file"
              required
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="agency-input"
              onChange={(e) => setPropertyDocFile(e.target.files[0] || null)}
            />
            <small style={{ display: 'block', marginTop: '4px', color: '#6b7280', fontSize: '0.82rem' }}>
              Formats autorisés : PDF, JPG, PNG (max. 10 Mo). Ce document servira à la validation légale de l'annonce.
            </small>
            {propertyDocFile && (
              <div style={{ marginTop: '6px', fontSize: '0.85rem', color: '#166534', fontWeight: 500 }}>
                ✓ Fichier sélectionné : {propertyDocFile.name} ({(propertyDocFile.size / 1024).toFixed(1)} Ko)
              </div>
            )}
          </div>
        )}

        {/* 2. Document CIN si le client n'est pas vérifié */}
        {isClient && !isCinVerified && (
          <div className="agency-field-group" style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
            <label htmlFor="cin-doc">
              {hasExistingCin
                ? "Mettre à jour votre CIN (optionnel si déjà transmis)"
                : "Votre CIN (Carte d'Identité Nationale) *"}
            </label>
            <input
              id="cin-doc"
              name="cinDoc"
              type="file"
              required={!hasExistingCin}
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="agency-input"
              onChange={(e) => setCinFile(e.target.files[0] || null)}
            />
            <small style={{ display: 'block', marginTop: '4px', color: '#6b7280', fontSize: '0.82rem' }}>
              Formats autorisés : PDF, JPG, PNG. La vérification est effectuée par un administrateur.
            </small>
            {cinFile && (
              <div style={{ marginTop: '6px', fontSize: '0.85rem', color: '#166534', fontWeight: 500 }}>
                ✓ Document CIN sélectionné : {cinFile.name}
              </div>
            )}
          </div>
        )}

        <div className="agency-modal-actions">
          {onClose && (
            <button type="button" className="agency-btn-cancel" onClick={onClose} disabled={loading}>
              Annuler
            </button>
          )}
          <button type="submit" className="agency-btn-submit" disabled={loading}>
            {loading ? (statusText || 'Envoi en cours...') : 'Créer le bien'}
          </button>
        </div>
      </form>
    </div>
  );

  if (onClose || isModal) {
    return (
      <div className="agency-modal-overlay" onClick={onClose}>
        {formContent}
      </div>
    );
  }

  return formContent;
};

export default PropertyForm;
