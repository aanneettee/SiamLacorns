import api from './api';

export const lacornService = {
  getAllLacorns: async (page = 0, size = 20, userId = null) => {
    const params = { page, size };
    const headers = userId ? { 'X-User-Id': userId } : {};
    const response = await api.get('/lacorns', { params, headers });
    return response.data;
  },

  getLacornById: async (id, userId = null) => {
    const headers = userId ? { 'X-User-Id': userId } : {};
    const response = await api.get(`/lacorns/${id}`, { headers });
    return response.data;
  },

  searchLacorns: async (query, page = 0, size = 20, userId = null) => {
    const params = { query, page, size };
    const headers = userId ? { 'X-User-Id': userId } : {};
    const response = await api.get('/lacorns/search', { params, headers });
    return response.data;
  },

  updateWatchProgress: async (watchRequest) => {
    const response = await api.post('/lacorns/watch', watchRequest);
    return response.data;
  },

  getWatchHistory: async () => {
    const response = await api.get('/lacorns/watch/history');
    return response.data;
  },

  getInProgress: async () => {
    const response = await api.get('/lacorns/watch/in-progress');
    return response.data;
  }
};