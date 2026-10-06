import React, { useState, useEffect } from 'react';
import { testBackend } from '../services/api';

const PROPERTIES = [
  {
    id: 1,
    title: 'Villa Moderne avec Jardin',
    city: 'Casablanca',
    price: '2 500 000',
    priceSuffix: 'DH',
    type: 'sale',
    badgeText: 'À VENDRE',
    image:
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=500&fit=crop',
  },
  {
    id: 2,
    title: 'Appartement Haut Standing',
    city: 'Rabat',
    price: '8 000',
    priceSuffix: 'DH / mois',
    type: 'rent',
    badgeText: 'À LOUER',
    image:
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=500&fit=crop',
  },
  {
    id: 3,
    title: 'Terrain Constructible Idéal Projet',
    city: 'Marrakech',
    price: '1 200 000',
    priceSuffix: 'DH',
    type: 'sale',
    badgeText: 'À VENDRE',
    image:
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=500&fit=crop',
  },
];

const PropertyList = () => {
  const [backendStatus, setBackendStatus] = useState({
    loading: true,
    success: false,
    message: '',
  });

  useEffect(() => {
    const checkBackend = async () => {
      const result = await testBackend();
      if (result.success) {
        setBackendStatus({
          loading: false,
          success: true,
          message: typeof result.data === 'string' ? result.data : 'Backend opérationnel',
        });
      } else {
        setBackendStatus({
          loading: false,
          success: false,
          message: result.error || 'Connexion au backend échouée',
        });
      }
    };

    checkBackend();
  }, []);

  return (
    <section className="property-list">
      {/* Bandeau statut backend */}
      <div
        className={`backend-status ${
          backendStatus.loading
            ? 'status-loading'
            : backendStatus.success
            ? 'status-success'
            : 'status-error'
        }`}
      >
        {backendStatus.loading ? (
          <span>Vérification de la connexion au backend...</span>
        ) : (
          <span>Statut Backend : {backendStatus.message}</span>
        )}
      </div>

      <h2 className="section-title">Nos Dernières Annonces</h2>

      <div className="grid">
        {PROPERTIES.map((property) => (
          <article key={property.id} className="card">
            <div className="card-image">
              <img src={property.image} alt={property.title} loading="lazy" />
              <span
                className={`card-badge ${
                  property.type === 'sale' ? 'badge-sale' : 'badge-rent'
                }`}
              >
                {property.badgeText}
              </span>
            </div>
            <div className="card-body">
              <h3 className="card-title">{property.title}</h3>
              <p className="card-city">{property.city}</p>
              <p className="card-price">
                {property.price}{' '}
                <span className="price-suffix">{property.priceSuffix}</span>
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default PropertyList;
