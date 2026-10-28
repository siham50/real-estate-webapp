import React, { useState, useEffect } from 'react';
import { getAllResidences, getAllProperties } from '../services/api';

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

const RESIDENCE_FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80',
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

  const getImage = (res, index) => {
    if (res.image) return res.image;
    if (res.images && res.images.length > 0 && res.images[0].imageUrl) {
      return res.images[0].imageUrl;
    }
    return RESIDENCE_FALLBACK_IMAGES[index % RESIDENCE_FALLBACK_IMAGES.length];
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
            {residences.map((res, index) => {
              const count = getResidenceCount(res.id);
              const agency = getAgencyName(res);
              const imgUrl = getImage(res, index);

              return (
                <article key={res.id} className="urbanet-property-card urbanet-residence-card">
                  {/* Media Header */}
                  <div className="property-media-wrapper">
                    <img
                      src={imgUrl}
                      alt={res.name}
                      className="property-img"
                      loading="lazy"
                    />
                    <span className="property-badge badge-residence-pill">
                      {res.badge || 'Programme Agence'}
                    </span>
                    <span className="residence-units-badge">
                      {count > 0 ? `${count} bien(s) lié(s)` : 'Nouveau complexe'}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="property-body">
                    <div className="residence-city-tag">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <span>{res.city || 'Maroc'}</span>
                    </div>

                    <h3 className="residence-title">{res.name}</h3>

                    <div className="property-location residence-address">
                      <span>{res.address || `${res.city || 'Maroc'}`}</span>
                    </div>

                    <p className="residence-description">
                      {res.description || 'Résidence contemporaine offrant prestations de qualité supérieure et cadre de vie privilégié.'}
                    </p>

                    {/* Card Footer */}
                    <div className="property-footer residence-footer">
                      <div className="residence-agency-info">
                        <span className="agency-label">Promoteur / Agence :</span>
                        <span className="property-agency">{agency}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedResidence(res)}
                        className="residence-explore-link"
                      >
                        Découvrir →
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Modal Détails Résidence */}
        {selectedResidence && (
          <div className="residence-modal-overlay" onClick={() => setSelectedResidence(null)}>
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
                  src={getImage(selectedResidence, 0)}
                  alt={selectedResidence.name}
                  className="residence-modal-img"
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
