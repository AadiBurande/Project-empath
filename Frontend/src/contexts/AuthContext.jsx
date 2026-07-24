// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchApi } from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('empath_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('empath_token');
      if (token) {
        try {
          const res = await fetchApi('/auth/me');
          if (res.success) {
            setUser(res.user);
            localStorage.setItem('empath_user', JSON.stringify(res.user));
          }
        } catch (e) {
          console.warn('Auth token expired or invalid:', e);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (res.success) {
      localStorage.setItem('empath_token', res.token);
      localStorage.setItem('empath_user', JSON.stringify(res.user));
      setUser(res.user);
    }
    return res;
  };

  const register = async (userData) => {
    const res = await fetchApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    if (res.success) {
      localStorage.setItem('empath_token', res.token);
      localStorage.setItem('empath_user', JSON.stringify(res.user));
      setUser(res.user);
    }
    return res;
  };

  const logout = () => {
    localStorage.removeItem('empath_token');
    localStorage.removeItem('empath_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
