import React from 'react';
import SearchBar from './SearchBar';

const Hero = () => {
  return (
    <section className="urbanet-hero-section">
      <div className="urbanet-hero-bg">
        <div className="urbanet-hero-overlay"></div>
        <div className="urbanet-hero-content">
          {/* Verified Badge */}
          <div className="urbanet-hero-badge">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
            <span>Annonces vérifiées partout au Maroc</span>
          </div>

          {/* Main Headline */}
          <h1 className="urbanet-hero-title">
            Simplifier l'achat, la vente et la location de biens immobiliers
          </h1>

          {/* Subtitle */}
          <p className="urbanet-hero-desc">
            Que vous cherchiez votre première maison, un investissement locatif ou un local pour votre activité, Urbanet réunit tout au même endroit.
          </p>

          {/* Action Buttons */}
          <div className="urbanet-hero-actions">
            <a href="#annonces" className="urbanet-hero-btn-primary">
              Explorer les annonces
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
            <button type="button" className="urbanet-hero-btn-secondary">
              Publier une annonce
            </button>
          </div>
        </div>
      </div>

      {/* Floating Search Bar overlapping hero bottom */}
      <div className="urbanet-hero-search-container">
        <SearchBar />
      </div>
    </section>
  );
};

export default Hero;
