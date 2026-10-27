import React, { useState } from 'react';

const SearchBar = () => {
  const [transactionType, setTransactionType] = useState('buy'); // 'buy' or 'rent'
  const [keyword, setKeyword] = useState('');
  const [city, setCity] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [budget, setBudget] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Search params:', { transactionType, keyword, city, propertyType, budget });
  };

  return (
    <div className="urbanet-search-wrapper">
      <div className="urbanet-search-card">
        {/* Type Switcher Tabs (Acheter / Louer) */}
        <div className="urbanet-search-tabs">
          <button
            type="button"
            className={`urbanet-tab-pill ${transactionType === 'buy' ? 'active' : ''}`}
            onClick={() => setTransactionType('buy')}
          >
            Acheter
          </button>
          <button
            type="button"
            className={`urbanet-tab-pill ${transactionType === 'rent' ? 'active' : ''}`}
            onClick={() => setTransactionType('rent')}
          >
            Louer
          </button>
        </div>

        {/* Form Fields */}
        <form className="urbanet-search-form" onSubmit={handleSearch}>
          {/* Keyword / Neighborhood Input */}
          <div className="urbanet-field-wrapper field-keyword">
            <svg
              className="field-icon"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#64748b"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Quartier, résidence, mot-clé..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="urbanet-input"
            />
          </div>

          {/* City Select */}
          <div className="urbanet-field-wrapper field-select">
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="urbanet-select"
            >
              <option value="">Toutes les villes</option>
              <option value="casablanca">Casablanca</option>
              <option value="marrakech">Marrakech</option>
              <option value="rabat">Rabat</option>
              <option value="tanger">Tanger</option>
              <option value="agadir">Agadir</option>
            </select>
            <svg
              className="select-chevron"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#64748b"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>

          {/* Type Select */}
          <div className="urbanet-field-wrapper field-select">
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="urbanet-select"
            >
              <option value="">Tous les types</option>
              <option value="appartement">Appartement</option>
              <option value="villa">Villa</option>
              <option value="penthouse">Penthouse</option>
              <option value="terrain">Terrain</option>
              <option value="bureau">Bureau</option>
            </select>
            <svg
              className="select-chevron"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#64748b"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>

          {/* Budget Select */}
          <div className="urbanet-field-wrapper field-select">
            <select
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="urbanet-select"
            >
              <option value="">Budget illimité</option>
              <option value="1000000">&lt; 1.000.000 MAD</option>
              <option value="3000000">&lt; 3.000.000 MAD</option>
              <option value="5000000">&lt; 5.000.000 MAD</option>
              <option value="10000000">&lt; 10.000.000 MAD</option>
            </select>
            <svg
              className="select-chevron"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#64748b"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>

          {/* Search Button */}
          <button type="submit" className="urbanet-btn-search">
            Rechercher
          </button>
        </form>
      </div>
    </div>
  );
};

export default SearchBar;
