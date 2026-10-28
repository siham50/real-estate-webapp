import React from 'react';

const CallToAction = () => {
  return (
    <section className="urbanet-section urbanet-cta-section">
      <div className="urbanet-container">
        <div className="urbanet-cta-card">
          <h2 className="cta-title">Prêt à trouver le bien qui vous ressemble ?</h2>
          <p className="cta-desc">
            Parcourez des centaines d'annonces vérifiées et réservez votre visite en quelques clics.
          </p>
          <a href="#annonces" className="urbanet-btn-cta">
            Commencer ma recherche
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
    </section>
  );
};

export default CallToAction;
