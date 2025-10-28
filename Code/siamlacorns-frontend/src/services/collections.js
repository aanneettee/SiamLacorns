import api from './api';

export const collectionService = {
  getUserCollections: async (userId) => {
    const response = await api.get(`/api/collections/user/${userId}`);
    return response.data;
  },

  addToCollection: async (collectionId, lacornId) => {
    const response = await api.post(`/collections/${collectionId}/lacorns`, {
      lacornId: lacornId
    });
    return response.data;
  },

  createCollection: async (collectionData) => {
    const response = await api.post('/collections', collectionData);
    return response.data;
  },

  getCollectionById: async (collectionId) => {
    const response = await api.get(`/collections/${collectionId}`);
    return response.data;
  },

  updateCollection: async (collectionId, collectionData) => {
    const response = await api.put(`/collections/${collectionId}`, collectionData);
    return response.data;
  },

  deleteCollection: async (collectionId) => {
    const response = await api.delete(`/collections/${collectionId}`);
    return response.data;
  },

  removeFromCollection: async (collectionId, lacornId) => {
    const response = await api.delete(`/collections/${collectionId}/lacorns/${lacornId}`);
    return response.data;
  }
};