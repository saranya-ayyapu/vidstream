import { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('userInfo', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const register = async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    // Save initial user info
    localStorage.setItem('userInfo', JSON.stringify(data));
    setUser(data);

    // Immediately mark walkthrough as seen for new users to avoid blocking tour
    try {
      await api.put('/auth/walkthrough');
      const updated = { ...data, hasSeenWalkthrough: true };
      localStorage.setItem('userInfo', JSON.stringify(updated));
      setUser(updated);
    } catch (err) {
      // Non-fatal: if this fails, the tour will still appear and user can dismiss it manually
      console.warn('Could not auto-complete walkthrough:', err?.response?.data || err.message || err);
    }

    return data;
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
  };

  const completeWalkthrough = async () => {
    try {
      await api.put('/auth/walkthrough');
      const updatedUser = { ...user, hasSeenWalkthrough: true };
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (err) {
      console.error('Failed to update walkthrough status', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, completeWalkthrough }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
