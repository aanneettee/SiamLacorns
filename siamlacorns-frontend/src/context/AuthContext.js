import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { authService } from '../services/auth';
import { useLocalStorage } from '../hooks/useLocalStorage';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useLocalStorage('token', null);
  const [loading, setLoading] = useState(true);
  const [validationAttempted, setValidationAttempted] = useState(false);

  const validateToken = useCallback(async () => {
    if (!token) {
      setLoading(false);
      setValidationAttempted(true);
      return;
    }

    try {
      console.log('AuthContext: Validating token...');
      const userData = await authService.getCurrentUser();
      console.log('AuthContext: User data received:', userData);

      if (userData && (userData.id || userData.username)) {
        setUser(userData);
      } else {
        console.warn('AuthContext: Incomplete user data, clearing token');
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error('AuthContext: Token validation failed:', error);
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
      setValidationAttempted(true);
    }
  }, [token, setToken]);

  useEffect(() => {
    // Запускаем валидацию только если еще не пытались и есть токен
    if (!validationAttempted && token) {
      validateToken();
    } else if (!token) {
      setLoading(false);
      setValidationAttempted(true);
    }
  }, [token, validationAttempted, validateToken]);

  const login = async (username, password) => {
    try {
      setLoading(true);
      console.log('AuthContext: Attempting login with username:', username);

      const response = await authService.login(username, password);
      console.log('AuthContext: Login response:', response);

      setToken(response.token);

      console.log('AuthContext: Getting current user data...');
      try {
        const userData = await authService.getCurrentUser();
        console.log('AuthContext: Current user data received:', userData);

        if (userData && userData.id && userData.username) {
          setUser(userData);
          console.log('AuthContext: Login successful, user set:', userData);
        } else {
          console.warn('AuthContext: Incomplete user data from server, creating temporary user');
          const tempUser = {
            id: Date.now(),
            username: username,
            email: `${username}@example.com`,
            role: 'USER',
            name: username,
          };
          setUser(tempUser);
          console.log('AuthContext: Temporary user set:', tempUser);
        }
      } catch (userError) {
        console.error('AuthContext: Error getting user data:', userError);
        const tempUser = {
          id: Date.now(),
          username: username,
          email: `${username}@example.com`,
          role: 'USER',
          name: username,
        };
        setUser(tempUser);
        console.log('AuthContext: Fallback user set due to error:', tempUser);
      }

      return response;
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      setToken(null);
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      console.log('AuthContext: Registering user:', userData);
      const response = await authService.register(userData);
      await login(userData.username, userData.password);
      return response;
    } catch (error) {
      console.error('AuthContext: Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (updatedUserData) => {
    setUser(prevUser => ({
      ...prevUser,
      ...updatedUserData
    }));
  };

  const logout = () => {
    console.log('AuthContext: Logging out');
    setToken(null);
    setUser(null);
    setValidationAttempted(false);
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    updateUser,
    loading,
    validateToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};