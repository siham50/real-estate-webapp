import React, { useState } from 'react';
import { createProperty, uploadFile, uploadCin } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LocationPicker from './shared/LocationPicker';

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
  const [selectedImages, setSelectedImages] = useState([]);

  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [error, setError] = useState('');

  const isClient = user?.role === 'CLIENT';
  const isCinVerified = user?.isIdentityVerified === true;
  const hasExistingCin = Boolean(user?.identityDocumentUrl);

  const handleImagesChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedImages((prev) => {
        const hadAny = prev.length > 0;
        const newItems = filesArray.map((file, i) => ({
          file,
          preview: URL.createObjectURL(file),
          isPrimary: !hadAny && i === 0,
        }));
        const combined = [...prev, ...newItems];
        if (combined.length > 0 && !combined.some((img) => img.isPrimary)) {
          combined[0].isPrimary = true;
        }
        return combined;
      });
    }
  };

  const handleSetPrimary = (targetIndex) => {
    setSelectedImages((prev) =>
      prev.map((item, idx) => ({
        ...item,
        isPrimary: idx === targetIndex,
      }))
    );
  };

  const handleRemoveImage = (index) => {
    setSelectedImages((prev) => {
      URL.revokeObjectURL(prev[index]?.preview);
      const next = prev.filter((_, i) => i !== index);
      if (next.length > 0 && !next.some((item) => item.isPrimary)) {
        next[0] = { ...next[0], isPrimary: true };
      }
      return next;
    });
  };

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

      // 3. Upload séquentiel des photos du bien avec for...of
      if (selectedImages.length > 0) {
        let index = 1;
        for (const item of selectedImages) {
          setStatusText(`Upload de l'image ${index}/${selectedImages.length}...`);
          const res = await uploadFile(item.file);
          const cleanUrl = typeof res === 'string' ? res : (res?.url || res?.fileUrl || res?.imageUrl || '');
          item.url = cleanUrl;
          index++;
        }
      }

      // S'assurer qu'au moins une image est définie comme principale
      if (selectedImages.length > 0 && !selectedImages.some((img) => img.isPrimary === true)) {
        selectedImages[0].isPrimary = true;
      }

      const formattedImages = selectedImages
        .filter((img) => img.url)
        .map((img, index) => ({
          imageUrl: img.url, // L'URL retournée par l'upload
          isPrimary: img.isPrimary === true, // S'assurer que c'est bien un booléen
        }));

      // 4. Envoi de la requête de création avec documentUrl et images au format JSON
      setStatusText('Création du bien en cours...');
      const cleanDocUrl = typeof propertyDocUrl === 'string'
        ? propertyDocUrl
        : (propertyDocUrl?.url || propertyDocUrl?.fileUrl || null);

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: formData.type,
        purpose: formData.purpose,
        price: parseFloat(formData.price),
        surfaceArea: parseFloat(formData.surfaceArea),
        address: formData.address.trim(),
        city: formData.city.trim(),
        latitude:
          formData.latitude !== '' && formData.latitude !== null && !isNaN(Number(formData.latitude))
            ? parseFloat(formData.latitude)
            : 33.5731,
        longitude:
          formData.longitude !== '' && formData.longitude !== null && !isNaN(Number(formData.longitude))
            ? parseFloat(formData.longitude)
            : -7.5898,
        owner: user?.id ? { id: user.id } : null,
        residence: formData.residenceId ? { id: parseInt(formData.residenceId, 10) } : null,
        documentUrl: cleanDocUrl,
        images: formattedImages,
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

      {loading && statusText && (
        <div className="agency-notice-banner agency-notice-info" style={{ background: '#eff6ff', borderColor: '#bfdbfe', color: '#1d4ed8', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }} role="status">
          <span className="agency-spinner-sm" style={{ borderTopColor: '#1d4ed8' }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>Traitement en cours</div>
            <div style={{ fontSize: '0.82rem' }}>{statusText}</div>
          </div>
        </div>
      )}

      {error && (
        <div className="agency-notice-banner agency-notice-warning" role="alert">
          <span className="agency-notice-icon">⚠️</span>
          <div className="agency-notice-content">
            <div className="agency-notice-title">Notice de publication</div>
            <div className="agency-notice-text">{error}</div>
          </div>
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

        <LocationPicker
          address={formData.address}
          setAddress={(val) => setFormData((prev) => ({ ...prev, address: val }))}
          latitude={formData.latitude}
          setLatitude={(val) => setFormData((prev) => ({ ...prev, latitude: val }))}
          longitude={formData.longitude}
          setLongitude={(val) => setFormData((prev) => ({ ...prev, longitude: val }))}
        />

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

        {/* Photos du bien */}
        <div className="agency-field-group">
          <label htmlFor="property-images">Photos du bien immobilier</label>
          <input
            id="property-images"
            type="file"
            multiple
            accept="image/*"
            className="agency-input"
            onChange={handleImagesChange}
          />
          <small style={{ display: 'block', marginTop: '4px', color: '#6b7280', fontSize: '0.82rem' }}>
            Sélectionnez une ou plusieurs photos (JPG, PNG, WebP). Cliquez sur l'étoile ⭐ pour choisir l'image principale de votre annonce.
          </small>

          {selectedImages.length > 0 && (
            <div className="image-preview-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '12px', marginTop: '12px' }}>
              {selectedImages.map((item, idx) => {
                const isPrimary = Boolean(item.isPrimary);
                return (
                  <div
                    key={idx}
                    className={`image-preview-card ${isPrimary ? 'is-primary' : ''}`}
                    style={{
                      position: 'relative',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: isPrimary ? '2px solid #eab308' : '1px solid #e2e8f0',
                      boxShadow: isPrimary ? '0 0 0 2px rgba(234, 179, 8, 0.3)' : 'none',
                      aspectRatio: '4/3',
                    }}
                  >
                    <img
                      src={item.preview}
                      alt={`Aperçu ${idx + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                    {/* Bouton sélection Image principale */}
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(idx)}
                      style={{
                        position: 'absolute',
                        top: '5px',
                        left: '5px',
                        background: isPrimary ? '#eab308' : 'rgba(0, 0, 0, 0.65)',
                        color: isPrimary ? '#000' : '#fff',
                        border: 'none',
                        borderRadius: '14px',
                        padding: '2px 7px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                        fontSize: '11px',
                        fontWeight: 600,
                        zIndex: 2,
                        transition: 'all 0.15s ease',
                      }}
                      title={isPrimary ? 'Image principale' : 'Définir comme image principale'}
                    >
                      <span>⭐</span>
                      <span>{isPrimary ? 'Principale' : 'Choisir'}</span>
                    </button>
                    {/* Bouton supprimer */}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      style={{
                        position: 'absolute',
                        top: '5px',
                        right: '5px',
                        background: 'rgba(0, 0, 0, 0.65)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '50%',
                        width: '22px',
                        height: '22px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '13px',
                        lineHeight: 1,
                        zIndex: 2,
                      }}
                      title="Supprimer cette photo"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          )}
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
      <div className="agency-modal-overlay">
        {formContent}
      </div>
    );
  }

  return formContent;
};

export default PropertyForm;
