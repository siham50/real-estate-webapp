import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl, DEFAULT_PLACEHOLDER_IMAGE } from '../utils/imageUtils';

export const TYPE_TRANSLATIONS = {
  VILLA: 'Villa',
  APARTMENT: 'Appartement',
  HOUSE: 'Maison',
  OFFICE: 'Bureau',
  COMMERCIAL: 'Local commercial',
  LAND: 'Terrain',
};

// Exporter pour compatibilité
export { getImageUrl, DEFAULT_PLACEHOLDER_IMAGE };
export const resolveImageUrl = getImageUrl;

/**
 * Récupère la liste des images résolues du bien (image principale en premier).
 */
export const getPropertyImages = (property) => {
  if (!property) return [DEFAULT_PLACEHOLDER_IMAGE];

  let displayImage = null;
  if (property.images && property.images.length > 0) {
    // Cherche spécifiquement l'image qui a isPrimary = true
    const primaryImg = property.images.find((img) => img.isPrimary === true || img.primary === true);
    // Si elle n'existe pas (bug), prend la première par défaut
    displayImage = primaryImg ? primaryImg : property.images[0];
    const others = property.images.filter((img) => img !== displayImage);
    const ordered = [displayImage, ...others];

    const list = ordered
      .map((img) => {
        const path = typeof img === 'string' ? img : img?.imageUrl;
        return getImageUrl(path);
      })
      .filter(Boolean);

    if (list.length > 0) return list;
  }

  if (property.image) return [getImageUrl(property.image)];
  return [DEFAULT_PLACEHOLDER_IMAGE];
};

const formatPrice = (price, purpose) => {
  if (!price && price !== 0) return 'Prix sur demande';
  const num = Number(price);
  const formatted = num.toLocaleString('fr-FR');
  return purpose === 'RENT' ? `${formatted} MAD / mois` : `${formatted} MAD`;
};

