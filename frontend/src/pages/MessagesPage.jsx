import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserConversations } from '../services/api';
import Header from '../components/Header';
import ChatWindow from '../components/chat/ChatWindow';

const MessagesPage = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedConversationId, setSelectedConversationId] = useState(null);

  // Identifiant actif extrait de l'URL ?conversationId=X ou sélection locale
  const urlConversationId = searchParams.get('conversationId');
  const activeConversationId = urlConversationId
    ? Number(urlConversationId)
    : selectedConversationId;

  // Chargement des conversations de l'utilisateur connecté
  const fetchConversations = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getUserConversations(user.id);
      const list = Array.isArray(data) ? data : [];
      setConversations(list);

      // Si aucune conversation n'est encore sélectionnée et pas de paramètre URL, sélectionne la 1ère
      if (!urlConversationId && list.length > 0) {
        setSelectedConversationId(list[0].id);
        setSearchParams({ conversationId: list[0].id });
      }
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des conversations.');
    } finally {
      setLoading(false);
    }
  }, [user?.id, urlConversationId, setSearchParams]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Détermination de l'interlocuteur pour chaque conversation
  const getInterlocutor = useCallback(
    (conv) => {
      if (!conv || !user?.id) return null;
      const isUser1 = Number(conv.user1?.id) === Number(user.id);
      return isUser1 ? conv.user2 : conv.user1;
    },
    [user?.id]
  );

  // Filtrage selon le terme de recherche
  const filteredConversations = useMemo(() => {
    if (!searchFilter.trim()) return conversations;
    const term = searchFilter.toLowerCase();
    return conversations.filter((c) => {
      const other = getInterlocutor(c);
      const name = `${other?.firstName || ''} ${other?.lastName || ''}`.toLowerCase();
      const email = (other?.email || '').toLowerCase();
      const propTitle = (c.property?.title || '').toLowerCase();
      return name.includes(term) || email.includes(term) || propTitle.includes(term);
    });
  }, [conversations, searchFilter, getInterlocutor]);

  // Sélection d'une conversation
  const handleSelectConversation = (id) => {
    setSelectedConversationId(id);
    setSearchParams({ conversationId: id });
  };

  // Conversation actuellement active
  const activeConversation = useMemo(() => {
    return conversations.find((c) => Number(c.id) === Number(activeConversationId)) || null;
  }, [conversations, activeConversationId]);

  return (
    <div className="urbanet-app-root">
      <Header />

      <main className="messages-page-main">
        <div className="messages-layout">
          {/* Colonne Gauche (Sidebar) : Liste des conversations */}
          <aside className="conversations-sidebar">
            <div className="conversations-sidebar-header">
              <div className="sidebar-header-title-row">
                <h2 className="sidebar-main-title">Messages</h2>
                <span className="sidebar-conversations-count">
                  {conversations.length}
                </span>
              </div>

              {/* Champ de recherche rapide */}
              <div className="conversations-search-wrapper">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Rechercher une discussion..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="conversations-search-input"
                />
              </div>
            </div>

            {/* Liste scrollable des conversations */}
            <div className="conversations-list">
              {loading ? (
                <div className="conversations-sidebar-loading">
                  <div className="urbanet-spinner-sm" />
                  <span>Chargement des échanges...</span>
                </div>
              ) : error ? (
                <div className="conversations-sidebar-error">
                  <p>⚠️ {error}</p>
                  <button
                    type="button"
                    onClick={() => fetchConversations()}
                    className="urbanet-btn-secondary"
                    style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                  >
                    Réessayer
                  </button>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="conversations-sidebar-empty">
                  <div className="empty-chat-icon">✉️</div>
                  <h4>Aucune conversation</h4>
                  <p>
                    {searchFilter
                      ? 'Aucun résultat correspondant.'
                      : 'Vos futures discussions avec les propriétaires ou clients apparaîtront ici.'}
                  </p>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const other = getInterlocutor(conv);
                  const otherName =
                    `${other?.firstName || ''} ${other?.lastName || ''}`.trim() ||
                    other?.email ||
                    'Interlocuteur';
                  const isSelected = Number(conv.id) === Number(activeConversationId);
                  const lastMessage = conv.lastMessage || (conv.messages && conv.messages[conv.messages.length - 1]);

                  return (
                    <div
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv.id)}
                      className={`conversation-item ${isSelected ? 'active' : ''}`}
                    >
                      <div className="conversation-avatar">
                        {otherName.charAt(0).toUpperCase()}
                      </div>

                      <div className="conversation-item-body">
                        <div className="conversation-item-top">
                          <strong className="conversation-user-name">
                            {otherName}
                          </strong>
                          {lastMessage?.timestamp && (
                            <span className="conversation-date">
                              {new Date(lastMessage.timestamp).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                              })}
                            </span>
                          )}
                        </div>

                        {/* Titre du bien concerné */}
                        {conv.property && (
                          <div className="conversation-property-title">
                            🏡 {conv.property.title}
                          </div>
                        )}

                        {/* Aperçu du dernier message */}
                        <p className="conversation-last-preview">
                          {lastMessage ? lastMessage.content : 'Nouvelle conversation'}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </aside>

          {/* Colonne Droite (Chat Window) : Zone de discussion */}
          <section className="chat-window-container">
            {activeConversationId ? (
              <ChatWindow
                key={activeConversationId}
                conversationId={activeConversationId}
                currentUser={user}
                conversation={activeConversation}
              />
            ) : (
              <div className="chat-no-selection">
                <div className="no-selection-card">
                  <div className="no-selection-icon">💬</div>
                  <h3>Vos messages Urbanet</h3>
                  <p>
                    Sélectionnez une conversation dans la liste de gauche pour échanger en direct
                    sur les biens immobiliers.
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default MessagesPage;
