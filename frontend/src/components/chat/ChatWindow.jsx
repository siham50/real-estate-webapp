import React, { useState, useEffect, useRef } from 'react';
import { getConversationMessages, sendMessage } from '../../services/api';

const ChatWindow = ({ conversationId, currentUser, conversation }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);

  // Détermination de l'interlocuteur pour l'en-tête de discussion
  const interlocutor = React.useMemo(() => {
    if (!conversation || !currentUser) return null;
    const isUser1 = Number(conversation.user1?.id) === Number(currentUser.id);
    return isUser1 ? conversation.user2 : conversation.user1;
  }, [conversation, currentUser]);

  const interlocutorName = React.useMemo(() => {
    if (!interlocutor) return 'Discussion';
    const fullName = `${interlocutor.firstName || ''} ${interlocutor.lastName || ''}`.trim();
    return fullName || interlocutor.email || 'Utilisateur';
  }, [interlocutor]);

  // Chargement des messages et polling toutes les 3 secondes
  useEffect(() => {
    if (!conversationId) return;

    let isMounted = true;

    const fetchMessages = async (showSpinner = false) => {
      if (showSpinner) setLoading(true);
      try {
        const data = await getConversationMessages(conversationId);
        if (isMounted) {
          setMessages(Array.isArray(data) ? data : []);
          setError(null);
        }
      } catch (err) {
        if (isMounted && showSpinner) {
          setError(err.message || "Impossible de charger les messages.");
        }
      } finally {
        if (isMounted && showSpinner) setLoading(false);
      }
    };

    // Chargement initial
    fetchMessages(true);

    // Polling toutes les 3 secondes pour simuler le temps réel
    const intervalId = setInterval(() => {
      fetchMessages(false);
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [conversationId]);

  // Défilement automatique vers le dernier message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Envoi d'un message
  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = newMessage.trim();
    if (!trimmed || sending || !conversationId || !currentUser?.id) return;

    setSending(true);
    setNewMessage('');

    // Ajout optimiste immédiat dans le state local
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      id: tempId,
      conversationId: Number(conversationId),
      senderId: currentUser.id,
      sender: {
        id: currentUser.id,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
      },
      content: trimmed,
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      const savedMessage = await sendMessage(conversationId, currentUser.id, trimmed);
      // Remplacement du message optimiste par la réponse du backend
      setMessages((prev) =>
        prev.map((msg) => (msg.id === tempId ? savedMessage : msg))
      );
    } catch (err) {
      console.error("Erreur lors de l'envoi du message:", err);
      // En cas d'échec, recharger les messages réels du serveur
      const refreshed = await getConversationMessages(conversationId);
      setMessages(Array.isArray(refreshed) ? refreshed : []);
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="chat-window">
      {/* En-tête de la fenêtre de discussion */}
      <div className="chat-window-header">
        <div className="chat-header-user">
          <div className="chat-avatar-circle">
            {interlocutorName.charAt(0).toUpperCase()}
          </div>
          <div className="chat-header-info">
            <h3 className="chat-header-name">{interlocutorName}</h3>
            {conversation?.property && (
              <span className="chat-header-property-tag">
                🏡 {conversation.property.title || 'Bien immobilier'}
              </span>
            )}
          </div>
        </div>

        {conversation?.property?.price && (
          <div className="chat-header-price">
            {Number(conversation.property.price).toLocaleString('fr-FR')} MAD
          </div>
        )}
      </div>

      {/* Zone d'affichage des messages */}
      <div className="chat-messages">
        {loading ? (
          <div className="chat-loading-state">
            <div className="urbanet-spinner-sm" />
            <span>Chargement de la conversation...</span>
          </div>
        ) : error ? (
          <div className="chat-error-state">
            <p>⚠️ {error}</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="chat-empty-state">
            <div className="chat-empty-icon">💬</div>
            <h4>Démarrez la conversation</h4>
            <p>
              Envoyez un message pour échanger sur ce bien immobilier avec {interlocutorName}.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            // Vérification si le message a été envoyé par l'utilisateur connecté
            const isSentByMe =
              (msg.senderId && Number(msg.senderId) === Number(currentUser?.id)) ||
              (msg.sender?.id && Number(msg.sender?.id) === Number(currentUser?.id));

            return (
              <div
                key={msg.id}
                className={`message-bubble-wrapper ${
                  isSentByMe ? 'wrapper-sent' : 'wrapper-received'
                }`}
              >
                <div
                  className={`message-bubble ${
                    isSentByMe ? 'message-sent' : 'message-received'
                  }`}
                >
                  <p className="message-text">{msg.content}</p>
                  <span className="message-time">
                    {formatMessageTime(msg.timestamp)}
                    {isSentByMe && <span className="message-status-check"> ✓</span>}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Zone de saisie en bas */}
      <form onSubmit={handleSend} className="chat-input-container">
        <input
          type="text"
          placeholder="Écrivez votre message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={loading || sending}
          className="chat-input-field"
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || sending}
          className="chat-send-btn"
          title="Envoyer le message"
        >
          {sending ? (
            <div className="urbanet-spinner-sm white" />
          ) : (
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
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          )}
          <span>Envoyer</span>
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;

