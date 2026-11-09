import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getPropertyById,
  getAvailabilitiesByOwner,
  createBooking,
  getReviewsByTargetUser,
  incrementPropertyViews,
} from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PropertyMap from '../components/property/PropertyMap';
import LoanCalculator from '../components/property/LoanCalculator';
import ContactOwnerButton from '../components/property/ContactOwnerButton';
import ReportModal from '../components/property/ReportModal';
import {
  DEFAULT_PROPERTIES,
  TYPE_IMAGES,
  TYPE_TRANSLATIONS,
} from '../components/FeaturedProperties';

const FALLBACK_DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80';

const PropertyDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  // État du bien immobilier
  const [property, setProperty] = useState(null);
  const [loadingProperty, setLoadingProperty] = useState(true);
  const [propertyError, setPropertyError] = useState(null);

  // État des avis sur le propriétaire
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // État des créneaux de disponibilité
  const [availabilities, setAvailabilities] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState(null);
  const [selectedSlotId, setSelectedSlotId] = useState('');

  // État de la modale de signalement
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // État de la réservation
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingSuccessData, setBookingSuccessData] = useState(null);
  const [bookingError, setBookingError] = useState(null);

  // 1. Chargement des informations du bien
  useEffect(() => {
    let isMounted = true;
    const fetchProperty = async () => {
      setLoadingProperty(true);
      setPropertyError(null);
      try {
        const data = await getPropertyById(id);
        if (isMounted) {
          setProperty(data);
        }
      } catch (err) {
        // En cas d'échec ou 404 (ex: propriétés mock 1, 2, 3), recherche dans DEFAULT_PROPERTIES
        const fallback = DEFAULT_PROPERTIES.find(
          (p) => String(p.id) === String(id)
        );
        if (fallback && isMounted) {
          setProperty({
            id: fallback.id,
            title: fallback.title,
            description: fallback.description,
            price: fallback.price,
            city: fallback.location?.split(',')[1]?.trim() || 'Casablanca',
            address: fallback.location?.split(',')[0]?.trim() || '',
            type: fallback.type || 'VILLA',
            purpose: fallback.purpose || 'SALE',
            surfaceArea: parseInt(fallback.area, 10) || 200,
            latitude: fallback.latitude || 33.5731,
            longitude: fallback.longitude || -7.5898,
            image: fallback.image,
            owner: {
              id: 1,
              firstName: fallback.agency || 'Atlas',
              lastName: 'Immobilier',
              email: 'contact@urbanet.immo',
              role: 'PROFESSIONAL',
            },
          });
        } else if (isMounted) {
          setPropertyError(
            err.message || "Impossible de charger les détails de cette propriété."
          );
        }
      } finally {
        if (isMounted) setLoadingProperty(false);
      }
    };

    if (id) {
      fetchProperty();
    }
  }, [id]);

  // Incrémentation du compteur de vues (appelé une seule fois au chargement de la page)
  useEffect(() => {
    if (id) {
      incrementPropertyViews(id)
        .then((updated) => {
          if (updated && updated.views != null) {
            setProperty((prev) => (prev ? { ...prev, views: updated.views } : prev));
          }
        })
        .catch(() => {
          // Silencieux pour ne pas perturber l'expérience utilisateur
        });
    }
  }, [id]);

  // Récupération de l'identifiant du propriétaire
  const ownerId = useMemo(() => {
    if (!property) return null;
    return property.owner?.id || property.ownerId || (typeof property.owner === 'number' ? property.owner : 1);
  }, [property]);

  // 2. Chargement des créneaux libres de l'agence / propriétaire
  const fetchAvailableSlots = async (oId) => {
    if (!oId) return;
    setLoadingSlots(true);
    setSlotsError(null);
    try {
      const data = await getAvailabilitiesByOwner(oId);
      if (Array.isArray(data)) {
        // Ne garder que les créneaux libres (isBooked === false)
        const free = data.filter((slot) => slot.isBooked === false || !slot.isBooked);
        setAvailabilities(free);
      } else {
        setAvailabilities([]);
      }
    } catch (err) {
      // Si l'endpoint ne retourne rien ou échoue, ne pas bloquer l'affichage
      setSlotsError("Impossible de charger les créneaux pour le moment.");
      setAvailabilities([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    if (ownerId && isAuthenticated) {
      fetchAvailableSlots(ownerId);
    }
  }, [ownerId, isAuthenticated]);

  // 3. Chargement des avis sur le propriétaire
  useEffect(() => {
    const fetchReviews = async () => {
      if (!ownerId) return;
      setLoadingReviews(true);
      try {
        const data = await getReviewsByTargetUser(ownerId);
        setReviews(Array.isArray(data) ? data : []);
      } catch (err) {
        setReviews([]);
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [ownerId]);

  // Moyenne des notes des avis
  const averageRating = useMemo(() => {
    if (!reviews || reviews.length === 0) return null;
    const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  // Formatage du prix
  const formattedPrice = useMemo(() => {
    if (!property || property.price === undefined || property.price === null) return 'Prix sur demande';
    const num = Number(property.price);
    const formatted = num.toLocaleString('fr-FR');
    if (property.purpose === 'RENT') {
      return `${formatted} MAD / mois`;
    }
    return `${formatted} MAD`;
  }, [property]);

  // Nom complet du propriétaire
  const ownerName = useMemo(() => {
    if (!property) return 'Propriétaire Urbanet';
    if (property.owner && typeof property.owner === 'object') {
      const name = `${property.owner.firstName || ''} ${property.owner.lastName || ''}`.trim();
      return name || property.owner.email || 'Propriétaire Urbanet';
    }
    if (property.agency) return property.agency;
    return 'Propriétaire Urbanet';
  }, [property]);

  // Vérifie si l'utilisateur connecté peut signaler l'annonce (connecté et non-propriétaire)
  const canReport = useMemo(() => {
    if (!isAuthenticated || !user?.id || !property) return false;
    const realOwnerId =
      property.owner?.id ||
      property.ownerId ||
      (typeof property.owner === 'number' ? property.owner : null);
    if (!realOwnerId) return false;
    return user.id !== realOwnerId;
  }, [isAuthenticated, user, property]);

  // Image d'affichage principale
  const propertyHeroImage = useMemo(() => {
    if (!property) return FALLBACK_DEFAULT_IMAGE;
    if (property.image) return property.image;
    if (property.documents && property.documents.length > 0) {
      const imgDoc = property.documents.find(
        (d) => d.documentType === 'PHOTO' || (d.documentUrl && d.documentUrl.match(/\.(jpeg|jpg|png|webp)/i))
      );
      if (imgDoc?.documentUrl) return imgDoc.documentUrl;
    }
    if (property.type && TYPE_IMAGES[property.type]) {
      return TYPE_IMAGES[property.type][0];
    }
    return FALLBACK_DEFAULT_IMAGE;
  }, [property]);

  // Créneau sélectionné objet
  const selectedSlot = useMemo(() => {
    if (!selectedSlotId) return null;
    return availabilities.find((s) => String(s.id) === String(selectedSlotId)) || null;
  }, [selectedSlotId, availabilities]);

  // Soumission de la réservation
  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!isAuthenticated || !user?.id) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    if (!selectedSlotId) {
      setBookingError('Veuillez sélectionner un créneau de visite.');
      return;
    }

    setBookingLoading(true);
    setBookingError(null);

    const payload = {
      clientId: user.id,
      propertyId: Number(id),
      availabilityId: Number(selectedSlotId),
    };

    try {
      const res = await createBooking(payload);
      setBookingSuccess(true);
      setBookingSuccessData(res || { slot: selectedSlot });
      // Rafraîchir les créneaux pour retirer celui qui vient d'être réservé
      if (ownerId) {
        fetchAvailableSlots(ownerId);
      }
    } catch (err) {
      setBookingError(err.message || 'Une erreur est survenue lors de la réservation.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleResetBooking = () => {
    setBookingSuccess(false);
    setSelectedSlotId('');
    setBookingError(null);
  };

  const formatSlotDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('fr-FR', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatSlotTime = (timeStr) => {
    if (!timeStr) return '';
    return String(timeStr).substring(0, 5);
  };

  return (
    <div className="urbanet-app-root">
      <Header />

      <main className="urbanet-details-page-wrapper">
        <div className="urbanet-container">
          {/* Navigation fil d'Ariane */}
          <div className="property-details-breadcrumb">
            <Link to="/" className="breadcrumb-link">
              Accueil
            </Link>
            <span className="breadcrumb-separator">/</span>
            <Link to="/#annonces" className="breadcrumb-link">
              Annonces
            </Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">
              {property?.title || 'Détails du bien'}
            </span>
          </div>

          {/* État de chargement initial */}
          {loadingProperty && (
            <div className="property-details-loading-state">
              <div className="urbanet-spinner" />
              <p>Chargement des détails du bien...</p>
            </div>
          )}

          {/* État d'erreur du bien */}
          {!loadingProperty && propertyError && (
            <div className="property-details-error-card">
              <div className="error-icon">⚠️</div>
              <h2>Bien introuvable</h2>
              <p>{propertyError}</p>
              <Link to="/" className="urbanet-btn-primary">
                Retour à l'accueil
              </Link>
            </div>
          )}

          {/* Contenu principal */}
          {!loadingProperty && property && (
            <div className="property-details-grid-layout">
              {/* Colonne Gauche : Infos du bien */}
              <div className="property-details-main-column">
                {/* En-tête du bien */}
                <div className="property-details-header">
                  <div className="property-details-tags">
                    <span className="details-tag-purpose">
                      {property.purpose === 'RENT' ? 'À Louer' : 'À Vendre'}
                    </span>
                    <span className="details-tag-type">
                      {TYPE_TRANSLATIONS[property.type] || property.type || 'Bien Immobilier'}
                    </span>
                    <span className="details-tag-verified">
                      ✓ Vérifié Urbanet
                    </span>
                    <span
                      className="details-tag-views"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        background: '#f1f5f9',
                        color: '#334155',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                      }}
                      title="Nombre de vues de cette annonce"
                    >
                      <span>👁️</span>
                      <span>
                        {property.views != null ? property.views : 0}{' '}
                        {(property.views || 0) === 1 ? 'vue' : 'vues'}
                      </span>
                    </span>
                  </div>

                  <h1 className="property-details-title">{property.title}</h1>

                  <div className="property-details-location-row">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#64748b"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span>
                      {property.address ? `${property.address}, ` : ''}
                      {property.city || 'Maroc'}
                    </span>
                  </div>

                  <div className="property-details-price-banner">
                    <span className="price-label">Prix demandé</span>
                    <div className="property-details-price-value">{formattedPrice}</div>
                  </div>
                </div>

                {/* Galerie / Image Showcase */}
                <div className="property-details-hero-gallery">
                  <img
                    src={propertyHeroImage}
                    alt={property.title}
                    className="property-details-hero-img"
                  />
                  <div className="hero-img-badge-overlay">
                    <span>Photos certifiées haute résolution</span>
                  </div>
                </div>

                {/* Grille des caractéristiques clés */}
                <div className="property-specs-grid-cards">
                  <div className="spec-card-box">
                    <div className="spec-card-icon">🏠</div>
                    <div className="spec-card-content">
                      <span className="spec-card-label">Type de bien</span>
                      <strong className="spec-card-value">
                        {TYPE_TRANSLATIONS[property.type] || property.type || 'Villa'}
                      </strong>
                    </div>
                  </div>

                  <div className="spec-card-box">
                    <div className="spec-card-icon">📐</div>
                    <div className="spec-card-content">
                      <span className="spec-card-label">Surface</span>
                      <strong className="spec-card-value">
                        {property.surfaceArea || property.area || '—'} m²
                      </strong>
                    </div>
                  </div>

                  <div className="spec-card-box">
                    <div className="spec-card-icon">📍</div>
                    <div className="spec-card-content">
                      <span className="spec-card-label">Ville</span>
                      <strong className="spec-card-value">{property.city || 'Casablanca'}</strong>
                    </div>
                  </div>

                  <div className="spec-card-box">
                    <div className="spec-card-icon">🏢</div>
                    <div className="spec-card-content">
                      <span className="spec-card-label">Résidence</span>
                      <strong className="spec-card-value">
                        {property.residence?.name || 'Indépendante'}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Description du bien */}
                <div className="property-details-section-card">
                  <h2 className="section-card-title">Description du bien</h2>
                  <div className="property-description-body">
                    {property.description ? (
                      property.description
                        .split('\n')
                        .map((paragraph, index) => (
                          <p key={index}>{paragraph}</p>
                        ))
                    ) : (
                      <p>
                        Superbe opportunité immobilière proposée au cœur de{' '}
                        {property.city || 'la ville'}. Finitions modernes, espace
                        baigné de lumière et agencement pensé pour un confort de
                        vie haut de gamme.
                      </p>
                    )}
                  </div>
                </div>

                {/* Emplacement & Carte Interactive */}
                <PropertyMap
                  latitude={property.latitude}
                  longitude={property.longitude}
                  title={property.title}
                />
                <div className="property-details-section-card owner-section-card">
                  <h2 className="section-card-title">Propriétaire & Gestionnaire</h2>
                  <div className="owner-profile-row">
                    <div className="owner-avatar-circle">
                      {ownerName.charAt(0).toUpperCase()}
                    </div>
                    <div className="owner-profile-meta">
                      <h3 className="owner-profile-name">{ownerName}</h3>
                      <span className="owner-role-tag">
                        {property.owner?.role === 'PROFESSIONAL'
                          ? 'Agence Immobilière Professionnelle'
                          : 'Propriétaire Particulier Vérifié'}
                      </span>
                      <p className="owner-safety-note">
                        🛡️ Compte vérifié et coordonnées protégées par le protocole Urbanet
                      </p>
                    </div>
                  </div>
                  <div className="owner-contact-action-wrapper" style={{ marginTop: '16px' }}>
                    <ContactOwnerButton property={property} />
                  </div>
                </div>

                {/* Section Avis sur le propriétaire */}
                <div className="property-details-section-card reviews-section-card">
                  <div className="reviews-section-header">
                    <div>
                      <h2 className="section-card-title">Avis sur le propriétaire</h2>
                      <p className="reviews-subtitle">
                        Retours d'expérience et notes laissés par les clients ayant visité les biens de {ownerName}.
                      </p>
                    </div>
                    {averageRating && (
                      <div className="average-rating-badge">
                        <span className="avg-num">{averageRating} / 5</span>
                        <span className="avg-star">⭐</span>
                        <span className="avg-count">({reviews.length} avis)</span>
                      </div>
                    )}
                  </div>

                  {loadingReviews ? (
                    <div className="reviews-loading">
                      <div className="urbanet-spinner-sm" />
                      <span>Chargement des avis...</span>
                    </div>
                  ) : reviews.length === 0 ? (
                    <div className="reviews-empty-state">
                      <span className="reviews-empty-icon">⭐</span>
                      <p className="reviews-empty-title">Aucun avis pour le moment</p>
                      <p className="reviews-empty-desc">
                        Soyez le premier à réserver une visite et à partager votre expérience avec ce propriétaire.
                      </p>
                    </div>
                  ) : (
                    <div className="reviews-cards-list">
                      {reviews.map((rev) => {
                        const clientName =
                          rev.clientFirstName && rev.clientLastName
                            ? `${rev.clientFirstName} ${rev.clientLastName}`
                            : rev.client
                            ? `${rev.client.firstName || ''} ${rev.client.lastName || ''}`.trim() || rev.client.email
                            : 'Client Urbanet';

                        return (
                          <div key={rev.id} className="review-card">
                            <div className="review-card-header">
                              <div className="review-client-info">
                                <div className="review-client-avatar">
                                  {clientName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <strong className="review-client-name">{clientName}</strong>
                                  <span className="review-date">
                                    {rev.createdAt
                                      ? new Date(rev.createdAt).toLocaleDateString('fr-FR', {
                                          day: 'numeric',
                                          month: 'short',
                                          year: 'numeric',
                                        })
                                      : 'Visite effectuée'}
                                  </span>
                                </div>
                              </div>

                              <div className="review-stars-display" title={`${rev.rating} sur 5`}>
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <span
                                    key={s}
                                    className={`review-star ${s <= rev.rating ? 'active' : 'inactive'}`}
                                  >
                                    ★
                                  </span>
                                ))}
                                <span className="review-rating-val">{rev.rating}/5</span>
                              </div>
                            </div>

                            {rev.comment && (
                              <p className="review-comment-text">"{rev.comment}"</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Bouton discret de signalement d'annonce */}
                {canReport && (
                  <div
                    className="report-ad-container"
                    style={{
                      marginTop: '20px',
                      padding: '14px 18px',
                      background: '#f8fafc',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '10px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#64748b',
                        fontSize: '0.88rem',
                      }}
                    >
                      <span>Vous avez constaté un problème avec cette annonce ?</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsReportModalOpen(true)}
                      style={{
                        background: 'transparent',
                        border: '1px solid #cbd5e1',
                        color: '#64748b',
                        padding: '6px 14px',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#ef4444';
                        e.currentTarget.style.borderColor = '#ef4444';
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.06)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#64748b';
                        e.currentTarget.style.borderColor = '#cbd5e1';
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <span role="img" aria-label="signaler">🚩</span>
                      <span>Signaler cette annonce</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Colonne Droite : Widget de Réservation de Visite */}
              <aside className="property-details-sidebar-column">
                <div className="urbanet-booking-sticky-widget">
                  <div className="booking-widget-header">
                    <div className="booking-widget-header-badge">
                      <span>🗓️ Visite sur place</span>
                    </div>
                    <h3 className="booking-widget-title">Réserver une visite</h3>
                    <p className="booking-widget-subtitle">
                      Choisissez un créneau disponible pour visiter ce bien directement avec{' '}
                      <strong>{ownerName}</strong>.
                    </p>
                    <div style={{ marginTop: '14px' }}>
                      <ContactOwnerButton property={property} className="btn-full-width" />
                    </div>
                  </div>

                  {/* CAS 1 : Utilisateur non connecté */}
                  {!isAuthenticated ? (
                    <div className="booking-widget-unauth-box">
                      <div className="unauth-icon-circle">
                        <svg
                          width="26"
                          height="26"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      </div>
                      <h4 className="unauth-title">Réservation réservée aux membres</h4>
                      <p className="unauth-desc">
                        Pour garantir la sécurité des visites et bloquer un créneau en direct avec le vendeur, vous devez être connecté.
                      </p>
                      <Link
                        to="/login"
                        state={{ from: location.pathname }}
                        className="urbanet-btn-primary booking-cta-btn"
                      >
                        Connectez-vous pour réserver
                      </Link>
                      <p className="unauth-register-hint">
                        Nouveau sur Urbanet ?{' '}
                        <Link to="/register" className="booking-text-link">
                          Créer un compte
                        </Link>
                      </p>
                    </div>
                  ) : (
                    /* CAS 2 : Utilisateur connecté */
                    <div className="booking-widget-auth-box">
                      {/* Message de succès */}
                      {bookingSuccess ? (
                        <div className="booking-success-container">
                          <div className="success-icon-badge">✓</div>
                          <h4 className="booking-success-title">
                            Demande de visite envoyée !
                          </h4>
                          <p className="booking-success-message">
                            Votre réservation a été enregistrée avec succès. Elle est actuellement{' '}
                            <strong>en attente de confirmation</strong> par le vendeur (
                            {ownerName}).
                          </p>
                          {selectedSlot && (
                            <div className="booked-slot-recap">
                              <div className="recap-row">
                                <span className="recap-label">Date :</span>
                                <span className="recap-val">
                                  {formatSlotDate(selectedSlot.date)}
                                </span>
                              </div>
                              <div className="recap-row">
                                <span className="recap-label">Horaire :</span>
                                <span className="recap-val">
                                  {formatSlotTime(selectedSlot.startTime)} -{' '}
                                  {formatSlotTime(selectedSlot.endTime)}
                                </span>
                              </div>
                              <div className="recap-row">
                                <span className="recap-label">Visiteur :</span>
                                <span className="recap-val">
                                  {user.firstName} {user.lastName}
                                </span>
                              </div>
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={handleResetBooking}
                            className="urbanet-btn-secondary btn-full-width mt-12"
                          >
                            Réserver un autre créneau
                          </button>
                        </div>
                      ) : (
                        /* Formulaire de sélection de créneau */
                        <form onSubmit={handleConfirmBooking} className="booking-form">
                          {bookingError && (
                            <div className="booking-alert-error" role="alert">
                              <span>⚠️ {bookingError}</span>
                            </div>
                          )}

                          <div className="booking-slots-picker-section">
                            <label className="booking-section-label" htmlFor="slot-select">
                              Créneaux disponibles ({availabilities.length})
                            </label>

                            {loadingSlots ? (
                              <div className="booking-slots-loading">
                                <div className="urbanet-spinner-sm" />
                                <span>Recherche des créneaux libres...</span>
                              </div>
                            ) : availabilities.length === 0 ? (
                              <div className="booking-no-slots-box">
                                <span className="no-slots-icon">📅</span>
                                <p className="no-slots-text">
                                  Aucun créneau de visite n'est disponible pour l'instant.
                                </p>
                                <span className="no-slots-hint">
                                  Le propriétaire n'a pas encore publié de nouvelles disponibilités pour ce bien.
                                </span>
                              </div>
                            ) : (
                              <>
                                {/* Sélecteur liste déroulante */}
                                <select
                                  id="slot-select"
                                  className="urbanet-select booking-dropdown-select"
                                  value={selectedSlotId}
                                  onChange={(e) => setSelectedSlotId(e.target.value)}
                                >
                                  <option value="">-- Sélectionnez un créneau --</option>
                                  {availabilities.map((slot) => (
                                    <option key={slot.id} value={slot.id}>
                                      {formatSlotDate(slot.date)} : {formatSlotTime(slot.startTime)} - {formatSlotTime(slot.endTime)}
                                    </option>
                                  ))}
                                </select>

                                {/* Boutons rapides sous forme de pills */}
                                <div className="booking-pills-list">
                                  {availabilities.map((slot) => {
                                    const isSelected = String(selectedSlotId) === String(slot.id);
                                    return (
                                      <button
                                        key={slot.id}
                                        type="button"
                                        onClick={() => setSelectedSlotId(String(slot.id))}
                                        className={`slot-pill-btn ${isSelected ? 'is-selected' : ''}`}
                                      >
                                        <span className="pill-date">
                                          {formatSlotDate(slot.date)}
                                        </span>
                                        <span className="pill-hours">
                                          {formatSlotTime(slot.startTime)} - {formatSlotTime(slot.endTime)}
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </>
                            )}
                          </div>

                          {/* Résumé du créneau sélectionné */}
                          {selectedSlot && (
                            <div className="selected-slot-preview-box">
                              <div className="preview-header">
                                <span className="preview-dot" />
                                <strong>Créneau retenu</strong>
                              </div>
                              <p className="preview-details">
                                📅 {formatSlotDate(selectedSlot.date)} de{' '}
                                {formatSlotTime(selectedSlot.startTime)} à{' '}
                                {formatSlotTime(selectedSlot.endTime)}
                              </p>
                              <p className="preview-user">
                                Visiteur : {user.firstName || 'Client'} {user.lastName || ''} ({user.email})
                              </p>
                            </div>
                          )}

                          <button
                            type="submit"
                            disabled={!selectedSlotId || bookingLoading || availabilities.length === 0}
                            className="urbanet-btn-primary booking-confirm-submit-btn"
                          >
                            {bookingLoading ? (
                              <>
                                <div className="urbanet-spinner-sm white" />
                                <span>Réservation en cours...</span>
                              </>
                            ) : (
                              'Confirmer la réservation'
                            )}
                          </button>

                          <p className="booking-security-footnote">
                            🔒 Réservation instantanée sans engagement. Vous pourrez annuler ou replanifier si besoin.
                          </p>
                        </form>
                      )}
                    </div>
                  )}
                </div>

                {/* Calculateur de prêt immobilier interactif */}
                <LoanCalculator price={property.price} />
              </aside>
            </div>
          )}
        </div>
      </main>

      {/* Modale de signalement */}
      {isReportModalOpen && (
        <ReportModal
          property={property}
          user={user}
          onClose={() => setIsReportModalOpen(false)}
        />
      )}

      <Footer />
    </div>
  );
};

export default PropertyDetailsPage;
