import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile, verifyIdentity, getUserProfile } from '../services/api';

const ClientProfilePage = () => {
  const { user, updateUserState, logout } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [cinFile, setCinFile] = useState(null);
  const [cinFilePreview, setCinFilePreview] = useState('');
  const [cinDragOver, setCinDragOver] = useState(false);

  const [saving, setSaving] = useState(false);
  const [uploadingCin, setUploadingCin] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setPhone(user.phone || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const updated = await updateUserProfile(user.id, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
      });
      updateUserState(updated);
      setMessage({ type: 'success', text: 'Vos informations ont été mises à jour avec succès.' });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Erreur lors de la mise à jour.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCinFileChange = (file) => {
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setMessage({
        type: 'error',
        text: 'Format non supporté. Veuillez choisir une image (JPG, PNG, WEBP) ou un PDF.',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({
        type: 'error',
        text: 'Le fichier dépasse la taille maximale autorisée (5 Mo).',
      });
      return;
    }

    setCinFile(file);
    setMessage({ type: '', text: '' });

    const reader = new FileReader();
    reader.onload = () => {
      setCinFilePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleVerifyCin = async (e) => {
    e.preventDefault();
    if (!cinFile || !cinFilePreview) {
      setMessage({
        type: 'error',
        text: 'Veuillez sélectionner un fichier (image ou document) de CIN avant de transmettre.',
      });
      return;
    }

    setUploadingCin(true);
    setMessage({ type: '', text: '' });

    try {
      const updated = await verifyIdentity(user.id, cinFilePreview);
      updateUserState(updated);
      setCinFile(null);
      setCinFilePreview('');
      setMessage({
        type: 'success',
        text: 'Document CIN transmis avec succès. Vérification en attente de validation admin.',
      });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Erreur lors de l’envoi de la CIN.',
      });
    } finally {
      setUploadingCin(false);
    }
  };

  return (
    <div className="urbanet-app-root">
      <Header />
      <main className="profile-page-main">
        <div className="urbanet-container">
          {/* Welcome Banner */}
          <div className="profile-header-banner">
            <div>
              <span className="profile-role-tag">Espace Particulier</span>
              <h1 className="profile-heading">
                Bonjour, {user?.firstName} {user?.lastName}
              </h1>
              <p className="profile-subheading">{user?.email}</p>
            </div>
            <button type="button" onClick={logout} className="btn-profile-logout">
              Se déconnecter
            </button>
          </div>

          {/* Feedback alerts */}
          {message.text && (
            <div className={`auth-alert ${message.type === 'success' ? 'auth-alert-success' : 'auth-alert-error'}`}>
              {message.text}
            </div>
          )}

          {/* Grid Layout: Status & Profile Details */}
          <div className="profile-grid">
            {/* Left: Mon Profil */}
            <div className="profile-card">
              <div className="profile-card-header">
                <div className="card-icon-badge">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div>
                  <h2 className="card-section-title">Mon Profil</h2>
                  <p className="card-section-desc">Gérez vos informations personnelles</p>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="profile-form">
                <div className="form-row-2">
                  <div className="form-group">
                    <label>Prénom</label>
                    <input
                      type="text"
                      required
                      className="input-field"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Nom</label>
                    <input
                      type="text"
                      required
                      className="input-field"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Numéro de téléphone</label>
                  <input
                    type="tel"
                    required
                    className="input-field"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Adresse email (non modifiable)</label>
                  <input
                    type="email"
                    disabled
                    className="input-field input-field-disabled"
                    value={email}
                  />
                </div>

                <button type="submit" disabled={saving} className="btn-urbanet-primary">
                  {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </button>
              </form>
            </div>

            {/* Right: Mon Statut & Vérification CIN */}
            <div className="profile-card">
              <div className="profile-card-header">
                <div className="card-icon-badge">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <polyline points="9 12 11 14 15 10" />
                  </svg>
                </div>
                <div>
                  <h2 className="card-section-title">Mon Statut</h2>
                  <p className="card-section-desc">Niveau de confiance et vérification de compte</p>
                </div>
              </div>

              <div className="verification-status-box">
                <div className="status-indicator-row">
                  <span className="status-label-text">Vérification de la CIN :</span>
                  {user?.isIdentityVerified === true ? (
                    <span className="badge-status badge-verified">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Compte vérifié
                    </span>
                  ) : user?.identityDocumentUrl ? (
                    <span className="badge-status badge-pending">
                      En attente de validation
                    </span>
                  ) : (
                    <span className="badge-status badge-unverified">
                      Non vérifié
                    </span>
                  )}
                </div>

                <p className="status-help-text">
                  La vérification de votre identité est obligatoire pour publier des annonces ou réserver des visites prioritaires en toute sécurité.
                </p>

                {user?.identityDocumentUrl && (
                  <div className="current-cin-box">
                    <span className="current-cin-title">Document transmis :</span>
                    <div className="current-cin-preview-wrapper">
                      {user.identityDocumentUrl.startsWith('data:image/') || user.identityDocumentUrl.startsWith('http') ? (
                        <div className="current-cin-img-container">
                          <img
                            src={user.identityDocumentUrl}
                            alt="Aperçu CIN transmis"
                            className="current-cin-thumb"
                          />
                        </div>
                      ) : (
                        <div className="current-cin-pdf-badge">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                          <span>Fichier enregistré</span>
                        </div>
                      )}
                      <span className="current-cin-note">
                        {user?.isIdentityVerified
                          ? 'Votre document a été validé par un administrateur.'
                          : 'Document en cours d’examen par l’équipe.'}
                      </span>
                    </div>
                  </div>
                )}

                {user?.isIdentityVerified !== true && (
                  <form onSubmit={handleVerifyCin} className="cin-upload-form">
                    <div className="form-group">
                      <label>
                        {user?.identityDocumentUrl ? 'Mettre à jour ou remplacer la CIN' : 'Document CIN (photo ou scan)'}
                      </label>

                      {/* Drop Zone */}
                      <div
                        className={`cin-dropzone ${cinDragOver ? 'cin-dropzone-active' : ''} ${cinFile ? 'cin-dropzone-filled' : ''}`}
                        onClick={() => document.getElementById('cin-file-input').click()}
                        onDragOver={(e) => { e.preventDefault(); setCinDragOver(true); }}
                        onDragLeave={() => setCinDragOver(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setCinDragOver(false);
                          const file = e.dataTransfer.files[0];
                          if (file) handleCinFileChange(file);
                        }}
                      >
                        <input
                          id="cin-file-input"
                          type="file"
                          accept="image/jpeg,image/png,image/webp,application/pdf"
                          style={{ display: 'none' }}
                          onChange={(e) => handleCinFileChange(e.target.files[0])}
                        />

                        {cinFile ? (
                          /* Fichier sélectionné — prévisualisation */
                          <div className="cin-file-preview">
                            {cinFile.type.startsWith('image/') ? (
                              <img
                                src={cinFilePreview}
                                alt="Aperçu CIN"
                                className="cin-preview-img"
                              />
                            ) : (
                              <div className="cin-pdf-icon">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                  <polyline points="14 2 14 8 20 8" />
                                  <line x1="16" y1="13" x2="8" y2="13" />
                                  <line x1="16" y1="17" x2="8" y2="17" />
                                  <polyline points="10 9 9 9 8 9" />
                                </svg>
                              </div>
                            )}
                            <div className="cin-file-info">
                              <span className="cin-file-name">{cinFile.name}</span>
                              <span className="cin-file-size">{(cinFile.size / 1024).toFixed(1)} Ko</span>
                            </div>
                            <button
                              type="button"
                              className="cin-file-remove"
                              onClick={(e) => { e.stopPropagation(); setCinFile(null); setCinFilePreview(''); }}
                              title="Supprimer"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          /* Etat vide — invite à uploader */
                          <div className="cin-dropzone-placeholder">
                            <div className="cin-upload-icon">
                              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="16 16 12 12 8 16" />
                                <line x1="12" y1="12" x2="12" y2="21" />
                                <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                              </svg>
                            </div>
                            <p className="cin-dropzone-title">Glissez votre CIN ici</p>
                            <p className="cin-dropzone-hint">ou <span className="cin-browse-link">parcourir les fichiers</span></p>
                            <p className="cin-dropzone-formats">JPG, PNG, WEBP ou PDF — max. 5 Mo</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={uploadingCin || !cinFile}
                      className="btn-urbanet-secondary"
                    >
                      {uploadingCin ? 'Envoi en cours...' : 'Transmettre pour vérification'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions / Navigation Cards */}
          <div className="profile-actions-grid">
            <div className="action-card">
              <div className="action-card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <div className="action-card-content">
                <h3 className="action-card-title">Mes Annonces</h3>
                <p className="action-card-desc">
                  Consultez, publiez et gérez vos biens immobiliers mis en vente ou en location.
                </p>
                <a href="#annonces" className="action-card-link">
                  Gérer mes biens →
                </a>
              </div>
            </div>

            <div className="action-card">
              <div className="action-card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <div className="action-card-content">
                <h3 className="action-card-title">Mes Réservations</h3>
                <p className="action-card-desc">
                  Suivez vos demandes de visites programmées avec les vendeurs et agences.
                </p>
                <a href="#reservations" className="action-card-link">
                  Voir mes rendez-vous →
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ClientProfilePage;
