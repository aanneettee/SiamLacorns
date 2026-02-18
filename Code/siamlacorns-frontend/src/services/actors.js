import api from './api';

export const actorService = {
  async getActorById(id, config = {}) {
    try {
      console.log(`Fetching actor by ID: ${id}`);
      const response = await api.get(`/actors/${id}`, config);
      console.log('Actor response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching actor ${id}:`, error);
      throw error;
    }
  },

  async getAwards(actorId, config = {}) {
    try {
      console.log(`Fetching awards for actor: ${actorId}`);
      const response = await api.get(`/actors/${actorId}/awards`, config);
      console.log('Awards response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching awards for actor ${actorId}:`, error);
      return [];
    }
  },

  async getPopularActors(page = 0, size = 20, config = {}) {
    try {
      const response = await api.get(`/actors/popular`, {
        params: { page, size },
        ...config
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching popular actors:', error);
      throw error;
    }
  },

  async searchActors(query, config = {}) {
    try {
      const response = await api.get(`/actors/search`, {
        params: { q: query },
        ...config
      });
      return response.data;
    } catch (error) {
      console.error('Error searching actors:', error);
      return [];
    }
  },

  async getAllActors() {
    const response = await api.get('/actors');
    return response.data;
  }
};

export default actorService;