import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createConversation } from '../../services/api';

const ContactOwnerButton = ({ property, className = '' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!property) return null;

  // Résolution de l'identifiant du propriétaire
  const ownerId =
    property.owner?.id ||
    property.ownerId ||
    (typeof property.owner === 'number' ? property.owner : null);

  // Règle métier : masquer le bouton si l'utilisateur connecté est le propriétaire du bien
  if (user?.id && ownerId && Number(user.id) === Number(ownerId)) {
    return null;
  }

  const handleContact = async () => {
    // 1. Si non connecté, rediriger vers /login
    if (!isAuthenticated || !user?.id) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    if (!ownerId) {
      setError("Impossible de contacter le propriétaire (identifiant introuvable).");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 2. Création ou récupération de la conversation existante
      const conversation = await createConversation(user.id, ownerId, property.id);

      // 3. Redirection vers /messages?conversationId={id}
      if (conversation?.id) {
        navigate(`/messages?conversationId=${conversation.id}`);
      } else {
        navigate('/messages');
      }
    } catch (err) {
      console.error('Erreur lors de la création de la conversation:', err);
      setError(err.message || 'Une erreur est survenue lors de la connexion au chat.');
    } finally {
      setLoading(false);
    }
  };

  const isAgency = property.owner?.role === 'PROFESSIONAL' || property.agency;
  const buttonLabel = isAgency ? "Contacter l'agence" : "Contacter le propriétaire";

  return (
    <div className="contact-owner-container">
      {error && <div className="contact-owner-error">⚠️ {error}</div>}
      <button
        type="button"
        onClick={handleContact}
        disabled={loading}
        className={`contact-owner-btn ${className}`}
        title={buttonLabel}
      >
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
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span>{loading ? 'Connexion au chat...' : buttonLabel}</span>
      </button>
    </div>
  );
};

export default ContactOwnerButton;

