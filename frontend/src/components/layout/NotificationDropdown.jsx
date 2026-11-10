import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getUserNotifications, markNotificationAsRead } from '../../services/api';

const NotificationDropdown = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    if (!user?.id) return;
    try {
      const data = await getUserNotifications(user.id);
      if (Array.isArray(data)) {
        setNotifications(data);
      }
    } catch {
      // Silencieux pour ne pas perturber l'expérience utilisateur
    }
  };

  useEffect(() => {
    if (!user?.id) return;

    fetchNotifications();

    // Rafraîchir toutes les 30 secondes pour simuler le temps réel
    const intervalId = setInterval(fetchNotifications, 30000);

    return () => clearInterval(intervalId);
  }, [user?.id]);

  // Fermer le dropdown lors d'un clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      // Mise à jour optimiste immédiate dans le state
      setNotifications((prev) =>
        prev.map((item) => (item.id === notif.id ? { ...item, isRead: true } : item))
      );

      try {
        await markNotificationAsRead(notif.id);
      } catch {
        // En cas d'erreur réseau, recharge la liste réelle
        fetchNotifications();
      }
    }
  };

  const formatNotificationDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now - date;
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHours = Math.floor(diffMin / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSec < 60) return "À l'instant";
      if (diffMin < 60) return `Il y a ${diffMin} min`;
      if (diffHours < 24) return `Il y a ${diffHours} h`;
      if (diffDays < 7) return `Il y a ${diffDays} j`;
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  if (!user?.id) return null;

  return (
    <div
      ref={dropdownRef}
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
    >
      {/* Bouton cloche */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          position: 'relative',
          background: isOpen ? '#f1f5f9' : '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '50%',
          width: '38px',
          height: '38px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          color: '#0f172a',
        }}
        aria-label="Notifications"
        title="Notifications"
      >
        <span style={{ fontSize: '1.05rem', lineHeight: 1 }}>🔔</span>

        {/* Badge rouge notifications non lues */}
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-3px',
              right: '-3px',
              background: '#ef4444',
              color: '#ffffff',
              borderRadius: '9999px',
              fontSize: '0.68rem',
              fontWeight: 700,
              minWidth: '18px',
              height: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
              boxShadow: '0 0 0 2px #ffffff',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Menu déroulant (Dropdown) */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            right: 0,
            width: '340px',
            maxWidth: '90vw',
            background: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 12px 36px rgba(15, 23, 42, 0.16)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            zIndex: 1000,
            animation: 'agency-modal-in 0.18s ease',
          }}
        >
          {/* Header du dropdown */}
          <div
            style={{
              padding: '14px 18px',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#ffffff',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>
                Notifications
              </strong>
              {unreadCount > 0 && (
                <span
                  style={{
                    background: 'rgba(239, 68, 68, 0.12)',
                    color: '#ef4444',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '12px',
                  }}
                >
                  {unreadCount} nouvelle{unreadCount > 1 ? 's' : ''}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={fetchNotifications}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                fontSize: '0.8rem',
                padding: '4px',
              }}
              title="Actualiser"
            >
              ↻
            </button>
          </div>

          {/* Liste des notifications */}
          <div
            style={{
              maxHeight: '360px',
              overflowY: 'auto',
            }}
          >
            {notifications.length === 0 ? (
              <div
                style={{
                  padding: '36px 20px',
                  textAlign: 'center',
                  color: '#94a3b8',
                  fontSize: '0.88rem',
                }}
              >
                <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>🔕</div>
                Aucune notification pour le moment.
              </div>
            ) : (
              notifications.map((notif) => {
                const isUnread = !notif.isRead;
                return (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    style={{
                      padding: '12px 18px',
                      borderBottom: '1px solid #f8fafc',
                      background: isUnread ? '#f1f5f9' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      position: 'relative',
                    }}
                    onMouseEnter={(e) => {
                      if (!isUnread) e.currentTarget.style.backgroundColor = '#f8fafc';
                    }}
                    onMouseLeave={(e) => {
                      if (!isUnread) e.currentTarget.style.backgroundColor = '#ffffff';
                    }}
                  >
                    {/* Indicateur visuel non lu */}
                    {isUnread && (
                      <span
                        style={{
                          position: 'absolute',
                          left: '6px',
                          top: '16px',
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: '#0284c7',
                        }}
                      />
                    )}

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: '8px',
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          fontSize: '0.86rem',
                          color: isUnread ? '#0f172a' : '#334155',
                          fontWeight: isUnread ? 600 : 400,
                          lineHeight: 1.4,
                          wordBreak: 'break-word',
                        }}
                      >
                        {notif.message}
                      </p>
                    </div>

                    <span
                      style={{
                        fontSize: '0.74rem',
                        color: '#94a3b8',
                        alignSelf: 'flex-start',
                      }}
                    >
                      {formatNotificationDate(notif.createdAt)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;

