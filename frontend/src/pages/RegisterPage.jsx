import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [role, setRole] = useState('CLIENT'); // 'CLIENT' ou 'PROFESSIONAL'
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    companyName: '',
    rcNumber: '',
    iceNumber: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim(),
        role: role,
        companyName: role === 'PROFESSIONAL' ? formData.companyName.trim() : null,
        rcNumber: role === 'PROFESSIONAL' ? formData.rcNumber.trim() : null,
        iceNumber: role === 'PROFESSIONAL' ? formData.iceNumber.trim() : null,
      };

      if (typeof register === 'function') {
        await register(payload);
      }
      navigate('/login', {
        state: { successMessage: 'Compte créé avec succès ! Veuillez vous connecter.' },
      });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Une erreur est survenue lors de l'inscription.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Logo Urbanet */}
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
          <p className="auth-subtitle">Rejoignez la référence immobilière au Maroc</p>
        </div>

        {/* Message d'erreur */}
        {error && <div className="auth-alert auth-alert-error">{error}</div>}

        {/* Formulaire */}
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

          {/* Select rôle : Client / Agence */}
          <div className="form-group">
            <label htmlFor="role">Rôle</label>
            <select
              id="role"
              name="role"
              className="auth-input auth-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="CLIENT">Client (Particulier)</option>
              <option value="PROFESSIONAL">Agence (Professionnel)</option>
            </select>
          </div>

          {/* Champs additionnels si Agence */}
          {role === 'PROFESSIONAL' && (
            <div className="role-specific-block">
              <div className="form-group">
                <label htmlFor="companyName">Nom de l'agence</label>
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
            {loading ? 'Création du compte...' : "S'inscrire"}
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
