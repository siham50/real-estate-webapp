import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

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
    throw new Error(error.response?.data?.message || error.response?.data?.error || error.message);
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
    const response = await api.post('/properties', data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.response?.data?.error || error.message);
  }
};

export const deleteProperty = async (id) => {
  try {
    await api.delete(`/properties/${id}`);
  } catch (error) {
    throw new Error(error.response?.data?.message || error.response?.data?.error || error.message);
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

export const updateReportStatus = async (id, status) => {
  try {
    const response = await api.patch(`/reports/${id}/status?status=${status}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.response?.data?.error || error.message);
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
