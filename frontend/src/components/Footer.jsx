import React from 'react';

const Footer = () => {
  return (
    <footer className="urbanet-footer">
      <div className="urbanet-container">
        <div className="urbanet-footer-top">
          {/* Logo & Description */}
          <div className="footer-brand-col">
            <div className="urbanet-logo footer-logo">
              <div className="urbanet-logo-badge">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <span className="urbanet-logo-title footer-title-white">Urbanet</span>
            </div>
            <p className="footer-desc">
              La plateforme immobilière de référence au Maroc. Achat, vente et location de biens de standing en toute transparence et sérénité.
            </p>
          </div>

          {/* 3 Link Columns */}
          <div className="footer-links-grid">
            {/* Column 1: Explorer */}
            <div className="footer-col">
              <h4 className="footer-col-title">EXPLORER</h4>
              <ul className="footer-links">
                <li><a href="#annonces">Acheter un bien</a></li>
                <li><a href="#annonces">Louer un bien</a></li>
                <li><a href="#residences">Résidences neuves</a></li>
                <li><a href="#annonces">Biens en vedette</a></li>
                <li><a href="#publier">Publier une annonce</a></li>
              </ul>
            </div>

            {/* Column 2: Villes */}
            <div className="footer-col">
              <h4 className="footer-col-title">VILLES</h4>
              <ul className="footer-links">
                <li><a href="#casablanca">Casablanca</a></li>
                <li><a href="#marrakech">Marrakech</a></li>
                <li><a href="#rabat">Rabat</a></li>
                <li><a href="#tanger">Tanger</a></li>
                <li><a href="#agadir">Agadir</a></li>
                <li><a href="#fes">Fès</a></li>
              </ul>
            </div>

            {/* Column 3: Urbanet */}
            <div className="footer-col">
              <h4 className="footer-col-title">URBANET</h4>
              <ul className="footer-links">
                <li><a href="#apropos">À propos</a></li>
                <li><a href="#services">Nos services</a></li>
                <li><a href="#agences">Agences partenaires</a></li>
                <li><a href="#contact">Contact & Support</a></li>
                <li><a href="#cgu">Conditions d'utilisation</a></li>
                <li><a href="#confidentialite">Politique de confidentialité</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="urbanet-footer-bottom">
          <p>© 2026 Urbanet. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
