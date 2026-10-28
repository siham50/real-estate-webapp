import React, { useState, useEffect } from 'react';
import { getAllProperties, getAllResidences } from '../services/api';

const DEFAULT_PROPERTIES = [
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
    views: '2.140 vues',
    agency: 'Résidences Al Manar',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80',
    description: 'Penthouse d’exception sur la route de l’Ourika avec terrasse panoramique de 100m² sans vis-à-vis, jacuzzi extérieur et vue imprenable sur les montagnes de l’Atlas.',
  },
];

const TYPE_IMAGES = {
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

const TYPE_TRANSLATIONS = {
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
            // Si des biens existent dans la BD, on les combine avec les démos si moins de 3
            if (nonDeleted.length < 3) {
              setProperties([...nonDeleted, ...DEFAULT_PROPERTIES.slice(nonDeleted.length)]);
            } else {
              setProperties(nonDeleted);
            }
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

  const getCardImage = (item, index) => {
    if (item.image) return item.image;
    if (item.documents && item.documents.length > 0 && item.documents[0].fileUrl) {
      return item.documents[0].fileUrl;
    }
    const pool = TYPE_IMAGES[item.type] || TYPE_IMAGES.APARTMENT;
    return pool[index % pool.length];
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
            {filteredList.map((item, index) => {
              const isFav = favorites[item.id];
              const tag = item.tag || (item.purpose === 'RENT' ? 'À louer' : 'À vendre');
              const priceDisplay = item.formattedPrice || formatPrice(item.price, item.purpose);
              const agency = getAgencyName(item);
              const residenceName = getResidenceName(item);
              const locationDisplay =
                item.location ||
                `${item.city || 'Maroc'}${item.address ? ', ' + item.address : ''}`;
              const imageSrc = getCardImage(item, index);
              const bedsDisplay =
                item.beds || (item.surfaceArea ? `${Math.max(1, Math.round(item.surfaceArea / 45))} ch.` : '3 ch.');
              const bathsDisplay =
                item.baths || (item.surfaceArea ? `${Math.max(1, Math.round(item.surfaceArea / 70))} sdb` : '2 sdb');
              const areaDisplay = item.area || (item.surfaceArea ? `${item.surfaceArea} m²` : '150 m²');
              const viewsDisplay = item.views || `${((item.id * 149 + 320) % 2500) + 120} vues`;

              return (
                <article key={item.id} className="urbanet-property-card">
                  {/* Media Header */}
                  <div className="property-media-wrapper">
                    <img
                      src={imageSrc}
                      alt={item.title}
                      className="property-img"
                      loading="lazy"
                    />
                    <span className="property-badge">{tag}</span>

                    {/* Badge Résidence si associé */}
                    {residenceName && (
                      <span className="property-residence-badge" title={`Résidence : ${residenceName}`}>
                        🏢 {residenceName}
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => toggleFavorite(item.id)}
                      className={`property-fav-btn ${isFav ? 'is-active' : ''}`}
                      aria-label="Ajouter aux favoris"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill={isFav ? '#ef4444' : 'none'}
                        stroke={isFav ? '#ef4444' : '#0f172a'}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>
                  </div>

                  {/* Card Body */}
                  <div className="property-body">
                    <div className="property-price">{priceDisplay}</div>
                    <h3 className="property-title" title={item.title}>
                      {item.title}
                    </h3>

                    <div className="property-location">
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#94a3b8"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <span>{locationDisplay}</span>
                    </div>

                    {/* Specs Row */}
                    <div className="property-specs">
                      <span className="spec-item" title="Chambres">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 4v16" />
                          <path d="M2 8h18a2 2 0 0 1 2 2v10" />
                          <path d="M2 17h20" />
                          <path d="M6 8v9" />
                        </svg>
                        {bedsDisplay}
                      </span>
                      <span className="spec-item" title="Salles de bain">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 6h11a2 2 0 0 1 2 2v2a4 4 0 0 1-4 4H9V6z" />
                          <path d="M4 12v6" />
                          <path d="M2 18h20" />
                        </svg>
                        {bathsDisplay}
                      </span>
                      <span className="spec-item" title="Superficie">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="15 3 21 3 21 9" />
                          <polyline points="9 21 3 21 3 15" />
                          <line x1="21" y1="3" x2="14" y2="10" />
                          <line x1="3" y1="21" x2="10" y2="14" />
                        </svg>
                        {areaDisplay}
                      </span>
                      <span className="spec-item" title="Consultations">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        {viewsDisplay}
                      </span>
                    </div>

                    {/* Card Footer */}
                    <div className="property-footer">
                      <span className="property-agency" title={`Annonce proposée par ${agency}`}>
                        {agency}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedProperty(item)}
                        className="property-link property-link-btn"
                      >
                        Voir le bien →
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Modal Détails Bien */}
        {selectedProperty && (
          <div className="residence-modal-overlay" onClick={() => setSelectedProperty(null)}>
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
