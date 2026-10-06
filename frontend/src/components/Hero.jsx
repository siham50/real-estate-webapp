import React, { useState } from 'react';

const Hero = () => {
  const [city, setCity] = useState('');
  const [type, setType] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Recherche :', { city, type });
  };

  return (
    <section className="hero">
      <h1 className="hero-title">Trouvez votre bien immobilier au Maroc</h1>
      <p className="hero-subtitle">Des milliers de biens à découvrir partout au Maroc</p>
      <form className="search-bar" onSubmit={handleSubmit}>
        <input
          type="text"
          className="search-input"
          placeholder="Ville"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <select
          className="search-select"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="">Type de bien</option>
          <option value="Maison">Maison</option>
          <option value="Villa">Villa</option>
          <option value="Appartement">Appartement</option>
          <option value="Terrain">Terrain</option>
          <option value="Local Commercial">Local Commercial</option>
          <option value="Bureau">Bureau</option>
        </select>
        <button type="submit" className="search-btn">
          Rechercher
        </button>
      </form>
    </section>
  );
};

export default Hero;
