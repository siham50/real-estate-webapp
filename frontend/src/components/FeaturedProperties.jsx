import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllProperties, getAllResidences } from '../services/api';
import PropertyCard, { getPropertyImages } from './PropertyCard';
import { getImageUrl, DEFAULT_PLACEHOLDER_IMAGE } from '../utils/imageUtils';

export const DEFAULT_PROPERTIES = [
  {
    id: 1,
    tag: 'À vendre',
    purpose: 'SALE',
    type: 'VILLA',
    price: 4250000,
    formattedPrice: '4.250.000 MAD',
    title: 'Villa contemporaine avec piscine',
    location: 'Californie, Casablanca',
    beds: '4 ch.',
    baths: '3 sdb',
    area: '350 m²',
    latitude: 33.5412,
    longitude: -7.6324,
    views: '1.248 vues',
    agency: 'Atlas Immobilier',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=900&q=80',
    description: 'Somptueuse villa contemporaine nichée au cœur du quartier résidentiel Californie. Architecture épurée, finitions de marbre noble, piscine miroir et jardin paysager.',
  },
  {
    id: 2,
    tag: 'À vendre',
    purpose: 'SALE',
    type: 'APARTMENT',
    price: 2100000,
    formattedPrice: '2.100.000 MAD',
    title: 'Appartement haut standing au cœur de...',
    location: 'Gauthier, Casablanca',
    beds: '2 ch.',
    baths: '2 sdb',
    area: '120 m²',
    latitude: 33.5898,
    longitude: -7.6256,
    views: '876 vues',
    agency: 'Karim Benali',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=80',
    description: 'Magnifique appartement situé dans une résidence sécurisée de prestige à Gauthier. Grand salon lumineux, suite parentale et cuisine équipée.',
  },
  {
    id: 3,
    tag: 'À vendre',
    purpose: 'SALE',
    type: 'APARTMENT',
    price: 5800000,
    formattedPrice: '5.800.000 MAD',
    title: "Penthouse avec vue sur l'Atlas",
    location: "Route de l'Ourika, Marrakech",
    beds: '3 ch.',
    baths: '3 sdb',
    area: '240 m²',
    latitude: 31.5492,
    longitude: -7.9578,
    views: '2.140 vues',
    agency: 'Résidences Al Manar',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80',
    description: 'Penthouse d’exception sur la route de l’Ourika avec terrasse panoramique de 100m² sans vis-à-vis, jacuzzi extérieur et vue imprenable sur les montagnes de l’Atlas.',
  },
];

export const TYPE_IMAGES = {
  VILLA: [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80',
  ],
  APARTMENT: [
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80',
  ],
  HOUSE: [
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=900&q=80',
  ],
  OFFICE: [
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80',
  ],
  COMMERCIAL: [
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=900&q=80',
  ],
  LAND: [
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=80',
  ],
};

export const TYPE_TRANSLATIONS = {
  VILLA: 'Villa',
  APARTMENT: 'Appartement',
  HOUSE: 'Maison',
  OFFICE: 'Bureau',
  COMMERCIAL: 'Local commercial',
  LAND: 'Terrain',
};

