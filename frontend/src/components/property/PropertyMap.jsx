import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Résolution des icônes de marqueur Leaflet dans les environnements packagés
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const PropertyMap = ({ latitude, longitude, title }) => {
  // Validation des coordonnées
  const lat =
    latitude !== null && latitude !== undefined && latitude !== ''
      ? Number(latitude)
      : null;
  const lng =
    longitude !== null && longitude !== undefined && longitude !== ''
      ? Number(longitude)
      : null;

  const hasValidCoordinates =
    lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng);

  if (!hasValidCoordinates) {
    return (
      <div className="property-details-section-card property-map-card">
        <h2 className="section-card-title">
          <span>📍</span> Localisation du bien
        </h2>
        <div className="property-map-unavailable">
          <div className="map-unavailable-icon">📍</div>
          <p className="map-unavailable-title">Position non disponible</p>
          <span className="map-unavailable-hint">
            Les coordonnées GPS précises de ce bien n'ont pas encore été renseignées.
          </span>
        </div>
      </div>
    );
  }

  const position = [lat, lng];

  return (
    <div className="property-details-section-card property-map-card">
      <div className="property-map-header">
        <h2 className="section-card-title">
          <span>📍</span> Localisation du bien
        </h2>
        <span className="property-map-coords-badge">
          {lat.toFixed(4)}°, {lng.toFixed(4)}°
        </span>
      </div>

      <div className="property-map-wrapper">
        <MapContainer
          center={position}
          zoom={14}
          scrollWheelZoom={false}
          className="map-container"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributeurs'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position}>
            <Popup>
              <div className="map-popup-body">
                <strong>{title || 'Bien immobilier Urbanet'}</strong>
                <p>📍 {lat.toFixed(4)}, {lng.toFixed(4)}</p>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
};

export default PropertyMap;

