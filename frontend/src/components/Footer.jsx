import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Footer = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isLoggedIn = Boolean(user && user.id);
  const userRole = String(user?.role || '').toUpperCase();
  const isAgency = userRole === 'PROFESSIONAL' || userRole === 'AGENCE';
  const isAdmin = userRole === 'ADMIN';

  // Redirection selon la connexion et le rôle pour "Publier une annonce"
  const getPublishLink = () => {
    if (!isLoggedIn) {
      return '/login';
    }
    if (isAdmin) {
      return '/admin/properties';
    }
    if (isAgency) {
      return '/agency/dashboard?newProperty=true';
    }
    return '/agency/dashboard?newProperty=true';
  };

  const handleFooterLogoClick = (e) => {
    if (isAdmin) {
      e.preventDefault();
      navigate('/admin');
    } else if (isAgency) {
      e.preventDefault();
      navigate('/agency/dashboard');
    }
  };

  return (
    <footer className="urbanet-footer">
      {/* Background Curved Lines Pattern */}
      <div className="urbanet-footer-pattern" aria-hidden="true">
        <svg
          viewBox="0 0 1440 380"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <ellipse cx="220" cy="450" rx="200" ry="200" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          <ellipse cx="220" cy="450" rx="320" ry="320" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          <ellipse cx="220" cy="450" rx="440" ry="440" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          <ellipse cx="220" cy="450" rx="560" ry="560" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          <ellipse cx="220" cy="450" rx="680" ry="680" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          <ellipse cx="220" cy="450" rx="800" ry="800" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          <ellipse cx="220" cy="450" rx="920" ry="920" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          <ellipse cx="220" cy="450" rx="1040" ry="1040" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          <ellipse cx="220" cy="450" rx="1160" ry="1160" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          <ellipse cx="220" cy="450" rx="1280" ry="1280" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          <ellipse cx="220" cy="450" rx="1400" ry="1400" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          <ellipse cx="220" cy="450" rx="1520" ry="1520" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
        </svg>
      </div>

      <div className="urbanet-container urbanet-footer-inner">
        <div className="urbanet-footer-top">
          {/* Brand Column */}
          <div className="footer-brand-col">
            <Link
              to={isAdmin ? '/admin' : isAgency ? '/agency/dashboard' : '/'}
              onClick={handleFooterLogoClick}
              className="urbanet-logo footer-logo"
              style={{ textDecoration: 'none' }}
            >
              <div className="urbanet-footer-logo-badge">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#0f172a"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <span className="urbanet-logo-title footer-title-white">Urbanet</span>
            </Link>
            <p className="footer-desc">
              Simplifier l'achat, la vente et la location de biens immobiliers, partout au Maroc.
            </p>
          </div>

          {/* 3 Links Columns */}
          <div className="footer-links-grid">
            {isAgency ? (
              <div className="footer-col">
                <h4 className="footer-col-title">ESPACE AGENCE</h4>
                <ul className="footer-links">
                  <li><Link to="/agency/dashboard">Tableau de bord</Link></li>
                  <li><Link to="/agency/dashboard?tab=properties">Mes Biens</Link></li>
                  <li><Link to="/agency/dashboard">Mes Résidences</Link></li>
                  <li><Link to="/messages">Messagerie</Link></li>
                  <li><Link to="/profile/agency">Profil de l'agence</Link></li>
                </ul>
              </div>
            ) : (
              <>
                {/* Column 1: EXPLORER */}
                <div className="footer-col">
                  <h4 className="footer-col-title">EXPLORER</h4>
                  <ul className="footer-links">
                    <li><Link to="/properties">Toutes les annonces</Link></li>
                    <li><Link to="/properties">Villas & maisons</Link></li>
                    <li><Link to="/properties?type=APARTMENT">Appartements</Link></li>
                    <li><Link to="/properties?type=LAND">Terrains & locaux</Link></li>
                  </ul>
                </div>

                {/* Column 2: VILLES */}
                <div className="footer-col">
                  <h4 className="footer-col-title">VILLES</h4>
                  <ul className="footer-links">
                    <li><Link to="/properties?city=Casablanca">Casablanca</Link></li>
                    <li><Link to="/properties?city=Rabat">Rabat</Link></li>
                    <li><Link to="/properties?city=Marrakech">Marrakech</Link></li>
                    <li><Link to="/properties?city=Tanger">Tanger</Link></li>
                    <li><Link to="/properties?city=Agadir">Agadir</Link></li>
                    <li><Link to="/properties?city=F%C3%A8s">Fès</Link></li>
                  </ul>
                </div>
              </>
            )}

            {/* Column 3: URBANET */}
            <div className="footer-col">
              <h4 className="footer-col-title">URBANET</h4>
              <ul className="footer-links">
                <li><Link to="/#apropos">À propos</Link></li>
                <li><Link to={getPublishLink()}>Publier une annonce</Link></li>
                <li><Link to="/#contact">Aide & contact</Link></li>
                <li><Link to="/#cgu">Conditions d'utilisation</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Separator & Left-aligned Copyright */}
        <div className="urbanet-footer-bottom">
          <p>© 2026 Urbanet. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
