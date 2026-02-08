import api from './api';

const API_BASE_URL = '';

export const actorService = {
  // Получение актёра по ID
  async getActorById(id, config = {}) {
    try {
      console.log(`Fetching actor by ID: ${id}`);
      const response = await api.get(`${API_BASE_URL}/actors/${id}`, config);
      console.log('Actor response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching actor ${id}:`, error);
      throw error;
    }
  },

  // // Получение сериалов актёра (лакорнов)
  // async getLacorns(actorId, config = {}) {
  //   try {
  //     console.log(`Fetching lacorns for actor: ${actorId}`);
  //     const response = await api.get(`${API_BASE_URL}/actors/${actorId}/lacorns`, config);
  //     console.log('Actor lacorns response:', response.data);
  //     return response.data;
  //   } catch (error) {
  //     console.error(`Error fetching lacorns for actor ${actorId}:`, error);
  //     // Возвращаем пустой массив вместо ошибки
  //     return [];
  //   }
  // },

  // // Получение полной фильмографии актёра
  // async getFilmography(actorId, config = {}) {
  //   try {
  //     console.log(`Fetching filmography for actor: ${actorId}`);
  //     const response = await api.get(`${API_BASE_URL}/actors/${actorId}/filmography`, config);
  //     console.log('Filmography response:', response.data);
  //     return response.data;
  //   } catch (error) {
  //     console.error(`Error fetching filmography for actor ${actorId}:`, error);
  //     // Возвращаем пустой массив вместо ошибки
  //     return [];
  //   }
  // },

  // Получение наград актёра
  async getAwards(actorId, config = {}) {
    try {
      console.log(`Fetching awards for actor: ${actorId}`);
      const response = await api.get(`${API_BASE_URL}/actors/${actorId}/awards`, config);
      console.log('Awards response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching awards for actor ${actorId}:`, error);
      return [];
    }
  },

  // Получение популярных актёров
  async getPopularActors(page = 0, size = 20, config = {}) {
    try {
      const response = await api.get(`${API_BASE_URL}/actors/popular`, {
        params: { page, size },
        ...config
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching popular actors:', error);
      throw error;
    }
  },

  // Поиск актёров по имени
  async searchActors(query, config = {}) {
    try {
      const response = await api.get(`${API_BASE_URL}/actors/search`, {
        params: { q: query },
        ...config
      });
      return response.data;
    } catch (error) {
      console.error('Error searching actors:', error);
      return [];
    }
  }
};

export default actorService;
