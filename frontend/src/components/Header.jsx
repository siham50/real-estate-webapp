import React from 'react';

const Header = () => {
  return (
    <header className="header">
      <div className="header-container">
        <a href="/" className="logo">
          <svg
            className="logo-icon"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span className="logo-text">
            Real <span className="logo-accent">Estate</span>
          </span>
        </a>
        <nav className="nav">
          <a href="#acheter" className="nav-link">
            Acheter
          </a>
          <a href="#louer" className="nav-link">
            Louer
          </a>
          <a href="#nouveautes" className="nav-link">
            Nouveautés
          </a>
          <a href="#publier" className="publish-btn">
            Publier une annonce
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
