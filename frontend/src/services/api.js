import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Authentification
export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const register = async (data) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

// Utilisateurs / Profils
export const getUserProfile = async (userId) => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

export const updateUserProfile = async (userId, data) => {
  const response = await api.put(`/users/${userId}`, data);
  return response.data;
};

export const verifyIdentity = async (userId, documentUrl) => {
  const response = await api.patch(`/users/${userId}/verify-identity`, { documentUrl });
  return response.data;
};

export const testBackend = async () => {
  try {
    const response = await api.get('/test');
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message || 'Erreur de connexion',
    };
  }
};

export default api;
