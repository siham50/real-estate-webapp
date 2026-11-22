import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getResidencesByOwner, getPropertiesByOwner } from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AgencyResidenceList from '../components/AgencyResidenceList';
import AgencyPropertyList from '../components/AgencyPropertyList';
import ResidenceFormModal from '../components/ResidenceFormModal';
import PropertyFormModal from '../components/PropertyFormModal';

const ClientDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Onglet actif : 'properties' (Biens), 'residences' (Résidences), 'all' (Toutes)
  const [activeTab, setActiveTab] = useState('properties');
  const [residences, setResidences] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loadingRes, setLoadingRes] = useState(true);
  const [loadingProps, setLoadingProps] = useState(true);
  const [showResidenceModal, setShowResidenceModal] = useState(false);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [fetchError, setFetchError] = useState('');

  // Règle métier : L'identité doit être vérifiée pour publier
  const isIdentityVerified = user?.isIdentityVerified === true;

  // Gestion des paramètres URL (ex: ouvrir directement la création de bien ou un onglet)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('newProperty') === 'true' && isIdentityVerified) {
      setActiveTab('properties');
      setShowPropertyModal(true);
    } else if (params.get('tab')) {
      const tabParam = params.get('tab');
      if (tabParam === 'properties' || tabParam === 'residences' || tabParam === 'all') {
        setActiveTab(tabParam);
      }
    }
  }, [location.search, isIdentityVerified]);

  const fetchResidences = useCallback(async () => {
    if (!user?.id) return;
    setLoadingRes(true);
    setFetchError('');
    try {
      const data = await getResidencesByOwner(user.id);
      setResidences(Array.isArray(data) ? data : []);
    } catch (err) {
      setFetchError(err.message || 'Erreur lors du chargement de vos résidences.');
    } finally {
      setLoadingRes(false);
    }
  }, [user?.id]);

  const fetchProperties = useCallback(async () => {
    if (!user?.id) return;
    setLoadingProps(true);
    setFetchError('');
    try {
      const data = await getPropertiesByOwner(user.id);
      setProperties(Array.isArray(data) ? data : []);
    } catch (err) {
      setFetchError(err.message || 'Erreur lors du chargement de vos biens.');
    } finally {
      setLoadingProps(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchResidences();
    fetchProperties();
  }, [fetchResidences, fetchProperties]);

  const handleResidenceCreated = (newResidence) => {
    setResidences((prev) => [newResidence, ...prev]);
  };

  const handlePropertyCreated = (newProperty) => {
    setProperties((prev) => [newProperty, ...prev]);
  };

  const handleResidenceDeleted = (id) => {
    setResidences((prev) => prev.filter((r) => r.id !== id));
  };

  const handlePropertyDeleted = (id) => {
    setProperties((prev) => prev.filter((p) => p.id !== id));
  };

  const propertiesCount = Array.isArray(properties) ? properties.length : 0;
  const residencesCount = Array.isArray(residences) ? residences.length : 0;
  const totalAnnonces = propertiesCount + residencesCount;
  const isLoading =
    activeTab === 'properties'
      ? loadingProps
      : activeTab === 'residences'
      ? loadingRes
      : loadingProps || loadingRes;

  return (
    <div className="urbanet-app-root">
      <Header />
      <main className="urbanet-main agency-dashboard-bg">
        <div className="agency-dashboard-container">

          {/* Page Header */}
          <div className="agency-dashboard-header">
            <div className="agency-dashboard-title-group">
              <div className="agency-dashboard-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div>
                <h1 className="agency-dashboard-title">Espace Client</h1>
                <p className="agency-dashboard-subtitle">
                  Bienvenue, <strong>{user?.firstName} {user?.lastName}</strong> — gérez vos annonces immobilières et suivez leur statut de validation.
                </p>
              </div>
            </div>

            {/* Statistiques rapides (calculées dynamiquement) */}
            <div className="agency-stats-row">
              <div
                className={`agency-stat-pill ${activeTab === 'all' ? 'active-stat' : ''}`}
                onClick={() => setActiveTab('all')}
                style={{
                  cursor: 'pointer',
                  border: activeTab === 'all' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                  transition: 'all 0.2s ease',
                }}
                title="Afficher toutes les annonces"
              >
                <span className="agency-stat-num">{totalAnnonces}</span>
                <span className="agency-stat-label">Annonce{totalAnnonces > 1 ? 's' : ''}</span>
              </div>
              <div
                className={`agency-stat-pill ${activeTab === 'properties' ? 'active-stat' : ''}`}
                onClick={() => setActiveTab('properties')}
                style={{
                  cursor: 'pointer',
                  border: activeTab === 'properties' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                  transition: 'all 0.2s ease',
                }}
                title="Afficher mes biens"
              >
                <span className="agency-stat-num">{propertiesCount}</span>
                <span className="agency-stat-label">Bien{propertiesCount > 1 ? 's' : ''}</span>
              </div>
              <div
                className={`agency-stat-pill ${activeTab === 'residences' ? 'active-stat' : ''}`}
                onClick={() => setActiveTab('residences')}
                style={{
                  cursor: 'pointer',
                  border: activeTab === 'residences' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                  transition: 'all 0.2s ease',
                }}
                title="Afficher mes résidences"
              >
                <span className="agency-stat-num">{residencesCount}</span>
                <span className="agency-stat-label">Résidence{residencesCount > 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>

          {/* Bandeau de vérification CIN obligatoire si non vérifié */}
          {!isIdentityVerified && (
            <div
              className="client-verification-banner"
              style={{
                background: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: '12px',
                padding: '16px 20px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '24px' }}>⚠️</span>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', color: '#92400e', fontSize: '0.98rem', fontWeight: 600 }}>
                    Vous devez vérifier votre CIN avant de publier
                  </h4>
                  <p style={{ margin: 0, color: '#b45309', fontSize: '0.86rem' }}>
                    Conformément aux règles de sécurité, vos documents d'identité doivent être validés par notre équipe avant de publier une annonce.
                  </p>
                </div>
              </div>
              <Link
                to="/profile/client"
                className="btn-urbanet-primary"
                style={{
                  padding: '8px 16px',
                  fontSize: '0.85rem',
                  textDecoration: 'none',
                  display: 'inline-block',
                }}
              >
                Vérifier ma CIN →
              </Link>
            </div>
          )}

          {/* Error Banner */}
          {fetchError && (
            <div className="agency-alert-error" style={{ marginBottom: '16px' }}>
              {fetchError}
            </div>
          )}

          {/* Navigation par Onglets + Boutons d'ajout */}
          <div className="agency-tabs-bar">
            <div className="agency-tabs">
              <button
                type="button"
                className={`agency-tab ${activeTab === 'properties' ? 'active' : ''}`}
                onClick={() => setActiveTab('properties')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
                Mes Biens
                <span className="agency-tab-count">{propertiesCount}</span>
              </button>

              <button
                type="button"
                className={`agency-tab ${activeTab === 'residences' ? 'active' : ''}`}
                onClick={() => setActiveTab('residences')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                Mes Résidences
                <span className="agency-tab-count">{residencesCount}</span>
              </button>

              <button
                type="button"
                className={`agency-tab ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                Toutes les annonces
                <span className="agency-tab-count">{totalAnnonces}</span>
              </button>
            </div>

            {/* Boutons d'ajout (Désactivés si CIN non vérifiée) */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="agency-btn-add"
                disabled={!isIdentityVerified}
                onClick={() => setShowPropertyModal(true)}
                title={!isIdentityVerified ? 'Vous devez vérifier votre CIN avant de publier' : 'Ajouter un nouveau bien'}
                style={!isIdentityVerified ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Ajouter un bien
              </button>

              <button
                type="button"
                className="agency-btn-add"
                disabled={!isIdentityVerified}
                onClick={() => setShowResidenceModal(true)}
                title={!isIdentityVerified ? 'Vous devez vérifier votre CIN avant de publier' : 'Ajouter une nouvelle résidence'}
                style={!isIdentityVerified ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Ajouter une résidence
              </button>
            </div>
          </div>

          {/* Panneau de Contenu */}
          <div className="agency-content-panel">
            {isLoading ? (
              <div className="agency-loading-state">
                <div className="agency-spinner" />
                <p>Chargement de vos annonces...</p>
              </div>
            ) : (
              <>
                {/* Tableau des Biens (affiché si activeTab === 'properties' ou 'all') */}
                {(activeTab === 'properties' || activeTab === 'all') && (
                  <div className="client-dashboard-tab-content" style={{ marginBottom: activeTab === 'all' ? '28px' : '0' }}>
                    {activeTab === 'all' && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>
                          Mes Biens ({propertiesCount})
                        </h3>
                      </div>
                    )}
                    <AgencyPropertyList
                      properties={properties}
                      onDeleted={handlePropertyDeleted}
                    />
                  </div>
                )}

                {/* Tableau des Résidences (affiché si activeTab === 'residences' ou 'all') */}
                {(activeTab === 'residences' || activeTab === 'all') && (
                  <div
                    className="client-dashboard-tab-content"
                    style={activeTab === 'all' ? { borderTop: '1px solid #e2e8f0', paddingTop: '20px' } : {}}
                  >
                    {activeTab === 'all' && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>
                          Mes Résidences ({residencesCount})
                        </h3>
                      </div>
                    )}
                    <AgencyResidenceList
                      residences={residences}
                      onDeleted={handleResidenceDeleted}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />

      {/* Modals de création (réutilisation des formulaires) */}
      {showResidenceModal && (
        <ResidenceFormModal
          onClose={() => setShowResidenceModal(false)}
          onCreated={handleResidenceCreated}
        />
      )}
      {showPropertyModal && (
        <PropertyFormModal
          onClose={() => setShowPropertyModal(false)}
          onCreated={handlePropertyCreated}
          residences={residences}
        />
      )}
    </div>
  );
};

export default ClientDashboard;
