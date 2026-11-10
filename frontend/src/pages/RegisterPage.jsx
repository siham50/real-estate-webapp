import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { uploadFile } from '../services/api';

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

  const [legalDocs, setLegalDocs] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLegalDocsChange = (e) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;

    setLegalDocs((prev) => {
      // Éviter les doublons par nom et taille
      const existingKey = new Set(prev.map((f) => `${f.name}-${f.size}`));
      const newFiles = selected.filter((f) => !existingKey.has(`${f.name}-${f.size}`));

      const combined = [...prev, ...newFiles];
      if (combined.length > 5) {
        setError("Vous pouvez ajouter jusqu'à 5 documents justificatifs maximum. Les 5 premiers ont été retenus.");
        return combined.slice(0, 5);
      }
      setError('');
      return combined;
    });

    // Réinitialiser la valeur de l'input pour permettre des ajouts successifs
    e.target.value = '';
  };

  const handleRemoveLegalDoc = (index) => {
    setLegalDocs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let documentUrls = [];
      if (formData.role === 'PROFESSIONAL' && legalDocs.length > 0) {
        for (let i = 0; i < legalDocs.length; i++) {
          setStatusText(`Upload des documents (${i + 1}/${legalDocs.length})...`);
          const url = await uploadFile(legalDocs[i]);
          documentUrls.push(url);
        }
      }

      setStatusText("Inscription en cours...");

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
        documentUrl: documentUrls.length > 0 ? documentUrls.join(',') : null,
        documentUrls: documentUrls.length > 0 ? documentUrls : null,
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
      setStatusText('');
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

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label htmlFor="legalDocsInput" style={{ margin: 0, fontWeight: 600 }}>
                    Documents légaux (RC / ICE / Justificatifs)
                  </label>
                  <span
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: '12px',
                      background: legalDocs.length === 5 ? '#fef3c7' : '#f1f5f9',
                      color: legalDocs.length === 5 ? '#b45309' : '#475569',
                    }}
                  >
                    {legalDocs.length} / 5 max
                  </span>
                </div>

                {/* Bouton d'ajout personnalisé pour éviter l'écrasement standard du navigateur */}
                {legalDocs.length < 5 ? (
                  <label
                    htmlFor="legalDocsInput"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '16px',
                      border: '2px dashed #93c5fd',
                      borderRadius: '10px',
                      background: '#f8fafc',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'center',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#2563eb';
                      e.currentTarget.style.background = '#eff6ff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#93c5fd';
                      e.currentTarget.style.background = '#f8fafc';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2563eb', fontWeight: 600, fontSize: '0.9rem' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      <span>
                        {legalDocs.length === 0
                          ? 'Choisir des fichiers (jusqu’à 5)'
                          : `+ Ajouter un autre fichier (${5 - legalDocs.length} restant${5 - legalDocs.length > 1 ? 's' : ''})`}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      Cliquez pour sélectionner un ou plusieurs fichiers (PDF, JPG, PNG — max. 10 Mo)
                    </span>
                  </label>
                ) : (
                  <div
                    style={{
                      padding: '10px 14px',
                      background: '#ecfdf5',
                      border: '1px solid #a7f3d0',
                      borderRadius: '8px',
                      color: '#065f46',
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span>✓ Limite maximale de 5 documents atteinte.</span>
                  </div>
                )}

                <input
                  id="legalDocsInput"
                  name="legalDocs"
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  style={{ display: 'none' }}
                  onChange={handleLegalDocsChange}
                />

                {legalDocs.length > 0 && (
                  <div style={{ marginTop: '12px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ padding: '8px 14px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '0.82rem', fontWeight: 600, color: '#334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Documents prêts à être transmis ({legalDocs.length}/5)</span>
                      <button
                        type="button"
                        onClick={() => setLegalDocs([])}
                        style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}
                      >
                        Tout supprimer
                      </button>
                    </div>
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                      {legalDocs.map((file, idx) => (
                        <li
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 14px',
                            borderBottom: idx < legalDocs.length - 1 ? '1px solid #f1f5f9' : 'none',
                            fontSize: '0.85rem',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                            <span style={{ fontSize: '1.25rem' }}>
                              {file.name.toLowerCase().endsWith('.pdf') ? '📕' : '🖼️'}
                            </span>
                            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                              <span style={{ fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: '240px' }}>
                                {file.name}
                              </span>
                              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                {(file.size / (1024 * 1024)).toFixed(2)} Mo • Document {idx + 1} sur 5
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveLegalDoc(idx)}
                            style={{
                              background: '#fee2e2',
                              border: 'none',
                              color: '#b91c1c',
                              borderRadius: '6px',
                              padding: '5px 10px',
                              cursor: 'pointer',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                            title="Retirer ce document"
                          >
                            ✕ Retirer
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          <button type="submit" disabled={loading} className="auth-btn">
            {loading ? (statusText || 'Upload en cours...') : "S'inscrire"}
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
