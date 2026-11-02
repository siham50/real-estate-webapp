import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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

const AgencyDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('residences'); // 'residences', 'properties', 'bookings', 'availabilities'
  const [residences, setResidences] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loadingRes, setLoadingRes] = useState(true);
  const [loadingProps, setLoadingProps] = useState(true);
  const [showResidenceModal, setShowResidenceModal] = useState(false);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [fetchError, setFetchError] = useState('');

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

  const handleResidenceDeleted = (id) => {
    setResidences((prev) => prev.filter((r) => r.id !== id));
  };

  const handlePropertyDeleted = (id) => {
    setProperties((prev) => prev.filter((p) => p.id !== id));
  };

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

            {/* Stats rapides */}
            <div className="agency-stats-row">
              <div className="agency-stat-pill">
                <span className="agency-stat-num">{residences.length}</span>
                <span className="agency-stat-label">Résidence{residences.length > 1 ? 's' : ''}</span>
              </div>
              <div className="agency-stat-pill">
                <span className="agency-stat-num">{properties.length}</span>
                <span className="agency-stat-label">Bien{properties.length > 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>

          {/* Error Banner */}
          {fetchError && (
            <div className="agency-alert-error" style={{ marginBottom: '16px' }}>{fetchError}</div>
          )}

          {/* Tabs + Add Button */}
          <div className="agency-tabs-bar">
            <div className="agency-tabs">
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
                <span className="agency-tab-count">{residences.length}</span>
              </button>

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
                <span className="agency-tab-count">{properties.length}</span>
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

            {(activeTab === 'residences' || activeTab === 'properties') && (
              <button
                type="button"
                className="agency-btn-add"
                onClick={() => {
                  if (activeTab === 'residences') setShowResidenceModal(true);
                  else setShowPropertyModal(true);
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                {activeTab === 'residences' ? 'Ajouter une résidence' : 'Ajouter un bien'}
              </button>
            )}
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
                {activeTab === 'residences' && (
                  <AgencyResidenceList
                    residences={residences}
                    onDeleted={handleResidenceDeleted}
                  />
                )}
                {activeTab === 'properties' && (
                  <AgencyPropertyList
                    properties={properties}
                    onDeleted={handlePropertyDeleted}
                  />
                )}
                {activeTab === 'bookings' && <AgencyBookings />}
                {activeTab === 'availabilities' && <AgencyAvailabilities />}
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />

      {/* Modals */}
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

export default AgencyDashboard;
