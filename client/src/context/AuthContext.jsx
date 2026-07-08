import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const verifyUserSession = useCallback(async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    verifyUserSession();
  }, [verifyUserSession]);

    const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        setUser(res.data.user);
        showToast('Welcome back, ' + res.data.user.name + '!', 'success');
        return { success: true, user: res.data.user };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      showToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const signup = async (formData) => {
    try {
      const res = await api.post('/auth/signup', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (res.data.success) {
        setUser(res.data.user);
        showToast('Registration successful! Welcome to StayNear.', 'success');
        return { success: true, user: res.data.user };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Sign up failed. Please try again.';
      showToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
      setUser(null);
      showToast('Logged out successfully', 'info');
    } catch (err) {
      showToast('Failed to log out.', 'error');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, checkAuth: verifyUserSession }}>
      {children}
    </AuthContext.Provider>
  );
};
