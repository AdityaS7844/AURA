import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Sparkles,
  RotateCcw,
  CloudSun,
  Shirt,
  Filter,
  SlidersHorizontal,
  ChevronRight,
  AlertCircle,
  Plus,
  Compass,
  X,
  Layers,
  Thermometer,
} from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import OccasionSelector from '../components/outfit/OccasionSelector';
import AnchorItemPickerModal from '../components/outfit/AnchorItemPickerModal';
import StylistLoadingSkeleton from '../components/outfit/StylistLoadingSkeleton';
import OutfitCard from '../components/outfit/OutfitCard';
import { suggestOutfitsApi } from '../api/outfits';
import { listItemsApi } from '../api/wardrobe';
import { getPreferencesApi } from '../api/preferences';
import { useWeather } from '../hooks/useWeather';

const STYLE_OPTIONS = [
  { id: '', label: 'Use Profile Default' },
  { id: 'casual', label: 'Casual' },
  { id: 'formal', label: 'Formal' },
  { id: 'sporty', label: 'Sporty' },
  { id: 'streetwear', label: 'Streetwear' },
  { id: 'ethnic', label: 'Ethnic' },
  { id: 'minimal', label: 'Minimal' },
];

export default function StylistPage() {
  const [searchParams] = useSearchParams();
  const initialOccasion = searchParams.get('occasion') || 'casual';

  // Form State
  const [occasion, setOccasion] = useState(initialOccasion);
  const [selectedStyle, setSelectedStyle] = useState('');
  const [anchorItem, setAnchorItem] = useState(null);
  const [outfitCount, setOutfitCount] = useState(4);
  const [isAnchorModalOpen, setIsAnchorModalOpen] = useState(false);

  // Manual Weather Override
  const [useCustomTemp, setUseCustomTemp] = useState(false);
  const [customTemp, setCustomTemp] = useState('');

  // User Wardrobe State & Preconditions
  const [wardrobeItems, setWardrobeItems] = useState([]);
  const [wardrobeLoading, setWardrobeLoading] = useState(true);
  const [hasSufficientWardrobe, setHasSufficientWardrobe] = useState(true);
  const [userCity, setUserCity] = useState('Mumbai');

  // AI Recommendation Results State
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [allGeneratedOutfitIds, setAllGeneratedOutfitIds] = useState([]);

  // Fetch Live Weather for user's home city
  const { weather: liveWeather, loading: weatherLoading } = useWeather(userCity);

  // Load User Preferences & Wardrobe check on mount
  useEffect(() => {
    const loadPrerequisites = async () => {
      try {
        setWardrobeLoading(true);
        const [prefs, wardrobeData] = await Promise.all([
          getPreferencesApi(),
          listItemsApi({ limit: 100 }),
        ]);

        if (prefs?.city) {
          setUserCity(prefs.city);
        }
        if (prefs?.styles && prefs.styles.length > 0 && !selectedStyle) {
          // Can keep empty to use profile default
        }

        const items = wardrobeData.items || [];
        setWardrobeItems(items);

        // Precondition check: (at least 1 top AND at least 1 bottom) OR at least 1 dress
        const hasTop = items.some((it) => it.category === 'top');
        const hasBottom = items.some((it) => it.category === 'bottom');
        const hasDress = items.some((it) => it.category === 'dress');
        setHasSufficientWardrobe((hasTop && hasBottom) || hasDress);
      } catch (err) {
        console.error('Failed to load stylist prerequisites:', err);
      } finally {
        setWardrobeLoading(false);
      }
    };
    loadPrerequisites();
  }, []);

  // Handle Form Submission
  const handleGenerate = async (excludePrior = false) => {
    setError(null);
    setLoading(true);

    try {
      const excludeIds = excludePrior ? allGeneratedOutfitIds : [];
      const response = await suggestOutfitsApi({
        occasion,
        city: userCity,
        temp_c: useCustomTemp && customTemp !== '' ? customTemp : undefined,
        style: selectedStyle || undefined,
        anchor_item_id: anchorItem?.id || undefined,
        count: outfitCount,
        exclude_outfit_ids: excludeIds,
      });

      setResults(response);

      // Track generated outfit IDs for Try Again exclusion
      const newIds = response.outfits.map((o) => o.id);
      setAllGeneratedOutfitIds((prev) => Array.from(new Set([...prev, ...newIds])));
    } catch (err) {
      console.error('Styling recommendation error:', err);
      const detail = err.response?.data?.detail || 'Unable to generate outfits. Please check your wardrobe and try again.';
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  // Precondition Failure: Empty or Insufficient Wardrobe View
  if (!wardrobeLoading && !hasSufficientWardrobe) {
    return (
      <AppLayout>
        <div className="p-6 sm:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
          <div className="bg-[var(--color-aura-surface)] rounded-3xl border border-[var(--color-aura-border)] p-8 sm:p-12 text-center space-y-6 shadow-sm">
            <div className="w-16 h-16 rounded-3xl bg-[var(--color-aura-lavender)] text-[var(--color-aura-primary)] flex items-center justify-center mx-auto shadow-sm">
              <Shirt className="w-8 h-8" />
            </div>

            <div className="max-w-md mx-auto space-y-2">
              <h2 className="text-2xl font-bold text-[var(--color-aura-text)] font-[var(--font-heading)]">
                More Clothes Needed to Style
              </h2>
              <p className="text-xs sm:text-sm text-[var(--color-aura-muted)] leading-relaxed">
                To generate complete, wearable outfits with Gemini, your wardrobe needs at least <strong>one top and one bottom</strong>, or at least <strong>one dress</strong>.
              </p>
            </div>

            <div className="pt-2">
              <Link
                to="/wardrobe/add"
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl text-xs font-bold text-white bg-[var(--color-aura-primary)] hover:bg-[var(--color-aura-accent)] transition-all shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Clothes to Wardrobe</span>
              </Link>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 sm:p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-200">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[var(--color-aura-border)]">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-[var(--color-aura-primary)] text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-aura-text)] font-[var(--font-heading)]">
                AI Personal Stylist
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[var(--color-aura-muted)] mt-1.5">
              Powered by Google Gemini 2.5 Flash • Contextualized with live weather and your real wardrobe items
            </p>
          </div>

          {results && (
            <button
              onClick={() => {
                setResults(null);
                setError(null);
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--color-aura-muted)] border border-[var(--color-aura-border)] hover:bg-gray-50 flex items-center space-x-2 self-start cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>New Request</span>
            </button>
          )}
        </div>

        {/* Loading Skeleton */}
        {loading && <StylistLoadingSkeleton />}

        {/* Results View */}
        {!loading && results && (
          <div className="space-y-6">
            {/* Context Weather Badge & Try Again Header */}
            <div className="bg-[var(--color-aura-surface)] p-4 sm:p-6 rounded-3xl border border-[var(--color-aura-border)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                  <CloudSun className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-[var(--color-aura-text)]">
                      {results.weather?.city} • {Math.round(results.weather?.temp_c)}°C ({results.weather?.class})
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 font-semibold text-[var(--color-aura-muted)] capitalize">
                      {results.weather?.condition}
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--color-aura-muted)] mt-0.5">
                    Recommended for <strong className="capitalize text-[var(--color-aura-primary)]">{occasion}</strong> occasion
                    {anchorItem && <span> • Built around <strong>{anchorItem.name}</strong></span>}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleGenerate(true)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[var(--color-aura-primary)] hover:bg-[var(--color-aura-accent)] transition-all shadow-xs flex items-center space-x-2 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Try Again (New Variations)</span>
                </button>
              </div>
            </div>

            {/* Recommendations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {results.outfits?.map((outfit) => (
                <OutfitCard key={outfit.id} outfit={outfit} />
              ))}
            </div>
          </div>
        )}

        {/* Styling Request Form (Shown when no results or when editing) */}
        {!loading && !results && (
          <div className="bg-[var(--color-aura-surface)] rounded-3xl border border-[var(--color-aura-border)] p-6 sm:p-8 space-y-8 shadow-xs">
            {/* Error Alert */}
            {error && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">Recommendation could not be generated</p>
                  <p className="text-red-600">{error}</p>
                </div>
              </div>
            )}

            {/* 1. Occasion Selector */}
            <OccasionSelector value={occasion} onChange={setOccasion} />

            {/* 2. Environmental & Weather Preview */}
            <div className="space-y-3 pt-4 border-t border-[var(--color-aura-border)]">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-aura-muted)]">
                  Environmental Weather
                </label>
                <button
                  type="button"
                  onClick={() => setUseCustomTemp(!useCustomTemp)}
                  className="text-xs text-[var(--color-aura-primary)] hover:underline font-semibold cursor-pointer"
                >
                  {useCustomTemp ? 'Use Live Weather' : 'Override Temperature'}
                </button>
              </div>

              {!useCustomTemp ? (
                <div className="p-4 rounded-2xl bg-[var(--color-aura-page)] border border-[var(--color-aura-border)] flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CloudSun className="w-5 h-5 text-amber-500" />
                    <div>
                      <p className="text-xs font-bold text-[var(--color-aura-text)]">
                        {userCity} • {liveWeather ? `${Math.round(liveWeather.temp_c)}°C (${liveWeather.weather_class})` : 'Loading weather...'}
                      </p>
                      <p className="text-[10px] text-[var(--color-aura-muted)]">
                        {liveWeather ? liveWeather.condition : 'Fetching live conditions'}
                      </p>
                    </div>
                  </div>
                  {liveWeather?.is_rainy && (
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 font-bold">
                      Rain Expected
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-3 p-4 rounded-2xl bg-[var(--color-aura-page)] border border-[var(--color-aura-border)]">
                  <Thermometer className="w-5 h-5 text-[var(--color-aura-primary)]" />
                  <div className="flex-1">
                    <input
                      type="number"
                      step="0.5"
                      placeholder="e.g. 18 for cool, 32 for hot (°C)"
                      value={customTemp}
                      onChange={(e) => setCustomTemp(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-[var(--color-aura-surface)] border border-[var(--color-aura-border)] focus:outline-hidden focus:ring-2 focus:ring-[var(--color-aura-primary)]"
                    />
                  </div>
                  <span className="text-xs font-bold text-[var(--color-aura-muted)]">°C</span>
                </div>
              )}
            </div>

            {/* 3. Anchor Item (Optional) */}
            <div className="space-y-3 pt-4 border-t border-[var(--color-aura-border)]">
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-aura-muted)]">
                Anchor Item <span className="font-normal lowercase text-[10px]">(optional - build outfit around this)</span>
              </label>

              {anchorItem ? (
                <div className="flex items-center justify-between p-3 rounded-2xl border border-[var(--color-aura-primary)] bg-[var(--color-aura-lavender)]">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-white overflow-hidden border border-[var(--color-aura-border)] flex items-center justify-center">
                      {anchorItem.image_url ? (
                        <img src={anchorItem.image_url} alt={anchorItem.name} className="w-full h-full object-cover" />
                      ) : (
                        <Shirt className="w-6 h-6 text-[var(--color-aura-primary)]" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[var(--color-aura-text)]">{anchorItem.name}</p>
                      <p className="text-[10px] text-[var(--color-aura-muted)] capitalize">{anchorItem.category} • {anchorItem.color_name}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setAnchorItem(null)}
                    className="p-1.5 rounded-lg text-[var(--color-aura-muted)] hover:text-red-600 hover:bg-white transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAnchorModalOpen(true)}
                  className="w-full py-4 border-2 border-dashed border-[var(--color-aura-border)] hover:border-[var(--color-aura-primary)] rounded-2xl flex items-center justify-center space-x-2 text-xs font-bold text-[var(--color-aura-muted)] hover:text-[var(--color-aura-primary)] hover:bg-[var(--color-aura-lavender)]/20 transition-all cursor-pointer"
                >
                  <Shirt className="w-4 h-4" />
                  <span>Choose an Anchor Wardrobe Item</span>
                </button>
              )}
            </div>

            {/* 4. Optional Style Aesthetic & Count Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-[var(--color-aura-border)]">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-aura-muted)] mb-2">
                  Style Preference <span className="font-normal lowercase text-[10px]">(optional)</span>
                </label>
                <select
                  value={selectedStyle}
                  onChange={(e) => setSelectedStyle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[var(--color-aura-surface)] border border-[var(--color-aura-border)] focus:outline-hidden focus:ring-2 focus:ring-[var(--color-aura-primary)] font-medium cursor-pointer"
                >
                  {STYLE_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-aura-muted)] mb-2">
                  Number of Recommendations: <strong>{outfitCount}</strong>
                </label>
                <div className="flex items-center space-x-2">
                  {[3, 4, 5].map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setOutfitCount(cnt)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        outfitCount === cnt
                          ? 'border-[var(--color-aura-primary)] bg-[var(--color-aura-lavender)] text-[var(--color-aura-primary)]'
                          : 'border-[var(--color-aura-border)] bg-[var(--color-aura-surface)] text-[var(--color-aura-muted)] hover:bg-gray-50'
                      }`}
                    >
                      {cnt} Outfits
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <div className="pt-4">
              <button
                type="button"
                onClick={() => handleGenerate(false)}
                className="w-full py-3.5 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-[var(--color-aura-primary)] to-[var(--color-aura-accent)] hover:opacity-95 shadow-lg shadow-[var(--color-aura-primary)]/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Sparkles className="w-5 h-5" />
                <span>Generate Outfits with Gemini</span>
              </button>
            </div>
          </div>
        )}

        {/* Anchor Item Picker Modal */}
        <AnchorItemPickerModal
          isOpen={isAnchorModalOpen}
          onClose={() => setIsAnchorModalOpen(false)}
          onSelect={setAnchorItem}
          currentSelectedId={anchorItem?.id}
        />
      </div>
    </AppLayout>
  );
}
