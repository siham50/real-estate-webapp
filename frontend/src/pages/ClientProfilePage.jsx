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
  const [cinDocUrl, setCinDocUrl] = useState('');

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

  const handleVerifyCin = async (e) => {
    e.preventDefault();
    if (!cinDocUrl.trim()) return;

    setUploadingCin(true);
    setMessage({ type: '', text: '' });

    try {
      const updated = await verifyIdentity(user.id, cinDocUrl.trim());
      updateUserState(updated);
      setCinDocUrl('');
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

                {user?.isIdentityVerified !== true && (
                  <form onSubmit={handleVerifyCin} className="cin-upload-form">
                    <div className="form-group">
                      <label>Lien / URL du document CIN</label>
                      <input
                        type="url"
                        placeholder="https://exemple.com/ma-cin.pdf"
                        className="input-field"
                        value={cinDocUrl}
                        onChange={(e) => setCinDocUrl(e.target.value)}
                        required
                      />
                    </div>
                    <button type="submit" disabled={uploadingCin} className="btn-urbanet-secondary">
                      {uploadingCin ? 'Envoi...' : 'Transmettre pour vérification'}
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
