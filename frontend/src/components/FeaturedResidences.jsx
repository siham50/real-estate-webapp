import React, { useState, useEffect } from 'react';
import { getAllResidences, getAllProperties, incrementResidenceViews } from '../services/api';
import ResidenceCard from './ResidenceCard';
import { getImageUrl, DEFAULT_PLACEHOLDER_IMAGE } from '../utils/imageUtils';

const DEFAULT_RESIDENCES = [
  {
    id: 101,
    name: 'Résidences Al Manar',
    description: 'Ensemble résidentiel haut de gamme avec espaces verts paysagers, conciergerie et sécurité 24/7.',
    address: 'Boulevard Franklin Roosevelt, Anfa',
    city: 'Casablanca',
    agency: 'Résidences Al Manar',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=900&q=80',
    propertiesCount: 8,
    badge: 'Programme Neuf',
  },
  {
    id: 102,
    name: "Les Jardins de l'Atlas",
    description: 'Domaine résidentiel prestigieux offrant villas d’architecte et appartements avec vue imprenable.',
    address: "Route de l'Ourika, Km 14",
    city: 'Marrakech',
    agency: 'Atlas Immobilier',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80',
    propertiesCount: 5,
    badge: 'Luxe & Sérénité',
  },
  {
    id: 103,
    name: 'Marina Bay Waterfront',
    description: 'Complexe résidentiel contemporain en front de mer avec terrasses privatives et accès portuaire.',
    address: 'Baie de Tanger, Boulevard Maritime',
    city: 'Tanger',
    agency: 'Karim Benali',
    image: 'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?auto=format&fit=crop&w=900&q=80',
    propertiesCount: 12,
    badge: 'Front de Mer',
  },
];

