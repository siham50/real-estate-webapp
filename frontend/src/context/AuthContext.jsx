import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister, getUserProfile } from '../services/api';

const AuthContext = createContext({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  updateUserState: () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user') || localStorage.getItem('urbanet_user');
      if (!stored || stored === 'undefined' || stored === 'null') return null;
      const parsed = JSON.parse(stored);
      // On ne valide que si l'objet contient un identifiant utilisateur
      return parsed && parsed.id ? parsed : null;
    } catch (e) {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('token') || localStorage.getItem('urbanet_token') || null;
    } catch (e) {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  // Synchronisation optionnelle avec le backend au montage
  useEffect(() => {
    const syncProfile = async () => {
      if (user?.id) {
        try {
          const freshData = await getUserProfile(user.id);
          const merged = { ...user, ...freshData };
          setUser(merged);
          localStorage.setItem('user', JSON.stringify(merged));
          localStorage.setItem('urbanet_user', JSON.stringify(merged));
        } catch (err) {
          // Conserve l'état local en cas d'indisponibilité temporaire
        }
      }
    };

    syncProfile();
  }, []);

  const login = async (data) => {
    setLoading(true);
    try {
      const response = await apiLogin(data);
      let fullUser = response;
      if (response?.id) {
        try {
          const profile = await getUserProfile(response.id);
          fullUser = { ...response, ...profile };
        } catch (err) {
          // Fallback sur la réponse directe
        }
      }

      setUser(fullUser);
      localStorage.setItem('user', JSON.stringify(fullUser));
      localStorage.setItem('urbanet_user', JSON.stringify(fullUser));

      if (response?.token) {
        setToken(response.token);
        localStorage.setItem('token', response.token);
        localStorage.setItem('urbanet_token', response.token);
      }

      return fullUser;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data) => {
    setLoading(true);
    try {
      const res = await apiRegister(data);
      if (res?.token) {
        setToken(res.token);
        localStorage.setItem('token', res.token);
        localStorage.setItem('urbanet_token', res.token);
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('urbanet_user');
    localStorage.removeItem('urbanet_token');
  };

  const updateUserState = (updatedData) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedData };
      localStorage.setItem('user', JSON.stringify(merged));
      localStorage.setItem('urbanet_user', JSON.stringify(merged));
      return merged;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user && user.id),
        loading,
        login,
        register,
        logout,
        updateUserState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context || {};
};

export default AuthContext;
