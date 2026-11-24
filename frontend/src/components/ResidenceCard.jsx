import React, { useState, useMemo } from 'react';
import { getImageUrl, DEFAULT_PLACEHOLDER_IMAGE } from '../utils/imageUtils';

const ResidenceCard = ({ residence, propertiesCount = 0, onSelect }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!residence) return null;

  // Logique stricte pour la récupération de l'image principale
  let displayImage = null;
  if (residence.images && residence.images.length > 0) {
    // Cherche spécifiquement l'image qui a isPrimary = true
    const primaryImg = residence.images.find((img) => img.isPrimary === true || img.primary === true);
    // Si elle n'existe pas (bug), prend la première par défaut
    displayImage = primaryImg ? primaryImg : residence.images[0];
  }
  const imageSrc = displayImage
    ? getImageUrl(displayImage.imageUrl || displayImage)
    : (residence.image ? getImageUrl(residence.image) : DEFAULT_PLACEHOLDER_IMAGE);

  // Ordonne les images pour le carrousel (image principale isPrimary en premier)
  const images = useMemo(() => {
    if (!residence.images || residence.images.length === 0) return [];

    const primaryImg = residence.images.find((img) => img.isPrimary === true || img.primary === true);
    const chosenFirst = primaryImg ? primaryImg : residence.images[0];
    const others = residence.images.filter((img) => img !== chosenFirst);
    const ordered = [chosenFirst, ...others];

    return ordered
      .map((img) => {
        const path = typeof img === 'string' ? img : img?.imageUrl;
        return getImageUrl(path);
      })
      .filter(Boolean);
  }, [residence.images]);

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

  const agencyName =
    residence.agency ||
    (residence.owner
      ? `${residence.owner.firstName || ''} ${residence.owner.lastName || ''}`.trim() ||
        residence.owner.email
      : 'Agence partenaire');

  return (
    <article className="urbanet-property-card urbanet-residence-card">
      {/* Media Header avec Carrousel */}
      <div className="property-media-wrapper">
        <img
          src={currentImageSrc}
          alt={residence.name || 'Résidence'}
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

        <span className="property-badge badge-residence-pill">
          {residence.badge || 'Programme Agence'}
        </span>
        <span className="residence-units-badge">
          {propertiesCount > 0
            ? `${propertiesCount} bien(s) lié(s)`
            : 'Nouveau complexe'}
        </span>
      </div>

      {/* Body */}
      <div className="property-body">
        <div className="residence-city-tag">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span>{residence.city || 'Maroc'}</span>
        </div>

        <h3 className="residence-title">{residence.name}</h3>

        <div className="property-location residence-address">
          <span>{residence.address || `${residence.city || 'Maroc'}`}</span>
        </div>

        <p className="residence-description">
          {residence.description ||
            'Résidence contemporaine offrant prestations de qualité supérieure et cadre de vie privilégié.'}
        </p>

        {/* Card Footer */}
        <div className="property-footer residence-footer">
          <div className="residence-agency-info">
            <span className="agency-label">Promoteur / Agence :</span>
            <span className="property-agency">{agencyName}</span>
          </div>
          {onSelect && (
            <button
              type="button"
              onClick={() => onSelect(residence)}
              className="residence-explore-link"
            >
              Découvrir →
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

export default ResidenceCard;

