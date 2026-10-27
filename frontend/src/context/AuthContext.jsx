import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister, getUserProfile } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('urbanet_user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const stored = localStorage.getItem('urbanet_user');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.id) {
            // Optionnel : synchroniser avec les données fraîches du backend
            try {
              const freshData = await getUserProfile(parsed.id);
              const merged = { ...parsed, ...freshData };
              setUser(merged);
              localStorage.setItem('urbanet_user', JSON.stringify(merged));
            } catch (err) {
              // Si le backend est indisponible temporairement, on garde les infos locales
              setUser(parsed);
            }
          }
        }
      } catch (err) {
        console.error('Erreur initialisation auth:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const authData = await apiLogin(email, password);
    // authData = { id, email, firstName, role, message }
    let fullUser = authData;
    try {
      if (authData.id) {
        const profile = await getUserProfile(authData.id);
        fullUser = { ...authData, ...profile };
      }
    } catch (err) {
      console.warn('Impossible de charger le profil complet après login:', err);
    }

    setUser(fullUser);
    localStorage.setItem('urbanet_user', JSON.stringify(fullUser));
    return fullUser;
  };

  const register = async (data) => {
    return await apiRegister(data);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('urbanet_user');
  };

  const updateUserState = (updatedData) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedData };
      localStorage.setItem('urbanet_user', JSON.stringify(merged));
      return merged;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
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
