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
import PropertyReviewsModal from '../components/property/PropertyReviewsModal';

// Alias pour PropertyList et ResidenceList
const PropertyList = AgencyPropertyList;
const ResidenceList = AgencyResidenceList;

const ClientDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Onglet actif : 'properties' ou 'residences'
  const [activeTab, setActiveTab] = useState('properties');
  const [residences, setResidences] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loadingRes, setLoadingRes] = useState(true);
  const [loadingProps, setLoadingProps] = useState(true);
  const [showResidenceModal, setShowResidenceModal] = useState(false);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [editingResidence, setEditingResidence] = useState(null);
  const [selectedPropertyForReviews, setSelectedPropertyForReviews] = useState(null);
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
      if (tabParam === 'properties' || tabParam === 'residences') {
        setActiveTab(tabParam);
      }
    }
  }, [location.search, isIdentityVerified]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      setLoadingProps(true);
      setLoadingRes(true);
      try {
        const propsRes = await getPropertiesByOwner(user.id);
        const resRes = await getResidencesByOwner(user.id);
        setProperties(propsRes.data || (Array.isArray(propsRes) ? propsRes : []));
        setResidences(resRes.data || (Array.isArray(resRes) ? resRes : []));
      } catch (error) {
        console.error(error);
        setFetchError(error.message || 'Erreur lors du chargement de vos annonces.');
      } finally {
        setLoadingProps(false);
        setLoadingRes(false);
      }
    };
    fetchData();
  }, [user?.id]);

  const handleResidenceCreated = (newResidence) => {
    setResidences((prev) => [newResidence, ...prev]);
  };

  const handlePropertyCreated = (newProperty) => {
    setProperties((prev) => [newProperty, ...prev]);
  };

  const handleResidenceUpdated = (updatedResidence) => {
    setResidences((prev) => prev.map((r) => (r.id === updatedResidence.id ? updatedResidence : r)));
    setEditingResidence(null);
  };

  const handlePropertyUpdated = (updatedProperty) => {
    setProperties((prev) => prev.map((p) => (p.id === updatedProperty.id ? updatedProperty : p)));
    setEditingProperty(null);
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
                className={`agency-stat-pill ${activeTab === 'properties' ? 'active-stat' : ''}`}
                onClick={() => setActiveTab('properties')}
                style={{
                  cursor: 'pointer',
                  border: activeTab === 'properties' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                  transition: 'all 0.2s ease',
                }}
                title="Afficher mes biens"
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
            </div>

            {/* Boutons d'action et d'ajout */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
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
                {activeTab === 'properties' && (
                  <div>
                    <h3 className="table-title">Biens Immobiliers ({properties.length})</h3>
                    <PropertyList
                      properties={properties}
                      onDeleted={handlePropertyDeleted}
                      onEdit={(prop) => setEditingProperty(prop)}
                      onViewReviews={(prop) => setSelectedPropertyForReviews(prop)}
                    />
                  </div>
                )}

                {activeTab === 'residences' && (
                  <div>
                    <h3 className="table-title">Résidences ({residences.length})</h3>
                    <ResidenceList
                      residences={residences}
                      onDeleted={handleResidenceDeleted}
                      onEdit={(res) => setEditingResidence(res)}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />

      {/* Modals de création et d'édition */}
      {showResidenceModal && (
        <ResidenceFormModal
          onClose={() => setShowResidenceModal(false)}
          onCreated={handleResidenceCreated}
        />
      )}
      {editingResidence && (
        <ResidenceFormModal
          residenceToEdit={editingResidence}
          onClose={() => setEditingResidence(null)}
          onUpdated={handleResidenceUpdated}
        />
      )}
      {showPropertyModal && (
        <PropertyFormModal
          onClose={() => setShowPropertyModal(false)}
          onCreated={handlePropertyCreated}
          residences={residences}
        />
      )}
      {editingProperty && (
        <PropertyFormModal
          propertyToEdit={editingProperty}
          onClose={() => setEditingProperty(null)}
          onUpdated={handlePropertyUpdated}
          residences={residences}
        />
      )}

      {/* Modal de consultation des avis par annonce */}
      {selectedPropertyForReviews && (
        <PropertyReviewsModal
          property={selectedPropertyForReviews}
          onClose={() => setSelectedPropertyForReviews(null)}
        />
      )}
    </div>
  );
};

export default ClientDashboard;
