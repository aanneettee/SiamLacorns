import api from './api';

export const authService = {
  async login(username, password) {
    try {
      console.log('authService: Sending login request for:', username);
      const response = await api.post('/auth/login', {
        username,
        password
      });

      console.log('authService: Login response received:', response.data);

      if (response.data.token) {
        // Сохраняем токен в localStorage
        localStorage.setItem('token', JSON.stringify(response.data.token));
      }

      return response.data;
    } catch (error) {
      console.error('authService: Login error:', error);
      // Очищаем токен при ошибке
      localStorage.removeItem('token');
      throw error;
    }
  },

  async register(userData) {
    try {
      console.log('authService: Registering user:', userData);
      const response = await api.post('/users/register', userData);
      return response.data;
    } catch (error) {
      console.error('authService: Registration error:', error);
      throw error;
    }
  },

  async getCurrentUser() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      console.log('authService: Getting current user...');
      const response = await api.get('/users/me');
      console.log('authService: Current user data:', response.data);
      return response.data;
    } catch (error) {
      console.error('authService: Get current user error:', error);
      // Очищаем токен при ошибке авторизации
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
      }
      throw error;
    }
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('authService: Logout error:', error);
    } finally {
      localStorage.removeItem('token');
    }
  }
};