const FeaturedProperties = ({ filterResidenceId }) => {
  const [properties, setProperties] = useState([]);
  const [residenceMap, setResidenceMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL', 'SALE', 'RENT', 'VILLA', 'APARTMENT'
  const [favorites, setFavorites] = useState({});
  const [selectedProperty, setSelectedProperty] = useState(null);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [propsData, resData] = await Promise.all([
          getAllProperties().catch(() => []),
          getAllResidences().catch(() => []),
        ]);

        // Map résidences par ID
        const rMap = {};
        if (Array.isArray(resData)) {
          resData.forEach((r) => {
            if (r.id) rMap[r.id] = r.name;
          });
        }
        setResidenceMap(rMap);

        // Biens valides non supprimés
        if (Array.isArray(propsData) && propsData.length > 0) {
          const nonDeleted = propsData.filter((p) => !p.isDeleted);
          if (nonDeleted.length > 0) {
            setProperties(nonDeleted);
          } else {
            setProperties(DEFAULT_PROPERTIES);
          }
        } else {
          setProperties(DEFAULT_PROPERTIES);
        }
      } catch (err) {
        setProperties(DEFAULT_PROPERTIES);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const toggleFavorite = (id) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const formatPrice = (price, purpose) => {
    if (!price) return 'Prix sur demande';
    const formatted = Number(price).toLocaleString('fr-FR');
    return `${formatted} MAD${purpose === 'RENT' ? ' / mois' : ''}`;
  };

  const getCardImage = (item) => {
    if (!item) return DEFAULT_PLACEHOLDER_IMAGE;
    let displayImage = null;
    if (item.images && item.images.length > 0) {
      // Cherche l'image avec isPrimary = true
      const primaryImg = item.images.find((img) => img.isPrimary === true);
      // Si elle existe, on la prend, sinon on prend la première par défaut
      displayImage = primaryImg ? primaryImg : item.images[0];
    }
    if (displayImage) {
      const path = typeof displayImage === 'string' ? displayImage : displayImage.imageUrl;
      return getImageUrl(path);
    }
    if (item.image) return getImageUrl(item.image);
    return DEFAULT_PLACEHOLDER_IMAGE;
  };

  const getAgencyName = (item) => {
    if (item.agency) return item.agency;
    if (item.owner) {
      const name = `${item.owner.firstName || ''} ${item.owner.lastName || ''}`.trim();
      return name || item.owner.email || 'Agence partenaire';
    }
    return 'Agence partenaire';
  };

  const getResidenceName = (item) => {
    if (item.residence?.name) return item.residence.name;
    if (item.residence?.id && residenceMap[item.residence.id]) {
      return residenceMap[item.residence.id];
    }
    return null;
  };

  // Filtrage
  const filteredList = properties.filter((item) => {
    if (filterResidenceId && item.residence?.id !== filterResidenceId) {
      return false;
    }
    if (activeTab === 'SALE') return item.purpose === 'SALE';
    if (activeTab === 'RENT') return item.purpose === 'RENT';
    if (activeTab === 'VILLA') return item.type === 'VILLA';
    if (activeTab === 'APARTMENT') return item.type === 'APARTMENT';
    return true;
  });

  return (
    <section id="annonces" className="urbanet-section urbanet-featured-section">
      <div className="urbanet-container">
        {/* Section Header */}
        <div className="urbanet-section-header">
          <div className="urbanet-section-title-group">
            <span className="urbanet-section-label">BIENS EN VEDETTE</span>
            <h2 className="urbanet-section-heading">Explorez nos annonces exclusives</h2>
          </div>

          <div className="urbanet-header-actions-row">
            {/* Filter Tabs */}
            <div className="urbanet-filter-pills">
              <button
                type="button"
                className={`filter-pill-btn ${activeTab === 'ALL' ? 'active' : ''}`}
                onClick={() => setActiveTab('ALL')}
              >
                Tous
              </button>
              <button
                type="button"
                className={`filter-pill-btn ${activeTab === 'SALE' ? 'active' : ''}`}
                onClick={() => setActiveTab('SALE')}
              >
                À vendre
              </button>
              <button
                type="button"
                className={`filter-pill-btn ${activeTab === 'RENT' ? 'active' : ''}`}
                onClick={() => setActiveTab('RENT')}
              >
                À louer
              </button>
              <button
                type="button"
                className={`filter-pill-btn ${activeTab === 'VILLA' ? 'active' : ''}`}
                onClick={() => setActiveTab('VILLA')}
              >
                Villas
              </button>
              <button
                type="button"
                className={`filter-pill-btn ${activeTab === 'APARTMENT' ? 'active' : ''}`}
                onClick={() => setActiveTab('APARTMENT')}
              >
                Appartements
              </button>
            </div>

            <a href="#annonces" className="urbanet-btn-view-all">
              Voir toutes les annonces
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
        </div>

        {/* Loading */}
        {loading && (
          <div className="urbanet-properties-grid">
            {[1, 2, 3].map((n) => (
              <div key={n} className="urbanet-property-card property-skeleton-card">
                <div className="skeleton-img"></div>
                <div className="skeleton-body">
                  <div className="skeleton-line" style={{ width: '50%' }}></div>
                  <div className="skeleton-line" style={{ width: '85%' }}></div>
                  <div className="skeleton-line" style={{ width: '60%' }}></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cards Grid */}
        {!loading && (
          <div className="urbanet-properties-grid">
            {filteredList.map((item) => (
              <PropertyCard
                key={item.id}
                property={item}
                isFav={Boolean(favorites[item.id])}
                onToggleFav={toggleFavorite}
                residenceName={getResidenceName(item)}
              />
            ))}
          </div>
        )}

        {/* Modal Détails Bien */}
        {selectedProperty && (
          <div className="residence-modal-overlay">
            <div className="residence-modal-card property-detail-modal" onClick={(e) => e.stopPropagation()}>
              <div className="residence-modal-header">
                <div>
                  <span className="residence-modal-badge">
                    {selectedProperty.purpose === 'RENT' ? 'À louer' : 'À vendre'} · {TYPE_TRANSLATIONS[selectedProperty.type] || selectedProperty.type || 'Bien d’exception'}
                  </span>
                  <h2 className="residence-modal-title">{selectedProperty.title}</h2>
                  <p className="residence-modal-location">
                    📍 {selectedProperty.address ? `${selectedProperty.address}, ` : ''}{selectedProperty.city || 'Maroc'}
                  </p>
                </div>
                <button
                  type="button"
                  className="residence-modal-close"
                  onClick={() => setSelectedProperty(null)}
                  aria-label="Fermer"
                >
                  ✕
                </button>
              </div>

              <div className="residence-modal-body">
                <img
                  src={getCardImage(selectedProperty, 0)}
                  alt={selectedProperty.title}
                  className="residence-modal-img"
                />

                <div className="residence-modal-info">
                  <div className="modal-price-tag">
                    {selectedProperty.formattedPrice || formatPrice(selectedProperty.price, selectedProperty.purpose)}
                  </div>

                  <h4 className="residence-modal-subtitle">Description du bien</h4>
                  <p className="residence-modal-desc">
                    {selectedProperty.description ||
                      'Superbe bien immobilier d’exception proposé par notre agence partenaire, offrant un cadre de vie remarquable et des finitions haut de gamme.'}
                  </p>

                  <div className="residence-modal-details-grid">
                    <div className="residence-detail-item">
                      <span className="detail-item-label">Type de bien</span>
                      <span className="detail-item-val">{TYPE_TRANSLATIONS[selectedProperty.type] || selectedProperty.type || 'Résidentiel'}</span>
                    </div>
                    <div className="residence-detail-item">
                      <span className="detail-item-label">Superficie</span>
                      <span className="detail-item-val">{selectedProperty.surfaceArea || 120} m²</span>
                    </div>
                    <div className="residence-detail-item">
                      <span className="detail-item-label">Agence responsable</span>
                      <span className="detail-item-val">{getAgencyName(selectedProperty)}</span>
                    </div>
                    <div className="residence-detail-item">
                      <span className="detail-item-label">Résidence</span>
                      <span className="detail-item-val">{getResidenceName(selectedProperty) || 'Indépendante'}</span>
                    </div>
                  </div>

                  <div className="residence-modal-actions">
                    <a
                      href={`mailto:${selectedProperty.owner?.email || 'contact@urbanet.ma'}?subject=Demande d'information: ${encodeURIComponent(selectedProperty.title)}`}
                      className="btn-urbanet-primary"
                      style={{ textAlign: 'center', textDecoration: 'none' }}
                    >
                      Contacter l’agence pour une visite
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

export default FeaturedProperties;
