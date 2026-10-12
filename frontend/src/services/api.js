import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

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

// Users
export const fetchUsers = async () => {
  try {
    const response = await api.get('/users');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const createUser = async (userData) => {
  try {
    const response = await api.post('/users', userData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.message || error.message };
  }
};

export const updateUser = async (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = async (id) => api.delete(`/users/${id}`);

// Residences
export const fetchResidences = async () => api.get('/residences');
export const createResidence = async (data) => api.post('/residences', data);
export const updateResidence = async (id, data) => api.put(`/residences/${id}`, data);
export const deleteResidence = async (id) => api.delete(`/residences/${id}`);

// Properties
export const fetchProperties = async () => api.get('/properties');
export const createProperty = async (data) => api.post('/properties', data);
export const updateProperty = async (id, data) => api.put(`/properties/${id}`, data);
export const deleteProperty = async (id) => api.delete(`/properties/${id}`);

export default api;
