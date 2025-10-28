// services/lacorns.js (ПОЛНОСТЬЮ ИСПРАВЛЕННАЯ ВЕРСИЯ)
import api from './api';

const API_BASE_URL = '';

export const lacornService = {
  // Получение лако́рна по ID
  async getLacornById(id, config = {}) {
    try {
      console.log(`Fetching lacorn by ID: ${id}`);
      const response = await api.get(`${API_BASE_URL}/lacorns/${id}`, config);
      console.log('Lacorn response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching lacorn ${id}:`, error);
      throw error;
    }
  },

  // Получение эпизодов лако́рна
  async getEpisodes(lacornId, config = {}) {
    try {
      console.log(`Fetching episodes for lacorn: ${lacornId}`);
      const response = await api.get(`${API_BASE_URL}/lacorns/${lacornId}/episodes`, config);
      console.log('Episodes response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching episodes for lacorn ${lacornId}:`, error);
      // Возвращаем пустой массив вместо ошибки
      return [];
    }
  },

  // Получение актёров лако́рна
  async getActors(lacornId, config = {}) {
    try {
      console.log(`Fetching actors for lacorn: ${lacornId}`);
      const response = await api.get(`${API_BASE_URL}/lacorns/${lacornId}/actors`, config);
      console.log('Actors response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching actors for lacorn ${lacornId}:`, error);
      // Возвращаем пустой массив вместо ошибки
      return [];
    }
  },

  // Генерация URL видео
  async generateVideoUrl(episodeId, voicecoverType = 'subbed', config = {}) {
    try {
      console.log(`Generating video URL for episode: ${episodeId}, voicecover: ${voicecoverType}`);
      const response = await api.get(
        `${API_BASE_URL}/lacorns/episodes/${episodeId}/video?voicecover=${voicecoverType}`,
        config
      );
      return response.data;
    } catch (error) {
      console.error(`Error generating video URL for episode ${episodeId}:`, error);
      // Возвращаем fallback URL
      return `/videos/episode_${episodeId}_${voicecoverType}.mp4`;
    }
  },

  // Обновление прогресса просмотра
  async updateWatchProgress(watchData, token) {
    try {
      const config = token ? {
        headers: { Authorization: `Bearer ${token}` }
      } : {};

      const response = await api.post(`${API_BASE_URL}/lacorns/watch`, watchData, config);
      return response.data;
    } catch (error) {
      console.error('Error updating watch progress:', error);
      throw error;
    }
  },

  // Получение популярных лако́рнов
  async getPopularLacorns(page = 0, size = 20, token = null, userId = null) {
    try {
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (userId) headers['X-User-Id'] = userId.toString();

      const response = await api.get(`${API_BASE_URL}/lacorns/sorted/rating`, {
        params: { size },
        headers
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching popular lacorns:', error);
      throw error;
    }
  }
};

export const userCollectionService = {
  async addToCollection(userId, collectionName, lacornId, token) {
    try {
      const response = await api.post(
        `${API_BASE_URL}/users/${userId}/collections/${collectionName}/series/${lacornId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Error adding to collection:', error);
      throw error;
    }
  }
};