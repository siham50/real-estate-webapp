import React, { useState } from 'react';
import { createResidence, uploadFile } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LocationPicker from './shared/LocationPicker';

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
  const [selectedImages, setSelectedImages] = useState([]);

  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [error, setError] = useState('');

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
    setLoading(true);

    try {
      // 1. Upload séquentiel des photos de la résidence avec for...of
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

      if (selectedImages.length > 0 && !selectedImages.some((img) => img.isPrimary === true)) {
        selectedImages[0].isPrimary = true;
      }

      const formattedImages = selectedImages
        .filter((img) => img.url)
        .map((img, index) => ({
          imageUrl: img.url, // L'URL retournée par l'upload
          isPrimary: img.isPrimary === true, // S'assurer que c'est bien un booléen
        }));

      // 2. Création de la résidence avec verificationStatus: VERIFIED par défaut
      setStatusText('Création de la résidence...');
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
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
        owner: { id: user.id },
        verificationStatus: 'VERIFIED',
        images: formattedImages,
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
      setStatusText('');
    }
  };

  return (
    <div className="agency-modal-overlay">
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

          <LocationPicker
            address={formData.address}
            setAddress={(val) => setFormData((prev) => ({ ...prev, address: val }))}
            latitude={formData.latitude}
            setLatitude={(val) => setFormData((prev) => ({ ...prev, latitude: val }))}
            longitude={formData.longitude}
            setLongitude={(val) => setFormData((prev) => ({ ...prev, longitude: val }))}
          />

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

          {/* Upload et sélection de l'image principale pour la résidence */}
          <div className="agency-field-group">
            <label htmlFor="res-images">Photos de la résidence</label>
            <input
              id="res-images"
              type="file"
              multiple
              accept="image/*"
              className="agency-input"
              onChange={handleImagesChange}
            />
            <small style={{ display: 'block', marginTop: '4px', color: '#6b7280', fontSize: '0.82rem' }}>
              Sélectionnez une ou plusieurs photos (JPG, PNG, WebP). Cliquez sur l'étoile ⭐ pour définir l'image principale.
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

          <div className="agency-modal-actions">
            <button type="button" className="agency-btn-cancel" onClick={onClose} disabled={loading}>
              Annuler
            </button>
            <button type="submit" className="agency-btn-submit" disabled={loading}>
              {loading ? (statusText || 'Création...') : 'Créer la résidence'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResidenceFormModal;
