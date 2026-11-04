import React from 'react';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudFog,
  Snowflake,
  Droplets,
  Thermometer,
  RotateCw,
  AlertTriangle,
} from 'lucide-react';
import { useWeather } from '../../hooks/useWeather';

const CLASS_BADGES = {
  hot: 'bg-red-50 text-red-700 border-red-200',
  warm: 'bg-amber-50 text-amber-700 border-amber-200',
  mild: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cool: 'bg-blue-50 text-blue-700 border-blue-200',
  cold: 'bg-indigo-50 text-indigo-700 border-indigo-200',
};

export default function WeatherCard({ city }) {
  const { weather, loading, error, refetch } = useWeather(city);

  const getWeatherIcon = (condition, isRainy) => {
    const c = (condition || '').toLowerCase();
    if (isRainy || c.includes('rain') || c.includes('drizzle')) return <CloudRain className="w-8 h-8 text-blue-500" />;
    if (c.includes('thunder')) return <CloudLightning className="w-8 h-8 text-purple-600" />;
    if (c.includes('snow')) return <Snowflake className="w-8 h-8 text-sky-400" />;
    if (c.includes('fog')) return <CloudFog className="w-8 h-8 text-gray-400" />;
    if (c.includes('cloud') || c.includes('overcast')) return <CloudSun className="w-8 h-8 text-amber-500" />;
    return <Sun className="w-8 h-8 text-amber-500" />;
  };

  if (loading) {
    return (
      <div className="bg-[var(--color-aura-surface)] rounded-2xl border border-[var(--color-aura-border)] p-5 shadow-xs animate-pulse">
        <div className="flex justify-between items-center mb-3">
          <div className="h-4 bg-gray-200 rounded-md w-1/3" />
          <div className="h-4 bg-gray-200 rounded-md w-1/4" />
        </div>
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gray-200 rounded-2xl" />
          <div className="space-y-1.5 flex-1">
            <div className="h-6 bg-gray-200 rounded-md w-1/2" />
            <div className="h-3 bg-gray-200 rounded-md w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="bg-[var(--color-aura-surface)] rounded-2xl border border-[var(--color-aura-border)] p-5 shadow-xs">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span className="text-xs font-bold font-[var(--font-heading)]">Weather Unavailable</span>
          </div>
          <button
            onClick={refetch}
            className="text-[var(--color-aura-muted)] hover:text-[var(--color-aura-text)] transition-colors cursor-pointer"
            title="Retry"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-xs text-[var(--color-aura-muted)] mt-2">
          {error || 'Unable to contact live weather service.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-aura-surface)] rounded-2xl border border-[var(--color-aura-border)] p-5 shadow-xs hover:border-[var(--color-aura-accent)] transition-all">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-aura-muted)] block">
            Local Weather
          </span>
          <h3 className="text-sm font-bold font-[var(--font-heading)] text-[var(--color-aura-text)]">
            {weather.city}
          </h3>
        </div>

        <div className="flex items-center space-x-2">
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
              CLASS_BADGES[weather.class] || 'bg-gray-50 text-gray-700 border-gray-200'
            }`}
          >
            {weather.class}
          </span>
          <button
            onClick={refetch}
            className="p-1 rounded-lg text-[var(--color-aura-muted)] hover:text-[var(--color-aura-text)] hover:bg-gray-100 transition-colors cursor-pointer"
            title="Refresh weather"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[var(--color-aura-page)] border border-[var(--color-aura-border)] flex items-center justify-center shrink-0">
            {getWeatherIcon(weather.condition, weather.is_rainy)}
          </div>
          <div>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-bold font-[var(--font-heading)] text-[var(--color-aura-text)]">
                {weather.temp_c}°C
              </span>
              <span className="text-xs text-[var(--color-aura-muted)]">
                (Feels {weather.feels_like_c}°C)
              </span>
            </div>
            <p className="text-xs text-[var(--color-aura-muted)] capitalize mt-0.5">
              {weather.condition}
            </p>
          </div>
        </div>

        <div className="text-right text-xs">
          <div className="flex items-center justify-end space-x-1 text-blue-600 font-semibold">
            <Droplets className="w-3.5 h-3.5" />
            <span>{weather.rain_probability}%</span>
          </div>
          <span className="text-[10px] text-[var(--color-aura-muted)] block mt-0.5">Rain chance</span>
        </div>
      </div>

      {weather.is_rainy && (
        <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center space-x-1.5 text-[11px] text-blue-700 font-medium">
          <CloudRain className="w-3.5 h-3.5 shrink-0" />
          <span>Rain forecasted — water-resistant outerwear or umbrellas recommended.</span>
        </div>
      )}
    </div>
  );
}