const FeaturedResidences = ({ onSelectResidence }) => {
  const [residences, setResidences] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResidence, setSelectedResidence] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [resList, propList] = await Promise.all([
          getAllResidences().catch(() => []),
          getAllProperties().catch(() => []),
        ]);

        const validProps = Array.isArray(propList) ? propList.filter((p) => !p.isDeleted) : [];
        setProperties(validProps);

        if (Array.isArray(resList) && resList.length > 0) {
          const nonDeleted = resList.filter((r) => !r.isDeleted);
          if (nonDeleted.length > 0) {
            setResidences(nonDeleted);
          } else {
            setResidences(DEFAULT_RESIDENCES);
          }
        } else {
          setResidences(DEFAULT_RESIDENCES);
        }
      } catch (err) {
        setResidences(DEFAULT_RESIDENCES);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Incrémentation automatique des vues au chargement/ouverture des détails de la résidence
  useEffect(() => {
    if (selectedResidence?.id) {
      incrementResidenceViews(selectedResidence.id)
        .then((updated) => {
          if (updated && updated.views !== undefined) {
            setSelectedResidence((prev) => (prev ? { ...prev, views: updated.views } : prev));
            setResidences((prev) =>
              prev.map((r) => (r.id === selectedResidence.id ? { ...r, views: updated.views } : r))
            );
          }
        })
        .catch(() => {});
    }
  }, [selectedResidence?.id]);

  const getResidenceCount = (residenceId) => {
    return properties.filter((p) => p.residence?.id === residenceId).length;
  };

  const getAgencyName = (res) => {
    if (res.agency) return res.agency;
    if (res.owner) {
      const name = `${res.owner.firstName || ''} ${res.owner.lastName || ''}`.trim();
      return name || res.owner.email || 'Agence partenaire';
    }
    return 'Agence partenaire';
  };

  const getImage = (res) => {
    if (!res) return DEFAULT_PLACEHOLDER_IMAGE;
    let displayImage = null;
    if (res.images && res.images.length > 0) {
      // Cherche spécifiquement l'image qui a isPrimary = true
      const primaryImg = res.images.find((img) => img.isPrimary === true || img.primary === true);
      // Si elle n'existe pas (bug), prend la première par défaut
      displayImage = primaryImg ? primaryImg : res.images[0];
    }
    if (displayImage) {
      const path = typeof displayImage === 'string' ? displayImage : displayImage.imageUrl;
      return getImageUrl(path);
    }
    if (res.image) return getImageUrl(res.image);
    return DEFAULT_PLACEHOLDER_IMAGE;
  };

  return (
    <section id="residences" className="urbanet-section urbanet-residences-section">
      <div className="urbanet-container">
        {/* Section Header */}
        <div className="urbanet-section-header">
          <div className="urbanet-section-title-group">
            <span className="urbanet-section-label">PROGRAMMES NEUFS & RÉSIDENCES</span>
            <h2 className="urbanet-section-heading">Explorez les résidences de nos agences</h2>
            <p className="urbanet-section-subheading">
              Ensembles immobiliers d’exception et programmes neufs développés par nos agences partenaires.
            </p>
          </div>
          <a href="#annonces" className="urbanet-btn-view-all">
            Voir tous les biens
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="urbanet-properties-grid">
            {[1, 2, 3].map((n) => (
              <div key={n} className="urbanet-property-card property-skeleton-card">
                <div className="skeleton-img"></div>
                <div className="skeleton-body">
                  <div className="skeleton-line" style={{ width: '40%' }}></div>
                  <div className="skeleton-line" style={{ width: '80%' }}></div>
                  <div className="skeleton-line" style={{ width: '60%' }}></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Residences Grid */}
        {!loading && (
          <div className="urbanet-properties-grid urbanet-residences-grid">
            {residences.map((res) => (
              <ResidenceCard
                key={res.id}
                residence={res}
                propertiesCount={getResidenceCount(res.id)}
                onSelect={(selected) => setSelectedResidence(selected)}
              />
            ))}
          </div>
        )}

        {/* Modal Détails Résidence */}
        {selectedResidence && (
          <div className="residence-modal-overlay">
            <div className="residence-modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="residence-modal-header">
                <div>
                  <span className="residence-modal-badge">Résidence & Programme Neuf</span>
                  <h2 className="residence-modal-title">{selectedResidence.name}</h2>
                  <p className="residence-modal-location">
                    📍 {selectedResidence.address ? `${selectedResidence.address}, ` : ''}{selectedResidence.city || 'Maroc'}
                  </p>
                </div>
                <button
                  type="button"
                  className="residence-modal-close"
                  onClick={() => setSelectedResidence(null)}
                  aria-label="Fermer"
                >
                  ✕
                </button>
              </div>

              <div className="residence-modal-body">
                <img
                  src={getImage(selectedResidence)}
                  alt={selectedResidence.name}
                  className="residence-modal-img"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = DEFAULT_PLACEHOLDER_IMAGE;
                  }}
                />

                <div className="residence-modal-info">
                  <h4 className="residence-modal-subtitle">Description du programme</h4>
                  <p className="residence-modal-desc">
                    {selectedResidence.description || 'Ensemble résidentiel haut de gamme développé avec soin par l’agence partenaire.'}
                  </p>

                  <div className="residence-modal-details-grid">
                    <div className="residence-detail-item">
                      <span className="detail-item-label">Ville</span>
                      <span className="detail-item-val">{selectedResidence.city || 'Maroc'}</span>
                    </div>
                    <div className="residence-detail-item">
                      <span className="detail-item-label">Adresse</span>
                      <span className="detail-item-val">{selectedResidence.address || 'Non spécifiée'}</span>
                    </div>
                    <div className="residence-detail-item">
                      <span className="detail-item-label">Agence responsable</span>
                      <span className="detail-item-val">{getAgencyName(selectedResidence)}</span>
                    </div>
                    <div className="residence-detail-item">
                      <span className="detail-item-label">Biens disponibles</span>
                      <span className="detail-item-val">
                        {getResidenceCount(selectedResidence.id)} bien(s)
                      </span>
                    </div>
                    <div className="residence-detail-item">
                      <span className="detail-item-label">Consultations</span>
                      <span className="detail-item-val">
                        👁️ {selectedResidence.views != null ? selectedResidence.views : 0} vues
                      </span>
                    </div>
                  </div>

                  <div className="residence-modal-actions">
                    <a
                      href="#annonces"
                      onClick={() => {
                        setSelectedResidence(null);
                        if (onSelectResidence) onSelectResidence(selectedResidence.id);
                      }}
                      className="btn-urbanet-primary"
                      style={{ textAlign: 'center', textDecoration: 'none' }}
                    >
                      Voir les biens associés à cette résidence
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedResidences;
