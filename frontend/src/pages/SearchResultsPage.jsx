import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PropertyCard from '../components/PropertyCard';
import { searchProperties } from '../services/api';
import { TYPE_TRANSLATIONS } from '../components/FeaturedProperties';
import { MOROCCAN_CITIES } from '../components/SearchBar';

const CITIES_LIST = MOROCCAN_CITIES;

const SearchResultsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filtres actifs issus de l'URL
  const cityParam = searchParams.get('city') || '';
  const typeParam = searchParams.get('type') || '';
  const purposeParam = searchParams.get('purpose') || '';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';

  // État local du formulaire de la sidebar
  const [cityInput, setCityInput] = useState(cityParam);
  const [typeInput, setTypeInput] = useState(typeParam);
  const [purposeInput, setPurposeInput] = useState(purposeParam);
  const [minPriceInput, setMinPriceInput] = useState(minPriceParam);
  const [maxPriceInput, setMaxPriceInput] = useState(maxPriceParam);

  // Synchronisation des champs du formulaire lorsque l'URL change (ex: bouton retour du navigateur)
  useEffect(() => {
    setCityInput(cityParam);
    setTypeInput(typeParam);
    setPurposeInput(purposeParam);
    setMinPriceInput(minPriceParam);
    setMaxPriceInput(maxPriceParam);
  }, [cityParam, typeParam, purposeParam, minPriceParam, maxPriceParam]);

  // État des données
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Appel de l'API de recherche lorsque les filtres dans l'URL changent
  const fetchSearchResults = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await searchProperties({
        city: cityParam,
        type: typeParam,
        purpose: purposeParam,
        minPrice: minPriceParam,
        maxPrice: maxPriceParam,
      });

      if (Array.isArray(data)) {
        setProperties(data);
      } else {
        setProperties([]);
      }
    } catch (err) {
      setError(err.message || 'Impossible de récupérer les résultats de recherche.');
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, [cityParam, typeParam, purposeParam, minPriceParam, maxPriceParam]);

  useEffect(() => {
    fetchSearchResults();
  }, [fetchSearchResults]);

  // Soumission du filtre depuis la sidebar
  const handleApplyFilters = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams();

    if (cityInput.trim()) newParams.set('city', cityInput.trim());
    if (typeInput.trim()) newParams.set('type', typeInput.trim().toUpperCase());
    if (purposeInput.trim()) newParams.set('purpose', purposeInput.trim().toUpperCase());
    if (minPriceInput) newParams.set('minPrice', minPriceInput);
    if (maxPriceInput) newParams.set('maxPrice', maxPriceInput);

    setSearchParams(newParams);
  };

  // Réinitialisation de tous les filtres
  const handleResetFilters = () => {
    setCityInput('');
    setTypeInput('');
    setPurposeInput('');
    setMinPriceInput('');
    setMaxPriceInput('');
    setSearchParams({});
  };

  // Suppression d'un filtre unitaire (via badge)
  const handleRemoveFilter = (filterKey) => {
    const updated = new URLSearchParams(searchParams);
    updated.delete(filterKey);
    setSearchParams(updated);
  };

  // Résumé des filtres actifs
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (cityParam) count++;
    if (typeParam) count++;
    if (purposeParam) count++;
    if (minPriceParam) count++;
    if (maxPriceParam) count++;
    return count;
  }, [cityParam, typeParam, purposeParam, minPriceParam, maxPriceParam]);

  return (
    <div className="urbanet-app-root">
      <Header />

      <main className="urbanet-main search-results-main">
        <div className="urbanet-container">
          {/* Fil d'Ariane */}
          <div className="property-details-breadcrumb" style={{ margin: '24px 0 16px 0' }}>
            <Link to="/" className="breadcrumb-link">
              Accueil
            </Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Recherche de biens</span>
          </div>

          {/* En-tête de la page de résultats */}
          <div className="search-results-header">
            <div>
              <h1 className="search-results-title">Résultats de recherche</h1>
              <p className="search-results-subtitle">
                {loading
                  ? 'Recherche en cours...'
                  : `${properties.length} bien${properties.length > 1 ? 's' : ''} trouvé${properties.length > 1 ? 's' : ''}`}
                {activeFiltersCount > 0 && (
                  <span className="search-results-filter-count">
                    {' '}• {activeFiltersCount} filtre{activeFiltersCount > 1 ? 's' : ''} actif{activeFiltersCount > 1 ? 's' : ''}
                  </span>
                )}
              </p>
            </div>

            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="btn-clear-all-filters"
              >
                ✕ Tout effacer
              </button>
            )}
          </div>

          {/* Badges des filtres actifs */}
          {activeFiltersCount > 0 && (
            <div className="active-filters-bar">
              {cityParam && (
                <span className="active-filter-chip">
                  Ville : {cityParam}
                  <button type="button" onClick={() => handleRemoveFilter('city')}>×</button>
                </span>
              )}
              {purposeParam && (
                <span className="active-filter-chip">
                  {purposeParam === 'SALE' ? 'À vendre' : 'À louer'}
                  <button type="button" onClick={() => handleRemoveFilter('purpose')}>×</button>
                </span>
              )}
              {typeParam && (
                <span className="active-filter-chip">
                  Type : {TYPE_TRANSLATIONS[typeParam] || typeParam}
                  <button type="button" onClick={() => handleRemoveFilter('type')}>×</button>
                </span>
              )}
              {minPriceParam && (
                <span className="active-filter-chip">
                  Min : {Number(minPriceParam).toLocaleString('fr-FR')} MAD
                  <button type="button" onClick={() => handleRemoveFilter('minPrice')}>×</button>
                </span>
              )}
              {maxPriceParam && (
                <span className="active-filter-chip">
                  Max : {Number(maxPriceParam).toLocaleString('fr-FR')} MAD
                  <button type="button" onClick={() => handleRemoveFilter('maxPrice')}>×</button>
                </span>
              )}
            </div>
          )}

          {/* Layout principal : Sidebar de filtres + Grille de résultats */}
          <div className="search-layout">
            {/* Sidebar de filtres */}
            <aside className="filters-sidebar">
              <div className="filters-sidebar-card">
                <div className="filters-sidebar-header">
                  <h3 className="filters-sidebar-title">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                    </svg>
                    <span>Affiner les filtres</span>
                  </h3>
                  {activeFiltersCount > 0 && (
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="filters-reset-link"
                    >
                      Effacer
                    </button>
                  )}
                </div>

                <form onSubmit={handleApplyFilters} className="filters-sidebar-form">
                  {/* Transaction (Vente / Location) */}
                  <div className="filter-field-group">
                    <label className="filter-label">Transaction</label>
                    <div className="filter-purpose-switch">
                      <button
                        type="button"
                        className={`filter-purpose-btn ${purposeInput === '' ? 'active' : ''}`}
                        onClick={() => setPurposeInput('')}
                      >
                        Tous
                      </button>
                      <button
                        type="button"
                        className={`filter-purpose-btn ${purposeInput === 'SALE' ? 'active' : ''}`}
                        onClick={() => setPurposeInput('SALE')}
                      >
                        Achat
                      </button>
                      <button
                        type="button"
                        className={`filter-purpose-btn ${purposeInput === 'RENT' ? 'active' : ''}`}
                        onClick={() => setPurposeInput('RENT')}
                      >
                        Location
                      </button>
                    </div>
                  </div>

                  {/* Ville */}
                  <div className="filter-field-group">
                    <label htmlFor="filterCity" className="filter-label">Ville</label>
                    <select
                      id="filterCity"
                      value={cityInput}
                      onChange={(e) => setCityInput(e.target.value)}
                      className="filter-select"
                    >
                      <option value="">Toutes les villes</option>
                      {CITIES_LIST.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* Type de bien */}
                  <div className="filter-field-group">
                    <label htmlFor="filterType" className="filter-label">Type de bien</label>
                    <select
                      id="filterType"
                      value={typeInput}
                      onChange={(e) => setTypeInput(e.target.value)}
                      className="filter-select"
                    >
                      <option value="">Tous les types</option>
                      <option value="APARTMENT">Appartement</option>
                      <option value="VILLA">Villa</option>
                      <option value="HOUSE">Maison</option>
                      <option value="OFFICE">Bureau</option>
                      <option value="COMMERCIAL">Local commercial</option>
                      <option value="LAND">Terrain</option>
                    </select>
                  </div>

                  {/* Budget : Min et Max */}
                  <div className="filter-field-group">
                    <label className="filter-label">Fourchette de prix (MAD)</label>
                    <div className="filter-price-inputs">
                      <input
                        type="number"
                        placeholder="Min"
                        value={minPriceInput}
                        onChange={(e) => setMinPriceInput(e.target.value)}
                        className="filter-input filter-input-price"
                        min="0"
                      />
                      <span className="price-separator">-</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={maxPriceInput}
                        onChange={(e) => setMaxPriceInput(e.target.value)}
                        className="filter-input filter-input-price"
                        min="0"
                      />
                    </div>
                  </div>

                  {/* Boutons d'action */}
                  <button type="submit" className="urbanet-btn-primary btn-apply-filters">
                    Appliquer les filtres
                  </button>
                </form>
              </div>
            </aside>

            {/* Zone de résultats */}
            <section className="search-results-content">
              {/* Chargement */}
              {loading && (
                <div className="search-loading-state">
                  <div className="urbanet-spinner" />
                  <p>Recherche des biens correspondants...</p>
                </div>
              )}

              {/* Erreur */}
              {!loading && error && (
                <div className="search-error-state">
                  <div className="error-icon">⚠️</div>
                  <h3>Une erreur est survenue</h3>
                  <p>{error}</p>
                  <button
                    type="button"
                    onClick={fetchSearchResults}
                    className="urbanet-btn-primary"
                    style={{ marginTop: '12px' }}
                  >
                    Réessayer
                  </button>
                </div>
              )}

              {/* Aucun résultat */}
              {!loading && !error && properties.length === 0 && (
                <div className="search-empty-state">
                  <div className="empty-state-icon">🔍</div>
                  <h3 className="empty-state-title">Aucun bien ne correspond à vos critères.</h3>
                  <p className="empty-state-desc">
                    Essayez d'élargir votre recherche en modifiant la ville, le type de bien ou en augmentant le budget maximal.
                  </p>
                  {activeFiltersCount > 0 && (
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="urbanet-btn-primary"
                      style={{ marginTop: '16px' }}
                    >
                      Réinitialiser tous les filtres
                    </button>
                  )}
                </div>
              )}

              {/* Grille des biens */}
              {!loading && !error && properties.length > 0 && (
                <div className="urbanet-properties-grid search-grid">
                  {properties.map((item) => (
                    <PropertyCard key={item.id} property={item} />
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SearchResultsPage;

