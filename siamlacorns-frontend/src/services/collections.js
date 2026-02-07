import api from './api';

export const collectionService = {
   getUserCollections: async (userId, token) => {
      const response = await api.get(`${API_BASE_URL}/api/users/${userId}/collections`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },

  addToCollection: async (userId, collectionName, lacornId, token) => {
      const response = await api.post(
        `${API_BASE_URL}/api/users/${userId}/collections/${collectionName}/series/${lacornId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
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

   removeFromCollection: async (userId, collectionName, lacornId, token) => {
      const response = await api.delete(
        `${API_BASE_URL}/api/users/${userId}/collections/${collectionName}/series/${lacornId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
   },

    getCollection: async (userId, collectionName, token) => {
        const response = await api.get(
          `${API_BASE_URL}/api/users/${userId}/collections/${collectionName}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    }

};