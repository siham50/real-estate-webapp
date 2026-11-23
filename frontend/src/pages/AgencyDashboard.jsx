import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getResidencesByOwner, getPropertiesByOwner } from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AgencyResidenceList from '../components/AgencyResidenceList';
import AgencyPropertyList from '../components/AgencyPropertyList';
import AgencyBookings from '../components/agency/AgencyBookings';
import AgencyAvailabilities from '../components/agency/AgencyAvailabilities';
import ResidenceFormModal from '../components/ResidenceFormModal';
import PropertyFormModal from '../components/PropertyFormModal';
import PropertyReviewsModal from '../components/property/PropertyReviewsModal';

const AgencyDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState('properties'); // 'properties', 'residences', 'bookings', 'availabilities'
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

  // Gestion des paramètres URL (ex: ouvrir directement la création de bien)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('newProperty') === 'true') {
      setActiveTab('properties');
      setShowPropertyModal(true);
    } else if (params.get('tab') === 'properties') {
      setActiveTab('properties');
    }
  }, [location.search]);

  const fetchResidences = useCallback(async () => {
    if (!user?.id) return;
    setLoadingRes(true);
    setFetchError('');
    try {
      const data = await getResidencesByOwner(user.id);
      setResidences(data);
    } catch (err) {
      setFetchError(err.message || 'Erreur lors du chargement des résidences.');
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
      setProperties(data);
    } catch (err) {
      setFetchError(err.message || 'Erreur lors du chargement des biens.');
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
  const isLoading = (activeTab === 'residences' && loadingRes) || (activeTab === 'properties' && loadingProps);

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
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <div>
                <h1 className="agency-dashboard-title">Espace Agence</h1>
                <p className="agency-dashboard-subtitle">
                  Bienvenue, <strong>{user?.firstName}</strong> — gérez vos résidences, biens, disponibilités et demandes de visites.
                </p>
              </div>
            </div>

            {/* Stats rapides (calculées dynamiquement, même design que l'espace client) */}
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

          {/* Error Banner */}
          {fetchError && (
            <div className="agency-alert-error" style={{ marginBottom: '16px' }}>{fetchError}</div>
          )}

          {/* Tabs + Add Buttons (même disposition que l'espace client) */}
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
                className={`agency-tab ${activeTab === 'bookings' ? 'active' : ''}`}
                onClick={() => setActiveTab('bookings')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                Demandes de visites
              </button>

              <button
                type="button"
                className={`agency-tab ${activeTab === 'availabilities' ? 'active' : ''}`}
                onClick={() => setActiveTab('availabilities')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Mes disponibilités
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                type="button"
                className="agency-btn-add"
                onClick={() => setShowPropertyModal(true)}
                title="Ajouter un nouveau bien"
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
                onClick={() => setShowResidenceModal(true)}
                title="Ajouter une nouvelle résidence"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Ajouter une résidence
              </button>
            </div>
          </div>

          {/* Content Panel */}
          <div className="agency-content-panel">
            {isLoading ? (
              <div className="agency-loading-state">
                <div className="agency-spinner" />
                <p>Chargement en cours...</p>
              </div>
            ) : (
              <>
                {activeTab === 'properties' && (
                  <div>
                    <h3 className="table-title">Biens Immobiliers ({propertiesCount})</h3>
                    <AgencyPropertyList
                      properties={properties}
                      onDeleted={handlePropertyDeleted}
                      onEdit={(prop) => setEditingProperty(prop)}
                      onViewReviews={(prop) => setSelectedPropertyForReviews(prop)}
                    />
                  </div>
                )}
                {activeTab === 'residences' && (
                  <div>
                    <h3 className="table-title">Résidences ({residencesCount})</h3>
                    <AgencyResidenceList
                      residences={residences}
                      onDeleted={handleResidenceDeleted}
                      onEdit={(res) => setEditingResidence(res)}
                    />
                  </div>
                )}
                {activeTab === 'bookings' && <AgencyBookings />}
                {activeTab === 'availabilities' && <AgencyAvailabilities />}
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

export default AgencyDashboard;
