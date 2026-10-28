import React from 'react';

const servicesList = [
  {
    id: 1,
    title: 'Annonces vérifiées',
    desc: 'Chaque annonceur est contrôlé : identité pour les particuliers, documents légaux pour les agences et promoteurs.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
  },
  {
    id: 2,
    title: 'Recherche avancée',
    desc: 'Filtrez par ville, type de bien, budget, surface et nombre de pièces pour trouver le bien idéal.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    id: 3,
    title: 'Carte interactive',
    desc: "Visualisez l'emplacement exact de chaque bien depuis sa page de détails, quartier par quartier.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    id: 4,
    title: 'Calculateur de prêt',
    desc: 'Estimez instantanément la mensualité, les intérêts totaux et le coût global de votre crédit immobilier.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="16 7 22 7 22 13" />
      </svg>
    ),
  },
  {
    id: 5,
    title: 'Visites planifiées',
    desc: 'Réservez un créneau de visite parmi ceux proposés par le vendeur, et reprogrammez en un clic.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    id: 6,
    title: 'Messagerie sécurisée',
    desc: "Échangez en temps réel avec l'agence, le promoteur ou le particulier avant et après la visite.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
];

const Services = () => {
  return (
    <section className="urbanet-section urbanet-services-section">
      <div className="urbanet-container">
        <div className="urbanet-services-layout">
          {/* Left Column: Heading & Intro */}
          <div className="services-intro-col">
            <span className="urbanet-section-label">NOS SERVICES</span>
            <h2 className="services-main-title">
              Tout ce qu'il faut pour un projet immobilier réussi
            </h2>
            <p className="services-main-desc">
              Urbanet accompagne acheteurs, vendeurs et locataires à chaque étape, de la recherche jusqu'à la signature.
            </p>
          </div>

          {/* Right Column: 6 Cards (2 cols x 3 rows) */}
          <div className="services-cards-grid">
            {servicesList.map((service) => (
              <div key={service.id} className="service-card">
                <div className="service-icon-wrapper">{service.icon}</div>
                <h3 className="service-title">{service.title}</h3>
                <p className="service-desc">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
