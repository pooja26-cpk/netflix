import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../hooks/useAuth';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const navigate = useNavigate();

  // Set default Authorization header for all axios requests
  useEffect(() => {
    if (user?.accessToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${user.accessToken}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [user]);

  const login = async (email, password) => {
    try {
      const res = await axios.post('/auth/login', { email, password });
      const userData = { ...res.data.user, accessToken: res.data.accessToken };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.accessToken}`;
      navigate('/');
      return res.data;
    } catch (err) {
      console.error('Login error:', err);
      throw err;
    }
  };

  const register = async (username, email, password) => {
    try {
      const res = await axios.post('/auth/signup', { username, email, password });
      const userData = { ...res.data.user, accessToken: res.data.accessToken };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.accessToken}`;
      navigate('/');
      return res.data;
    } catch (err) {
      console.error('Register error:', err);
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    navigate('/login');
  };

  const value = {
    user,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
