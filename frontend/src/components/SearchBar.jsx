import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchBar = ({ initialValues = {} }) => {
  const navigate = useNavigate();
  const [transactionType, setTransactionType] = useState(
    initialValues.purpose === 'RENT' ? 'rent' : 'buy'
  );
  const [keyword, setKeyword] = useState(initialValues.keyword || '');
  const [city, setCity] = useState(initialValues.city || '');
  const [propertyType, setPropertyType] = useState(initialValues.type || '');
  const [budget, setBudget] = useState(initialValues.maxPrice || '');

  const handleSearch = (e) => {
    e.preventDefault();

    const params = new URLSearchParams();

    // Ville ou mot-clé
    const targetCity = city.trim() || keyword.trim();
    if (targetCity) {
      params.set('city', targetCity);
    }

    // Type de bien
    if (propertyType) {
      params.set('type', propertyType.toUpperCase());
    }

    // Objectif (Vente / Location)
    const purpose = transactionType === 'rent' ? 'RENT' : 'SALE';
    params.set('purpose', purpose);

    // Budget max
    if (budget) {
      params.set('maxPrice', budget);
    }

    const queryString = params.toString();
    navigate(queryString ? `/properties?${queryString}` : '/properties');
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
              placeholder="Quartier, mot-clé..."
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
              <option value="Casablanca">Casablanca</option>
              <option value="Marrakech">Marrakech</option>
              <option value="Rabat">Rabat</option>
              <option value="Tanger">Tanger</option>
              <option value="Agadir">Agadir</option>
              <option value="Fès">Fès</option>
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
              <option value="APARTMENT">Appartement</option>
              <option value="VILLA">Villa</option>
              <option value="HOUSE">Maison</option>
              <option value="OFFICE">Bureau</option>
              <option value="COMMERCIAL">Local commercial</option>
              <option value="LAND">Terrain</option>
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
              <option value="">Budget max (Tout)</option>
              <option value="500000">&lt; 500 000 MAD</option>
              <option value="1000000">&lt; 1 000 000 MAD</option>
              <option value="2000000">&lt; 2 000 000 MAD</option>
              <option value="3000000">&lt; 3 000 000 MAD</option>
              <option value="5000000">&lt; 5 000 000 MAD</option>
              <option value="10000000">&lt; 10 000 000 MAD</option>
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
