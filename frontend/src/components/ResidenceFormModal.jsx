import React, { useState } from 'react';
import { createResidence, updateResidence, uploadFile } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../utils/imageUtils';
import LocationPicker from './shared/LocationPicker';

const EMPTY_FORM = {
  name: '',
  description: '',
  address: '',
  city: '',
  latitude: '',
  longitude: '',
};

const ResidenceFormModal = ({ onClose, onCreated, onUpdated, residenceToEdit = null }) => {
  const { user } = useAuth();
  const isEditing = Boolean(residenceToEdit && residenceToEdit.id);

  const userRole = String(user?.role || '').toUpperCase();
  const isAgency =
    userRole === 'PROFESSIONAL' ||
    userRole === 'AGENCE' ||
    userRole === 'AGENCY' ||
    userRole.includes('PRO') ||
    userRole.includes('AGENC') ||
    Boolean(user?.companyName);
  const isClient = user?.role === 'CLIENT' || (!isAgency && Boolean(user?.id));

  const [formData, setFormData] = useState(() => {
    if (residenceToEdit) {
      return {
        name: residenceToEdit.name || '',
        description: residenceToEdit.description || '',
        address: residenceToEdit.address || '',
        city: residenceToEdit.city || '',
        latitude: residenceToEdit.latitude || '',
        longitude: residenceToEdit.longitude || '',
      };
    }
    return EMPTY_FORM;
  });

  const [selectedImages, setSelectedImages] = useState(() => {
    if (residenceToEdit?.images && residenceToEdit.images.length > 0) {
      return residenceToEdit.images.map((img) => ({
        url: img.imageUrl,
        preview: getImageUrl(img.imageUrl),
        isPrimary: Boolean(img.isPrimary || img.primary),
      }));
    }
    return [];
  });

  const [selectedDocuments, setSelectedDocuments] = useState(() => {
    if (residenceToEdit?.documents && residenceToEdit.documents.length > 0) {
      return residenceToEdit.documents.map((doc, idx) => {
        const url = typeof doc === 'string' ? doc : doc.documentUrl;
        return {
          existingUrl: url,
          name: `Document ${idx + 1}`,
          size: '-',
          isPdf: url.toLowerCase().includes('.pdf'),
          preview: !url.toLowerCase().includes('.pdf') ? getImageUrl(url) : null,
        };
      });
    }
    return [];
  });

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

  const handleSetPrimary = (indexToSelect) => {
    const updatedImages = selectedImages.map((img, index) => ({
      ...img,
      // Force true SEULEMENT pour l'image cliquée, force false pour toutes les autres
      isPrimary: index === indexToSelect,
    }));
    setSelectedImages(updatedImages);
  };

  const handleRemoveImage = (index) => {
    setSelectedImages((prev) => {
      if (prev[index]?.file && prev[index]?.preview) {
        URL.revokeObjectURL(prev[index].preview);
      }
      const next = prev.filter((_, i) => i !== index);
      if (next.length > 0 && !next.some((item) => item.isPrimary)) {
        next[0] = { ...next[0], isPrimary: true };
      }
      return next;
    });
  };

  const handleDocumentsChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const newDocs = filesArray.map((file) => ({
        file,
        name: file.name,
        size: (file.size / 1024).toFixed(1),
        isPdf: file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'),
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      }));
      setSelectedDocuments((prev) => [...prev, ...newDocs]);
    }
  };

  const handleRemoveDocument = (index) => {
    setSelectedDocuments((prev) => {
      if (prev[index]?.preview && prev[index]?.file) {
        URL.revokeObjectURL(prev[index].preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Document de propriété obligatoire pour les clients uniquement
    if (!isEditing && isClient && selectedDocuments.length === 0) {
      setError('Au moins un document de propriété (Titre Foncier / Acte) est obligatoire.');
      return;
    }

    setLoading(true);

    try {
      // 1. Upload des nouveaux documents de propriété si client
      const uploadedDocUrls = [];
      if (isClient && selectedDocuments.length > 0) {
        setStatusText('Traitement des documents de propriété...');
        let docIndex = 1;
        for (const docItem of selectedDocuments) {
          if (docItem.file) {
            setStatusText(`Upload du document ${docIndex}/${selectedDocuments.length}...`);
            const docRes = await uploadFile(docItem.file);
            const cleanUrl = typeof docRes === 'string' ? docRes : (docRes?.url || docRes?.fileUrl || '');
            if (cleanUrl) {
              uploadedDocUrls.push(cleanUrl);
            }
          } else if (docItem.existingUrl) {
            uploadedDocUrls.push(docItem.existingUrl);
          }
          docIndex++;
        }
      }

      // 2. Upload des nouvelles photos de la résidence
      if (selectedImages.length > 0) {
        let index = 1;
        for (const item of selectedImages) {
          if (item.file) {
            setStatusText(`Upload de l'image ${index}/${selectedImages.length}...`);
            const res = await uploadFile(item.file);
            const cleanUrl = typeof res === 'string' ? res : (res?.url || res?.fileUrl || res?.imageUrl || '');
            item.url = cleanUrl;
          }
          index++;
        }
      }

      if (selectedImages.length > 0 && !selectedImages.some((img) => img.isPrimary === true)) {
        selectedImages[0].isPrimary = true;
      }

      // 3. Construction du payload
      setStatusText(isEditing ? 'Mise à jour de la résidence...' : 'Création de la résidence...');
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
        owner: user?.id ? { id: user.id } : null,
        documentUrl: uploadedDocUrls[0] || null,
        documents: uploadedDocUrls.map((url) => ({ documentUrl: url })),
        images: selectedImages
          .filter((img) => img.url)
          .map((img) => ({
            imageUrl: img.url,
            isPrimary: img.isPrimary === true,
          })),
        isAvailable: true,
        isDeleted: false,
      };

      if (isEditing) {
        const updated = await updateResidence(residenceToEdit.id, payload);
        if (onUpdated) {
          onUpdated(updated);
        } else if (onCreated) {
          onCreated(updated);
        }
      } else {
        payload.verificationStatus = isAgency ? 'VERIFIED' : 'PENDING';
        payload.isAvailable = isAgency;
        const created = await createResidence(payload);
        if (onCreated) {
          onCreated(created);
        }
      }

      if (onClose) {
        onClose();
      }
    } catch (err) {
      setError(err.message || (isEditing ? 'Erreur lors de la modification de la résidence.' : 'Erreur lors de la création de la résidence.'));
    } finally {
      setLoading(false);
      setStatusText('');
    }
  };

  return (
    <div className="agency-modal-overlay">
      <div className="agency-modal-card agency-modal-card-wide" onClick={(e) => e.stopPropagation()}>
        <div className="agency-modal-header">
          <h2 className="agency-modal-title">{isEditing ? 'Modifier la résidence' : 'Nouvelle résidence'}</h2>
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

        <form onSubmit={handleSubmit} className="agency-modal-form">
          <div className="agency-field-group">
            <label htmlFor="residence-name">Nom de la résidence *</label>
            <input
              id="residence-name"
              name="name"
              type="text"
              required
              className="agency-input"
              placeholder="Ex : Résidence Les Jardins d'Anfa"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="agency-field-group">
            <label htmlFor="residence-desc">Description</label>
            <textarea
              id="residence-desc"
              name="description"
              rows={3}
              className="agency-input agency-textarea"
              placeholder="Décrivez la résidence (équipements, sécurité, finitions, standing...)..."
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
            <label htmlFor="residence-city">Ville *</label>
            <input
              id="residence-city"
              name="city"
              type="text"
              required
              className="agency-input"
              placeholder="Ex : Casablanca"
              value={formData.city}
              onChange={handleChange}
            />
          </div>

          {/* Photos de la résidence (même style et grille que le formulaire des biens) */}
          <div className="agency-field-group">
            <label htmlFor="residence-images">Photos de la résidence</label>
            <input
              id="residence-images"
              type="file"
              multiple
              accept="image/*"
              className="agency-input"
              onChange={handleImagesChange}
            />
            <small style={{ display: 'block', marginTop: '4px', color: '#6b7280', fontSize: '0.82rem' }}>
              Sélectionnez une ou plusieurs photos (JPG, PNG, WebP). Cliquez sur l'étoile ⭐ pour choisir l'image principale de votre résidence.
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

          {/* 1. Titre Foncier / Documents de propriété (Multi-documents) - Réservé aux clients uniquement */}
          {isClient && (
            <div className="agency-field-group">
              <label htmlFor="residence-docs">
                Documents de propriété / Titre foncier <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                id="residence-docs"
                name="residenceDocs"
                type="file"
                multiple
                accept=".pdf,image/*"
                className="agency-input"
                onChange={handleDocumentsChange}
              />
              <small style={{ display: 'block', marginTop: '4px', color: '#6b7280', fontSize: '0.82rem' }}>
                Formats autorisés : PDF, JPG, PNG (max. 10 Mo par document). Vous pouvez joindre plusieurs documents justificatifs.
              </small>

              {/* Liste et aperçus des documents sélectionnés */}
              {selectedDocuments.length > 0 && (
                <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedDocuments.map((doc, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        background: '#f8fafc',
                        gap: '10px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                        {doc.isPdf ? (
                          <span style={{ fontSize: '22px' }}>📕</span>
                        ) : doc.preview ? (
                          <img
                            src={doc.preview}
                            alt={doc.name}
                            style={{ width: '38px', height: '38px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                          />
                        ) : (
                          <span style={{ fontSize: '22px' }}>📄</span>
                        )}
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#1e293b' }}>
                            {doc.name}
                          </div>
                          <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                            {doc.size} Ko
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveDocument(idx)}
                        style={{
                          background: '#fee2e2',
                          color: '#b91c1c',
                          border: '1px solid #fca5a5',
                          borderRadius: '6px',
                          padding: '4px 10px',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          flexShrink: 0,
                        }}
                        title="Supprimer ce document"
                      >
                        Supprimer
                      </button>
                    </div>
                  ))}
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
              {loading ? (statusText || 'Envoi en cours...') : isEditing ? 'Enregistrer les modifications' : 'Créer la résidence'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResidenceFormModal;
