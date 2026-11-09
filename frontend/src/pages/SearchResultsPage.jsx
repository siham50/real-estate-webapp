import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { searchProperties } from '../services/api';
import { TYPE_IMAGES, TYPE_TRANSLATIONS } from '../components/FeaturedProperties';

const FALLBACK_DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=900&q=80';

const CITIES_LIST = [
  'Casablanca',
  'Marrakech',
  'Rabat',
  'Tanger',
  'Agadir',
  'Fès',
  'Meknès',
  'Oujda',
  'Kénitra',
  'Tétouan',
  'Mohammedia',
  'El Jadida',
];

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

  // Image d'une propriété (résolution de fallback)
  const getPropertyImage = (item) => {
    if (item.images && item.images.length > 0 && item.images[0].imageUrl) {
      const img = item.images[0].imageUrl;
      if (img.startsWith('http://') || img.startsWith('https://')) return img;
      return `http://localhost:8080${img.startsWith('/') ? img : `/${img}`}`;
    }
    if (item.type && TYPE_IMAGES[item.type] && TYPE_IMAGES[item.type].length > 0) {
      return TYPE_IMAGES[item.type][0];
    }
    return FALLBACK_DEFAULT_IMAGE;
  };

  // Formatage du prix
  const formatPrice = (price, purpose) => {
    if (!price && price !== 0) return 'Prix sur demande';
    const num = Number(price);
    const formatted = num.toLocaleString('fr-FR');
    return purpose === 'RENT' ? `${formatted} MAD / mois` : `${formatted} MAD`;
  };

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
                    <div className="filter-input-wrap">
                      <input
                        id="filterCity"
                        type="text"
                        list="moroccan-cities"
                        placeholder="Ex: Casablanca, Marrakech..."
                        value={cityInput}
                        onChange={(e) => setCityInput(e.target.value)}
                        className="filter-input"
                      />
                      <datalist id="moroccan-cities">
                        {CITIES_LIST.map((c) => (
                          <option key={c} value={c} />
                        ))}
                      </datalist>
                    </div>
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
                  {properties.map((item) => {
                    const imageSrc = getPropertyImage(item);
                    const tag = item.purpose === 'RENT' ? 'À louer' : 'À vendre';
                    const typeLabel = TYPE_TRANSLATIONS[item.type] || item.type || 'Bien';
                    const priceDisplay = formatPrice(item.price, item.purpose);
                    const locationDisplay = [item.address, item.city].filter(Boolean).join(', ') || item.city || 'Maroc';
                    const bedsDisplay = item.surfaceArea ? `${Math.max(1, Math.round(item.surfaceArea / 55))} ch.` : '3 ch.';
                    const bathsDisplay = item.surfaceArea ? `${Math.max(1, Math.round(item.surfaceArea / 75))} sdb` : '2 sdb';
                    const areaDisplay = item.surfaceArea ? `${item.surfaceArea} m²` : 'Superficie non précisée';
                    const agencyName = item.owner
                      ? `${item.owner.firstName || ''} ${item.owner.lastName || ''}`.trim() || item.owner.email
                      : 'Propriétaire vérifié';

                    return (
                      <article key={item.id} className="urbanet-property-card">
                        {/* Media Header */}
                        <div className="property-media-wrapper">
                          <img
                            src={imageSrc}
                            alt={item.title}
                            className="property-img"
                            loading="lazy"
                          />
                          <span className="property-badge">{tag}</span>

                          {item.type && (
                            <span className="property-type-tag">
                              {typeLabel}
                            </span>
                          )}
                        </div>

                        {/* Card Body */}
                        <div className="property-body">
                          <div className="property-price">{priceDisplay}</div>
                          <h3 className="property-title" title={item.title}>
                            {item.title}
                          </h3>

                          <div className="property-location">
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#94a3b8"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                            <span>{locationDisplay}</span>
                          </div>

                          {/* Caractéristiques */}
                          <div className="property-specs">
                            <span className="spec-item" title="Chambres estimées">
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M2 4v16" />
                                <path d="M2 8h18a2 2 0 0 1 2 2v10" />
                                <path d="M2 17h20" />
                                <path d="M6 8v9" />
                              </svg>
                              {bedsDisplay}
                            </span>
                            <span className="spec-item" title="Salles de bain estimées">
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 6h11a2 2 0 0 1 2 2v2a4 4 0 0 1-4 4H9V6z" />
                                <path d="M4 12v6" />
                                <path d="M2 18h20" />
                              </svg>
                              {bathsDisplay}
                            </span>
                            <span className="spec-item" title="Superficie">
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 3 21 3 21 9" />
                                <polyline points="9 21 3 21 3 15" />
                                <line x1="21" y1="3" x2="14" y2="10" />
                                <line x1="3" y1="21" x2="10" y2="14" />
                              </svg>
                              {areaDisplay}
                            </span>
                          </div>

                          {/* Card Footer */}
                          <div className="property-footer">
                            <span className="property-agency" title={`Annonce proposée par ${agencyName}`}>
                              {agencyName}
                            </span>
                            <Link
                              to={`/properties/${item.id}`}
                              className="property-link property-link-btn"
                              style={{ textDecoration: 'none' }}
                            >
                              Voir le bien →
                            </Link>
                          </div>
                        </div>
                      </article>
                    );
                  })}
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

