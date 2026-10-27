import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    role: 'CLIENT', // "CLIENT" ou "PROFESSIONAL"
    companyName: '',
    rcNumber: '',
    iceNumber: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Préparation du payload avec rôle exact attendu par le backend
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim(),
        role: formData.role, // "CLIENT" ou "PROFESSIONAL"
        companyName: formData.role === 'PROFESSIONAL' ? formData.companyName.trim() : null,
        rcNumber: formData.role === 'PROFESSIONAL' ? formData.rcNumber.trim() : null,
        iceNumber: formData.role === 'PROFESSIONAL' ? formData.iceNumber.trim() : null,
      };

      await register(payload);

      // Redirection vers /login avec confirmation
      navigate('/login', {
        state: { successMessage: 'Compte créé avec succès ! Veuillez vous connecter.' },
      });
    } catch (err) {
      setError(err.message || "Une erreur est survenue lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* En-tête avec logo Urbanet */}
        <div className="auth-header">
          <Link to="/" className="urbanet-logo auth-logo-center">
            <div className="urbanet-logo-badge">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <span className="urbanet-logo-title">Urbanet</span>
          </Link>
          <h1 className="auth-title">Créer un compte</h1>
          <p className="auth-subtitle">Rejoignez la plateforme immobilière Urbanet</p>
        </div>

        {/* Bandeau d'erreur rouge */}
        {error && <div className="auth-alert auth-alert-error">{error}</div>}

        {/* Formulaire d'inscription */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="firstName">Prénom</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                className="auth-input"
                placeholder="Ex : Karim"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Nom</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                className="auth-input"
                placeholder="Ex : Benali"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="auth-input"
              placeholder="votre.email@exemple.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="auth-input"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Téléphone</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              className="auth-input"
              placeholder="+212 6 XX XX XX XX"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          {/* Sélecteur de rôle strict : CLIENT ou PROFESSIONAL */}
          <div className="form-group">
            <label htmlFor="role">Type de compte</label>
            <select
              id="role"
              name="role"
              className="auth-input auth-select"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="CLIENT">Client</option>
              <option value="PROFESSIONAL">Professionnel (Agence)</option>
            </select>
          </div>

          {/* Champs dynamiques affichés si rôle = PROFESSIONAL */}
          {formData.role === 'PROFESSIONAL' && (
            <div className="role-specific-block">
              <div className="form-group">
                <label htmlFor="companyName">Nom de l'entreprise</label>
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  required
                  className="auth-input"
                  placeholder="Ex : Atlas Immobilier SARL"
                  value={formData.companyName}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="rcNumber">Numéro RC</label>
                  <input
                    id="rcNumber"
                    name="rcNumber"
                    type="text"
                    required
                    className="auth-input"
                    placeholder="Ex : RC 12345"
                    value={formData.rcNumber}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="iceNumber">Numéro ICE</label>
                  <input
                    id="iceNumber"
                    name="iceNumber"
                    type="text"
                    required
                    className="auth-input"
                    placeholder="Ex : 001234567890001"
                    value={formData.iceNumber}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          )}

          <button type="submit" disabled={loading} className="auth-btn">
            {loading ? 'Chargement...' : "S'inscrire"}
          </button>
        </form>

        <div className="auth-link">
          <span>Déjà un compte ? </span>
          <Link to="/login" className="link-highlight">
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
