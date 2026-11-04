import api from './client';

/**
 * Checks the status of the backend API.
 * Calls both /api/v1/health via API client and direct /health.
 */
export const checkHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};
