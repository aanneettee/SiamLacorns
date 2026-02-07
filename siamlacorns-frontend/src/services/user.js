import api from './api';

export const userService = {
  getUserCollections: async (userId) => {
    const response = await api.get(`/users/${userId}/collections`);
    return response.data;
  },

  createCollection: async (userId, collectionName) => {
    // Этот эндпоинт нужно добавить в бэкенд
    const response = await api.post(`/users/${userId}/collections`, {
      name: collectionName
    });
    return response.data;
  },

  addToCollection: async (userId, collectionName, seriesId) => {
    const response = await api.post(
      `/users/${userId}/collections/${collectionName}/series/${seriesId}`
    );
    return response.data;
  },

  removeFromCollection: async (userId, collectionName, seriesId) => {
    const response = await api.delete(
      `/users/${userId}/collections/${collectionName}/series/${seriesId}`
    );
    return response.data;
  }
};