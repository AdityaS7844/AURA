import api from './client';

/**
 * Fetch current user preferences
 * GET /api/v1/preferences
 */
export const getPreferencesApi = async () => {
  const response = await api.get('/preferences');
  return response.data;
};

/**
 * Update current user preferences
 * PUT /api/v1/preferences
 */
export const updatePreferencesApi = async (data) => {
  const response = await api.put('/preferences', data);
  return response.data;
};