const PropertyCard = ({
  property,
  isFav = false,
  onToggleFav,
  residenceName,
  showTypeTag = true,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!property) return null;

  // Logique stricte pour la récupération de l'image principale
  let displayImage = null;
  if (property.images && property.images.length > 0) {
    // Cherche spécifiquement l'image qui a isPrimary = true
    const primaryImg = property.images.find((img) => img.isPrimary === true || img.primary === true);
    // Si elle n'existe pas (bug), prend la première par défaut
    displayImage = primaryImg ? primaryImg : property.images[0];
  }
  const imageSrc = displayImage
    ? getImageUrl(displayImage.imageUrl || displayImage)
    : (property.image ? getImageUrl(property.image) : DEFAULT_PLACEHOLDER_IMAGE);

  // Ordonne les images pour le carrousel (image principale isPrimary en premier)
  const images = useMemo(() => {
    if (!property.images || property.images.length === 0) return [];

    const primaryImg = property.images.find((img) => img.isPrimary === true || img.primary === true);
    const chosenFirst = primaryImg ? primaryImg : property.images[0];
    const others = property.images.filter((img) => img !== chosenFirst);
    const ordered = [chosenFirst, ...others];

    return ordered
      .map((img) => {
        const path = typeof img === 'string' ? img : img?.imageUrl;
        return getImageUrl(path);
      })
      .filter(Boolean);
  }, [property.images]);

  const totalImages = images.length;
  const activeIndex = totalImages > 0 ? currentIndex % totalImages : 0;

  // Si des images existent, affiche l'image de l'index courant (débute par la principale), sinon l'image par défaut
  const currentImageSrc = totalImages > 0 ? images[activeIndex] : imageSrc;

  // 3. Flèches de défilement (Carrousel)
  const handlePrev = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (totalImages <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + totalImages) % totalImages);
  };

  const handleNext = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (totalImages <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % totalImages);
  };

  // Affichages textuels & métadonnées
  const tag =
    property.tag || (property.purpose === 'RENT' ? 'À louer' : 'À vendre');
  const typeLabel =
    TYPE_TRANSLATIONS[property.type] || property.type || 'Bien';
  const priceDisplay =
    property.formattedPrice || formatPrice(property.price, property.purpose);
  const locationDisplay =
    property.location ||
    [property.address, property.city].filter(Boolean).join(', ') ||
    property.city ||
    'Maroc';

  const bedsDisplay =
    property.beds ||
    (property.bedrooms
      ? `${property.bedrooms} ch.`
      : property.surfaceArea
      ? `${Math.max(1, Math.round(property.surfaceArea / 55))} ch.`
      : '3 ch.');

  const bathsDisplay =
    property.baths ||
    (property.bathrooms
      ? `${property.bathrooms} sdb`
      : property.surfaceArea
      ? `${Math.max(1, Math.round(property.surfaceArea / 75))} sdb`
      : '2 sdb');

  const areaDisplay =
    property.area ||
    (property.surfaceArea
      ? `${property.surfaceArea} m²`
      : 'Superficie non précisée');

  const viewsDisplay =
    property.views != null
      ? typeof property.views === 'number'
        ? `${property.views} vues`
        : property.views
      : null;

  const effectiveResidenceName =
    residenceName || property.residence?.name || null;

  const agencyName =
    property.agency ||
    (property.owner
      ? `${property.owner.firstName || ''} ${property.owner.lastName || ''}`.trim() ||
        property.owner.email
      : 'Propriétaire vérifié');

  return (
    <article className="urbanet-property-card">
      {/* Media Header avec Carrousel */}
      <div className="property-media-wrapper">
        <img
          src={currentImageSrc}
          alt={property.title || 'Propriété'}
          className="property-img"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = DEFAULT_PLACEHOLDER_IMAGE;
          }}
        />

        {/* Boutons fléchés < et > (visibles au survol) */}
        {totalImages > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="property-carousel-btn property-carousel-btn-prev"
              aria-label="Image précédente"
              title="Précédent"
            >
              &lt;
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="property-carousel-btn property-carousel-btn-next"
              aria-label="Image suivante"
              title="Suivant"
            >
              &gt;
            </button>
            <span className="property-carousel-counter">
              {activeIndex + 1} / {totalImages}
            </span>
          </>
        )}

        {/* Badges d'état & type */}
        <span className="property-badge">{tag}</span>

        <div className="property-media-badges-bottom">
          {showTypeTag && property.type && (
            <span className="property-type-tag">{typeLabel}</span>
          )}

          {/* Badge Résidence si associé */}
          {effectiveResidenceName && (
            <span
              className="property-residence-badge"
              title={`Résidence : ${effectiveResidenceName}`}
            >
              🏢 {effectiveResidenceName}
            </span>
          )}
        </div>

        {/* Bouton Favoris */}
        {onToggleFav && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleFav(property.id);
            }}
            className={`property-fav-btn ${isFav ? 'is-active' : ''}`}
            aria-label="Ajouter aux favoris"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill={isFav ? '#ef4444' : 'none'}
              stroke={isFav ? '#ef4444' : '#0f172a'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        )}
      </div>

      {/* Card Body */}
      <div className="property-body">
        <div className="property-price">{priceDisplay}</div>
        <h3 className="property-title" title={property.title}>
          <Link
            to={`/properties/${property.id}`}
            style={{ color: 'inherit', textDecoration: 'none' }}
          >
            {property.title}
          </Link>
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
          <span className="spec-item" title="Chambres">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 4v16" />
              <path d="M2 8h18a2 2 0 0 1 2 2v10" />
              <path d="M2 17h20" />
              <path d="M6 8v9" />
            </svg>
            {bedsDisplay}
          </span>
          <span className="spec-item" title="Salles de bain">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 6h11a2 2 0 0 1 2 2v2a4 4 0 0 1-4 4H9V6z" />
              <path d="M4 12v6" />
              <path d="M2 18h20" />
            </svg>
            {bathsDisplay}
          </span>
          <span className="spec-item" title="Superficie">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 3 21 3 21 9" />
              <polyline points="9 21 3 21 3 15" />
              <line x1="21" y1="3" x2="14" y2="10" />
              <line x1="3" y1="21" x2="10" y2="14" />
            </svg>
            {areaDisplay}
          </span>
          {viewsDisplay && (
            <span className="spec-item" title="Consultations">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              {viewsDisplay}
            </span>
          )}
        </div>

        {/* Card Footer */}
        <div className="property-footer">
          <span
            className="property-agency"
            title={`Annonce proposée par ${agencyName}`}
          >
            {agencyName}
          </span>
          <Link
            to={`/properties/${property.id}`}
            className="property-link property-link-btn"
            style={{ textDecoration: 'none' }}
          >
            Voir le bien →
          </Link>
        </div>
      </div>
    </article>
  );
};

export default PropertyCard;
