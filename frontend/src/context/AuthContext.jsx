import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginApi, registerApi, getMeApi } from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('aura_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('aura_token'));
  const [loading, setLoading] = useState(true);

  // Validate existing token on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('aura_token');
      if (storedToken) {
        try {
          const userData = await getMeApi();
          setUser(userData);
          localStorage.setItem('aura_user', JSON.stringify(userData));
        } catch (err) {
          console.error('Session expired or invalid:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (firstArg, secondArg) => {
    // If called with user object and token directly: login(user, token)
    if (typeof firstArg === 'object' && firstArg !== null && secondArg) {
      localStorage.setItem('aura_token', secondArg);
      localStorage.setItem('aura_user', JSON.stringify(firstArg));
      setToken(secondArg);
      setUser(firstArg);
      return firstArg;
    }
    // Otherwise called with credentials: login(email, password)
    const data = await loginApi({ email: firstArg, password: secondArg });
    localStorage.setItem('aura_token', data.access_token);
    localStorage.setItem('aura_user', JSON.stringify(data.user));
    setToken(data.access_token);
    setUser(data.user);
    return data.user;
  };

  const register = async (name, email, password) => {
    const data = await registerApi({ name, email, password });
    localStorage.setItem('aura_token', data.access_token);
    localStorage.setItem('aura_user', JSON.stringify(data.user));
    setToken(data.access_token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('aura_token');
    localStorage.removeItem('aura_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
