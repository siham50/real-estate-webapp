import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import EditProfileForm from '../components/profile/EditProfileForm';
import { useAuth } from '../context/AuthContext';

const AgencyProfilePage = () => {
  const { user, updateUserState, logout } = useAuth();

  return (
    <div className="urbanet-app-root">
      <Header />
      <main className="profile-page-main">
        <div className="urbanet-container">
          {/* Header Banner */}
          <div className="profile-header-banner">
            <div>
              <span className="profile-role-tag badge-agency-tag">Espace Professionnel</span>
              <h1 className="profile-heading">
                {user?.companyName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Mon Agence'}
              </h1>
              <p className="profile-subheading">{user?.email} • {user?.phone || 'Téléphone non renseigné'}</p>
            </div>
            <button type="button" onClick={logout} className="btn-profile-logout">
              Se déconnecter
            </button>
          </div>

          {/* Grid: Agency Form & Verification Status */}
          <div className="profile-grid">
            {/* Left: Profil Entreprise */}
            <div className="profile-card">
              <div className="profile-card-header">
                <div className="card-icon-badge">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                </div>
                <div>
                  <h2 className="card-section-title">Profil de l'entreprise</h2>
                  <p className="card-section-desc">Identité légale et coordonnées professionnelles</p>
                </div>
              </div>

              <EditProfileForm onProfileUpdated={(updated) => updateUserState(updated)} />
            </div>

            {/* Right: Statut Agence */}
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
                  <p className="card-section-desc">Homologation et accréditation Urbanet</p>
                </div>
              </div>

              <div className="verification-status-box">
                <div className="status-indicator-row">
                  <span className="status-label-text">Accréditation Agence :</span>
                  {user?.isVerified || user?.isIdentityVerified ? (
                    <span className="badge-status badge-verified">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Agence Certifiée
                    </span>
                  ) : (
                    <span className="badge-status badge-pending">
                      En cours de vérification légale
                    </span>
                  )}
                </div>

                <p className="status-help-text">
                  Les agences certifiées bénéficient du badge officiel de confiance "Agence Vérifiée", d'une mise en avant prioritaire de leurs annonces et d'un support dédié.
                </p>

                <div className="agency-perks-box">
                  <div className="perk-item">
                    <span className="perk-bullet">✓</span>
                    <span>Publication d'annonces en illimité</span>
                  </div>
                  <div className="perk-item">
                    <span className="perk-bullet">✓</span>
                    <span>Tableau de bord de performance et statistiques</span>
                  </div>
                  <div className="perk-item">
                    <span className="perk-bullet">✓</span>
                    <span>Messagerie instantanée directe avec les acheteurs</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Cards */}
          <div className="profile-actions-grid">
            <div className="action-card">
              <div className="action-card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <div className="action-card-content">
                <h3 className="action-card-title">Portefeuille d'annonces</h3>
                <p className="action-card-desc">
                  Gérez le catalogue des biens de l'agence, mettez à jour les prix et les disponibilités.
                </p>
                <a href="#annonces" className="action-card-link">
                  Gérer le portefeuille →
                </a>
              </div>
            </div>

            <div className="action-card">
              <div className="action-card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              </div>
              <div className="action-card-content">
                <h3 className="action-card-title">Statistiques & Analyse</h3>
                <p className="action-card-desc">
                  Analysez l'engagement sur vos biens, les taux de conversion et les contacts acheteurs.
                </p>
                <a href="#statistiques" className="action-card-link">
                  Consulter les métriques →
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

export default AgencyProfilePage;
