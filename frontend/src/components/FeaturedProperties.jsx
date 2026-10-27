import React, { useState } from 'react';

const featuredData = [
  {
    id: 1,
    tag: 'À vendre',
    price: '4.250.000 MAD',
    title: 'Villa contemporaine avec piscine',
    location: 'Californie, Casablanca',
    beds: '4 ch.',
    baths: '3 sdb',
    area: '350 m²',
    views: '1.248 vues',
    agency: 'Atlas Immobilier',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 2,
    tag: 'À vendre',
    price: '2.100.000 MAD',
    title: 'Appartement haut standing au cœur de...',
    location: 'Gauthier, Casablanca',
    beds: '2 ch.',
    baths: '2 sdb',
    area: '120 m²',
    views: '876 vues',
    agency: 'Karim Benali',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 3,
    tag: 'À vendre',
    price: '5.800.000 MAD',
    title: "Penthouse avec vue sur l'Atlas",
    location: "Route de l'Ourika, Marrakech",
    beds: '3 ch.',
    baths: '3 sdb',
    area: '240 m²',
    views: '2.140 vues',
    agency: 'Résidences Al Manar',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80',
  },
];

const FeaturedProperties = () => {
  const [favorites, setFavorites] = useState({});

  const toggleFavorite = (id) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section id="annonces" className="urbanet-section urbanet-featured-section">
      <div className="urbanet-container">
        {/* Section Header */}
        <div className="urbanet-section-header">
          <div className="urbanet-section-title-group">
            <span className="urbanet-section-label">BIENS EN VEDETTE</span>
            <h2 className="urbanet-section-heading">Explorez nos annonces exclusives</h2>
          </div>
          <button type="button" className="urbanet-btn-view-all">
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
          </button>
        </div>

        {/* 3-Cards Grid */}
        <div className="urbanet-properties-grid">
          {featuredData.map((item) => {
            const isFav = favorites[item.id];
            return (
              <article key={item.id} className="urbanet-property-card">
                {/* Media Header */}
                <div className="property-media-wrapper">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="property-img"
                    loading="lazy"
                  />
                  <span className="property-badge">{item.tag}</span>
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
                  <div className="property-price">{item.price}</div>
                  <h3 className="property-title">{item.title}</h3>
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
                    <span>{item.location}</span>
                  </div>

                  {/* Specs Row */}
                  <div className="property-specs">
                    <span className="spec-item">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 4v16" />
                        <path d="M2 8h18a2 2 0 0 1 2 2v10" />
                        <path d="M2 17h20" />
                        <path d="M6 8v9" />
                      </svg>
                      {item.beds}
                    </span>
                    <span className="spec-item">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 6h11a2 2 0 0 1 2 2v2a4 4 0 0 1-4 4H9V6z" />
                        <path d="M4 12v6" />
                        <path d="M2 18h20" />
                      </svg>
                      {item.baths}
                    </span>
                    <span className="spec-item">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 3 21 3 21 9" />
                        <polyline points="9 21 3 21 3 15" />
                        <line x1="21" y1="3" x2="14" y2="10" />
                        <line x1="3" y1="21" x2="10" y2="14" />
                      </svg>
                      {item.area}
                    </span>
                    <span className="spec-item">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      {item.views}
                    </span>
                  </div>

                  {/* Card Footer */}
                  <div className="property-footer">
                    <span className="property-agency">{item.agency}</span>
                    <a href={`#property-${item.id}`} className="property-link">
                      Voir le bien →
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;
