import api from './client';

/**
 * Fetch weather for a given city or the user's saved home city
 * GET /api/v1/weather?city={city}
 */
export const getWeatherApi = async (city) => {
  const params = city ? { city } : {};
  const response = await api.get('/weather', { params });
  return response.data;
};
