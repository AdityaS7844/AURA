import { useState, useEffect, useCallback } from 'react';
import { getWeatherApi } from '../api/weather';

export function useWeather(city) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchWeather = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getWeatherApi(city);
      setWeather(data);
    } catch (err) {
      console.error('Failed to load weather:', err);
      setError(err.response?.data?.detail || 'Unable to retrieve current weather.');
    } finally {
      setLoading(false);
    }
  }, [city]);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  return { weather, loading, error, refetch: fetchWeather };
}
