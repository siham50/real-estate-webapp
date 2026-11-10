import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur de requête : injecter automatiquement le token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || localStorage.getItem('urbanet_token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur de réponse : gérer la déconnexion automatique en cas de 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Déconnecte l'utilisateur en supprimant les données du localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('urbanet_token');
      localStorage.removeItem('user');
      localStorage.removeItem('urbanet_user');

      // Redirige vers /login
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Authentification - Inscription
export const register = async (data) => {
  try {
    const response = await api.post('/auth/register', data);
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Une erreur est survenue lors de l'inscription.";
    throw new Error(errorMessage);
  }
};

// Authentification - Connexion
export const login = async (data) => {
  try {
    // Accepte soit login({ email, password }) soit login(email, password)
    const payload =
      typeof data === 'object' && data !== null && 'email' in data
        ? data
        : { email: arguments[0], password: arguments[1] };
    const response = await api.post('/auth/login', payload);
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Identifiants incorrects ou serveur indisponible.';
    throw new Error(errorMessage);
  }
};

// Utilisateurs / Profils
export const getUserProfile = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message;
    throw new Error(errorMessage);
  }
};

export const updateUserProfile = async (userId, data) => {
  try {
    const response = await api.put(`/users/${userId}`, data);
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message;
    throw new Error(errorMessage);
  }
};

export const updateProfile = async (userId, data) => {
  try {
    const response = await api.put(`/users/${userId}/profile`, data);
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Erreur lors de la mise à jour du profil.';
    throw new Error(errorMessage);
  }
};

export const verifyIdentity = async (userId, documentUrl) => {
  try {
    const response = await api.patch(`/users/${userId}/verify-identity`, { documentUrl });
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message;
    throw new Error(errorMessage);
  }
};

export const uploadCin = async (userId, cinUrl) => {
  try {
    const response = await api.patch(`/users/${userId}/upload-cin`, { cinUrl });
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Une erreur est survenue lors de l'envoi de la CIN.";
    throw new Error(errorMessage);
  }
};

// ─── Upload de Fichiers ──────────────────────────────────────────────────────

export const uploadFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    // Retourne l'URL propre (ex: /uploads/image.png)
    const resData = response.data;
    if (typeof resData === 'string') {
      return resData.trim();
    }
    return resData?.url || resData?.fileUrl || resData?.imageUrl || resData;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      (typeof error.response?.data === 'string' ? error.response.data : null) ||
      error.message ||
      "Une erreur est survenue lors de l'upload du fichier.";
    throw new Error(errorMessage);
  }
};

// ─── Résidences ──────────────────────────────────────────────────────────────

export const getAllResidences = async () => {
  try {
    const response = await api.get('/residences');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.response?.data?.error || error.message);
  }
};

export const getResidencesByOwner = async (ownerId) => {
  try {
    const response = await api.get('/residences');
    // Filtrage côté frontend car le backend n'expose pas /owner/{id}
    return response.data.filter((r) => r.owner?.id === ownerId);
  } catch (error) {
    throw new Error(error.response?.data?.message || error.response?.data?.error || error.message);
  }
};

export const createResidence = async (data) => {
  try {
    const response = await api.post('/residences', data);
    return response.data;
  } catch (error) {
    const errorMsg =
      error.response?.data?.message ||
      error.response?.data?.error ||
      (typeof error.response?.data === 'string' ? error.response.data : null) ||
      error.message ||
      'Erreur lors de la création de la résidence.';
    throw new Error(errorMsg);
  }
};

export const deleteResidence = async (id) => {
  try {
    await api.delete(`/residences/${id}`);
  } catch (error) {
    throw new Error(error.response?.data?.message || error.response?.data?.error || error.message);
  }
};

// ─── Biens Immobiliers ───────────────────────────────────────────────────────

export const getAllProperties = async () => {
  try {
    const response = await api.get('/properties');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.response?.data?.error || error.message);
  }
};

export const searchProperties = async (filters = {}) => {
  try {
    const params = {};
    if (filters.city && filters.city.trim() !== '') {
      params.city = filters.city.trim();
    }
    if (filters.type && filters.type.trim() !== '') {
      params.type = filters.type.trim();
    }
    if (filters.purpose && filters.purpose.trim() !== '') {
      params.purpose = filters.purpose.trim();
    }
    if (filters.minPrice !== undefined && filters.minPrice !== null && filters.minPrice !== '') {
      params.minPrice = filters.minPrice;
    }
    if (filters.maxPrice !== undefined && filters.maxPrice !== null && filters.maxPrice !== '') {
      params.maxPrice = filters.maxPrice;
    }

    const response = await api.get('/properties/search', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.response?.data?.error || error.message);
  }
};

