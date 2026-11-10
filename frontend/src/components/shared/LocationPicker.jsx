import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Résolution des icônes de marqueur Leaflet dans les environnements Vite / React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Coordonnées par défaut : Casablanca
const DEFAULT_LAT = 33.5731;
const DEFAULT_LNG = -7.5898;

/**
 * Composant auxiliaire pour recentrer la carte lorsque les coordonnées changent
 */
function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && !isNaN(center[0]) && !isNaN(center[1])) {
      map.setView(center, map.getZoom() || 14);
    }
  }, [center, map]);
  return null;
}

/**
 * Composant auxiliaire pour capturer les clics sur la carte
 */
function MapClickHandler({ onLocationChange }) {
  useMapEvents({
    click(e) {
      if (onLocationChange && e.latlng) {
        onLocationChange(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

/**
 * Composant de géocodage et de sélection d'emplacement sur carte
 */
const LocationPicker = ({
  address,
  setAddress,
  latitude,
  setLatitude,
  longitude,
  setLongitude,
}) => {
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');

  // Résolution des coordonnées courantes ou par défaut
  const currentLat =
    latitude !== null && latitude !== undefined && latitude !== '' && !isNaN(Number(latitude))
      ? Number(latitude)
      : DEFAULT_LAT;

  const currentLng =
    longitude !== null && longitude !== undefined && longitude !== '' && !isNaN(Number(longitude))
      ? Number(longitude)
      : DEFAULT_LNG;

  const [mapCenter, setMapCenter] = useState([currentLat, currentLng]);

  // Synchronisation du centre de la carte si les props changent extérieurement
  useEffect(() => {
    if (
      latitude !== null &&
      latitude !== undefined &&
      latitude !== '' &&
      longitude !== null &&
      longitude !== undefined &&
      longitude !== '' &&
      !isNaN(Number(latitude)) &&
      !isNaN(Number(longitude))
    ) {
      setMapCenter([Number(latitude), Number(longitude)]);
    }
  }, [latitude, longitude]);

  /**
   * Recherche de l'adresse via l'API Nominatim (OpenStreetMap)
   */
  const handleSearch = async (targetAddress) => {
    const query = typeof targetAddress === 'string' ? targetAddress : address;

    if (!query || !query.trim()) {
      setError('Veuillez saisir une adresse avant de lancer la recherche.');
      return;
    }

    setSearching(true);
    setError('');

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query.trim())}&limit=1`
      );

      if (!response.ok) {
        throw new Error('Erreur de communication avec le service de géocodage.');
      }

      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);

        if (setLatitude) setLatitude(lat);
        if (setLongitude) setLongitude(lon);
        setMapCenter([lat, lon]);
        setError('');
      } else {
        setError('Aucun lieu trouvé pour cette adresse. Vous pouvez déplacer le marqueur sur la carte.');
      }
    } catch (err) {
      setError('Impossible de contacter le service de géocodage. Vous pouvez positionner le marqueur manuellement.');
    } finally {
      setSearching(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch(address);
    }
  };

  const handleLocationUpdate = (lat, lng) => {
    const roundedLat = parseFloat(lat.toFixed(6));
    const roundedLng = parseFloat(lng.toFixed(6));
    if (setLatitude) setLatitude(roundedLat);
    if (setLongitude) setLongitude(roundedLng);
  };

  return (
    <div className="agency-field-group location-picker-container">
      <label htmlFor="location-picker-address">
        Adresse complète (ex: Rue X, Ville) *
      </label>
      <div className="location-picker-input-row">
        <input
          id="location-picker-address"
          name="address"
          type="text"
          required
          className="agency-input location-picker-input"
          placeholder="Ex : Boulevard d'Anfa, Casablanca"
          value={address || ''}
          onChange={(e) => setAddress && setAddress(e.target.value)}
          onBlur={(e) => {
            const val = e.target.value;
            if (val && val.trim().length >= 3) {
              handleSearch(val.trim());
            }
          }}
          onKeyDown={handleKeyDown}
        />
        <button
          type="button"
          className="location-picker-search-btn"
          onClick={() => handleSearch(address)}
          disabled={searching}
        >
          {searching ? 'Recherche...' : "Rechercher l'adresse"}
        </button>
      </div>

      {error && <p className="location-picker-error">{error}</p>}

      <div className="location-picker-map-wrapper">
        <MapContainer
          center={mapCenter}
          zoom={13}
          scrollWheelZoom={false}
          className="location-picker-map"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapRecenter center={mapCenter} />
          <MapClickHandler onLocationChange={handleLocationUpdate} />
          <Marker
            key={`marker-${currentLat}-${currentLng}`}
            position={[currentLat, currentLng]}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const { lat, lng } = e.target.getLatLng();
                handleLocationUpdate(lat, lng);
              },
            }}
          />
        </MapContainer>
      </div>

      <div className="location-picker-hint">
        <span>💡 Vous pouvez déplacer le marqueur ou cliquer sur la carte pour ajuster précisément la position.</span>
        {(latitude || longitude) && (
          <span className="location-picker-coords">
            {Number(currentLat).toFixed(4)}, {Number(currentLng).toFixed(4)}
          </span>
        )}
      </div>
    </div>
  );
};

export default LocationPicker;