export const getPropertyById = async (id) => {
  try {
    const response = await api.get(`/properties/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.response?.data?.error || error.message);
  }
};

export const incrementPropertyViews = async (id) => {
  try {
    const response = await api.patch(`/properties/${id}/view`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Impossible d'incrémenter le nombre de vues."
    );
  }
};

export const getPropertiesByOwner = async (ownerId) => {
  try {
    const response = await api.get('/properties');
    // Filtrage côté frontend car le backend n'expose pas /owner/{id}
    return response.data.filter((p) => p.owner?.id === ownerId);
  } catch (error) {
    throw new Error(error.response?.data?.message || error.response?.data?.error || error.message);
  }
};

export const createProperty = async (data) => {
  try {
    const response = await api.post('/properties', data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    const errorMsg =
      error.response?.data?.message ||
      error.response?.data?.error ||
      (typeof error.response?.data === 'string' ? error.response.data : null) ||
      error.message ||
      'Erreur lors de la création du bien.';
    throw new Error(errorMsg);
  }
};

export const deleteProperty = async (id) => {
  try {
    await api.delete(`/properties/${id}`);
  } catch (error) {
    throw new Error(error.response?.data?.message || error.response?.data?.error || error.message);
  }
};

// ─── Disponibilités & Réservations de Visite ──────────────────────────────────

export const getAvailabilitiesByOwner = async (ownerId) => {
  try {
    // Tente d'abord /availabilities/owner/{ownerId}
    const response = await api.get(`/availabilities/owner/${ownerId}`);
    return response.data;
  } catch (error) {
    try {
      // Fallback sur /availabilities/user/{userId}
      const fallback = await api.get(`/availabilities/user/${ownerId}`);
      return fallback.data;
    } catch {
      throw new Error(error.response?.data?.message || error.response?.data?.error || error.message);
    }
  }
};

export const createAvailability = async (data) => {
  try {
    const response = await api.post('/availabilities', data);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Impossible de créer le créneau de disponibilité.'
    );
  }
};

export const deleteAvailability = async (id) => {
  try {
    await api.delete(`/availabilities/${id}`);
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Impossible de supprimer ce créneau.'
    );
  }
};

export const createBooking = async (data) => {
  try {
    const response = await api.post('/bookings', data);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Impossible de réserver ce créneau.'
    );
  }
};

export const getClientBookings = async (clientId) => {
  try {
    const response = await api.get(`/bookings/client/${clientId}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Impossible de charger vos réservations.'
    );
  }
};

export const getOwnerBookings = async (ownerId) => {
  try {
    const response = await api.get(`/bookings/owner/${ownerId}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Impossible de charger les réservations.'
    );
  }
};

export const updateBookingStatus = async (bookingId, status) => {
  try {
    const response = await api.patch(`/bookings/${bookingId}/status?status=${status}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Impossible de mettre à jour le statut de la visite.'
    );
  }
};

export const createReview = async (data) => {
  try {
    const response = await api.post('/reviews', data);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Impossible d'enregistrer l'avis."
    );
  }
};

export const getReviewsByTargetUser = async (targetUserId) => {
  try {
    const response = await api.get(`/reviews/target/${targetUserId}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Impossible de charger les avis.'
    );
  }
};


// ─── Administration ──────────────────────────────────────────────────────────

export const getAdminStats = async () => {
  try {
    const response = await api.get('/admin/stats');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.response?.data?.error || error.message);
  }
};

export const getAllUsersAdmin = async () => {
  try {
    const response = await api.get('/users');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.response?.data?.error || error.message);
  }
};

export const getAllPropertiesAdmin = async () => {
  try {
    const response = await api.get('/properties/all');
    return response.data;
  } catch (error) {
    // Fallback vers /properties si /properties/all n'est pas mappé
    try {
      const fallback = await api.get('/properties');
      return fallback.data;
    } catch {
      throw new Error(error.response?.data?.message || error.response?.data?.error || error.message);
    }
  }
};

export const getAllReportsAdmin = async () => {
  try {
    const response = await api.get('/reports/all');
    return response.data;
  } catch (error) {
    // Fallback vers /reports si /reports/all n'est pas mappé
    try {
      const fallback = await api.get('/reports');
      return fallback.data;
    } catch {
      throw new Error(error.response?.data?.message || error.response?.data?.error || error.message);
    }
  }
};

export const toggleUserStatus = async (id, isActive) => {
  try {
    const response = await api.patch(`/admin/users/${id}/status?isActive=${isActive}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.response?.data?.error || error.message);
  }
};

export const verifyUser = async (id) => {
  try {
    const response = await api.patch(`/admin/verify/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.response?.data?.error || error.message);
  }
};

export const togglePropertyAvailability = async (id) => {
  try {
    const response = await api.patch(`/properties/${id}/toggle-availability`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.response?.data?.error || error.message);
  }
};

export const hardDeleteProperty = async (id) => {
  try {
    const response = await api.delete(`/properties/${id}/hard`);
    return response.data;
  } catch (error) {
    // Fallback vers /properties/{id} si /hard n'est pas encore redéployé
    try {
      const fallback = await api.delete(`/properties/${id}`);
      return fallback.data;
    } catch {
      throw new Error(error.response?.data?.message || error.response?.data?.error || error.message);
    }
  }
};

export const createReport = async (data) => {
  try {
    const response = await api.post('/reports', data);
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Erreur lors de la création du signalement.';
    throw new Error(message);
  }
};

export const updateReportStatus = async (id, status) => {
  try {
    const response = await api.patch(`/reports/${id}/status?status=${status}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.response?.data?.error || error.message);
  }
};

// ─── Messagerie / Chat (Conversations & Messages) ─────────────────────────────

export const getUserConversations = async (userId) => {
  try {
    const response = await api.get(`/conversations/user/${userId}`);
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Impossible de récupérer les conversations.';
    throw new Error(errorMessage);
  }
};

export const createConversation = async (user1Id, user2Id, propertyId) => {
  try {
    // Prend en charge soit les arguments directs, soit un objet { user1Id, user2Id, propertyId }
    const u1 = typeof user1Id === 'object' && user1Id !== null ? user1Id.user1Id : user1Id;
    const u2 = typeof user1Id === 'object' && user1Id !== null ? user1Id.user2Id : user2Id;
    const pId = typeof user1Id === 'object' && user1Id !== null ? user1Id.propertyId : propertyId;

    const payload = {
      user1Id: Number(u1),
      user2Id: Number(u2),
      propertyId: pId ? Number(pId) : null,
      user1: { id: Number(u1) },
      user2: { id: Number(u2) },
      property: pId ? { id: Number(pId) } : null,
    };
    const response = await api.post('/conversations', payload);
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Impossible de créer la conversation.';
    throw new Error(errorMessage);
  }
};

export const getConversationMessages = async (conversationId) => {
  try {
    const response = await api.get(`/messages/conversation/${conversationId}`);
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Impossible de charger les messages.';
    throw new Error(errorMessage);
  }
};

export const sendMessage = async (conversationId, senderId, content) => {
  try {
    // Prend en charge soit les arguments directs, soit un objet { conversationId, senderId, content }
    const cId = typeof conversationId === 'object' && conversationId !== null ? conversationId.conversationId : conversationId;
    const sId = typeof conversationId === 'object' && conversationId !== null ? conversationId.senderId : senderId;
    const text = typeof conversationId === 'object' && conversationId !== null ? conversationId.content : content;

    const payload = {
      conversationId: Number(cId),
      senderId: Number(sId),
      content: text,
      conversation: { id: Number(cId) },
      sender: { id: Number(sId) },
    };
    const response = await api.post('/messages', payload);
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Impossible d'envoyer le message.";
    throw new Error(errorMessage);
  }
};

// ─── Notifications ──────────────────────────────────────────────────────────

export const getUserNotifications = async (userId) => {
  try {
    const response = await api.get(`/notifications/user/${userId}`);
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Impossible de récupérer les notifications.';
    throw new Error(message);
  }
};

export const markNotificationAsRead = async (id) => {
  try {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Impossible de marquer la notification comme lue.';
    throw new Error(message);
  }
};

// ─────────────────────────────────────────────────────────────────────────────

export const testBackend = async () => {
  try {
    const response = await api.get('/test');
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Erreur de connexion',
    };
  }
};

export default api;
