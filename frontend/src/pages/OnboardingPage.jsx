import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, ArrowLeft, Check, Compass, Palette, MapPin } from 'lucide-react';
import { updatePreferencesApi } from '../api/preferences';
import ColorSwatchPicker from '../components/common/ColorSwatchPicker';
import { STYLES } from '../utils/constants';

const STYLE_DESCRIPTIONS = {
  casual: 'Relaxed, everyday comfort for home, campus, and outings',
  formal: 'Crisp suits, tailored trousers, and professional corporate wear',
  sporty: 'Athletic wear, activewear, and performance sneakers',
  streetwear: 'Urban contemporary fashion, oversized silhouettes, and statement pieces',
  ethnic: 'Traditional kurtas, ethnic sets, and cultural heritage garments',
  minimal: 'Clean lines, neutral tones, and simple timeless essentials',
};

const POPULAR_CITIES = ['Mumbai', 'Pune', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai', 'Kolkata'];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [selectedStyles, setSelectedStyles] = useState(['casual']);
  const [favoriteColors, setFavoriteColors] = useState(['#1F2A44', '#FFFFFF', '#4B2E9E']);
  const [avoidColors, setAvoidColors] = useState([]);
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const toggleStyle = (style) => {
    if (selectedStyles.includes(style)) {
      if (selectedStyles.length > 1) {
        setSelectedStyles(selectedStyles.filter((s) => s !== style));
      }
    } else {
      setSelectedStyles([...selectedStyles, style]);
    }
  };

  const handleFinish = async (isSkipped = false) => {
    setLoading(true);
    setError('');
    try {
      if (isSkipped) {
        await updatePreferencesApi({ onboarding_done: true });
      } else {
        await updatePreferencesApi({
          styles: selectedStyles,
          favorite_colors: favoriteColors,
          avoid_colors: avoidColors,
          city: city.trim() || null,
          onboarding_done: true,
        });
      }
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Error saving onboarding preferences:', err);
      setError(err.response?.data?.detail || 'Failed to save preferences.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-aura-page)] flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <header className="max-w-2xl mx-auto w-full text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[var(--color-aura-primary)] text-white shadow-md mb-3">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold font-[var(--font-heading)] text-[var(--color-aura-text)]">
          Welcome to <span className="text-[var(--color-aura-primary)]">AURA</span>
        </h1>
        <p className="text-sm text-[var(--color-aura-muted)] mt-1">
          Let's tailor your AI stylist to match your personal taste.
        </p>

        {/* Step Indicator Progress Bar */}
        <div className="flex items-center justify-center space-x-3 mt-6 max-w-xs mx-auto">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1 flex items-center">
              <div
                className={`h-2 w-full rounded-full transition-colors ${
                  step >= s ? 'bg-[var(--color-aura-primary)]' : 'bg-[var(--color-aura-border)]'
                }`}
              />
            </div>
          ))}
        </div>
      </header>

      {/* Wizard Step Container */}
      <main className="max-w-xl mx-auto w-full flex-1 flex flex-col justify-center">
        <div className="bg-[var(--color-aura-surface)] p-6 sm:p-8 rounded-3xl border border-[var(--color-aura-border)] shadow-sm">
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-50 text-red-700 text-xs font-medium border border-red-200">
              {error}
            </div>
          )}

          {/* STEP 1: Preferred Styles */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 pb-4 border-b border-[var(--color-aura-border)]">
                <div className="p-2.5 rounded-xl bg-[var(--color-aura-lavender)] text-[var(--color-aura-primary)]">
                  <Compass className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold font-[var(--font-heading)]">Step 1: Your Style Aesthetic</h2>
                  <p className="text-xs text-[var(--color-aura-muted)]">Select one or more styles you enjoy wearing</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {STYLES.map((style) => {
                  const isSelected = selectedStyles.includes(style);
                  return (
                    <button
                      key={style}
                      type="button"
                      onClick={() => toggleStyle(style)}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative ${
                        isSelected
                          ? 'border-[var(--color-aura-primary)] bg-[var(--color-aura-lavender)]/20 shadow-xs'
                          : 'border-[var(--color-aura-border)] hover:border-gray-300 bg-[var(--color-aura-surface)]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm capitalize text-[var(--color-aura-text)]">
                          {style}
                        </span>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-[var(--color-aura-primary)] text-white flex items-center justify-center">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-[var(--color-aura-muted)] line-clamp-2">
                        {STYLE_DESCRIPTIONS[style]}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Color Palette */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 pb-4 border-b border-[var(--color-aura-border)]">
                <div className="p-2.5 rounded-xl bg-[var(--color-aura-lavender)] text-[var(--color-aura-primary)]">
                  <Palette className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold font-[var(--font-heading)]">Step 2: Color Preferences</h2>
                  <p className="text-xs text-[var(--color-aura-muted)]">Pick your go-to wardrobe shades and any colors you dislike</p>
                </div>
              </div>

              <div className="space-y-6">
                <ColorSwatchPicker
                  label="Favorite Colors"
                  description="Colors that look great on you or that you wear frequently"
                  selectedColors={favoriteColors}
                  onChange={setFavoriteColors}
                />

                <div className="pt-2 border-t border-gray-100">
                  <ColorSwatchPicker
                    label="Colors to Avoid"
                    description="Colors you prefer not to have in your outfit recommendations"
                    selectedColors={avoidColors}
                    onChange={setAvoidColors}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Home City */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 pb-4 border-b border-[var(--color-aura-border)]">
                <div className="p-2.5 rounded-xl bg-[var(--color-aura-lavender)] text-[var(--color-aura-primary)]">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold font-[var(--font-heading)]">Step 3: Your Home City</h2>
                  <p className="text-xs text-[var(--color-aura-muted)]">Used to suggest weather-adapted fabrics and warmth</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-aura-muted)] mb-2">
                  City Name
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Mumbai, Pune, Delhi"
                  className="block w-full px-4 py-3 rounded-xl border border-[var(--color-aura-border)] bg-[var(--color-aura-page)] focus:bg-[var(--color-aura-surface)] focus:border-[var(--color-aura-primary)] focus:ring-2 focus:ring-[var(--color-aura-primary)]/20 text-sm transition-all outline-none"
                />

                <div className="mt-4">
                  <span className="text-xs text-[var(--color-aura-muted)] font-medium">Quick suggestions:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {POPULAR_CITIES.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCity(c)}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                          city.toLowerCase() === c.toLowerCase()
                            ? 'bg-[var(--color-aura-lavender)] text-[var(--color-aura-primary)] border-[var(--color-aura-primary)] font-medium'
                            : 'border-[var(--color-aura-border)] text-[var(--color-aura-muted)] hover:bg-gray-50'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="mt-8 pt-6 border-t border-[var(--color-aura-border)] flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-medium text-[var(--color-aura-muted)] hover:text-[var(--color-aura-text)] hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleFinish(true)}
                disabled={loading}
                className="text-xs font-medium text-[var(--color-aura-muted)] hover:text-[var(--color-aura-text)] transition-colors cursor-pointer"
              >
                Skip setup for now
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[var(--color-aura-primary)] hover:bg-[var(--color-aura-accent)] transition-colors shadow-xs cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleFinish(false)}
                disabled={loading}
                className="inline-flex items-center space-x-1.5 px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-[var(--color-aura-primary)] hover:bg-[var(--color-aura-accent)] transition-colors shadow-xs cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Complete Setup</span>
                    <Check className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-[var(--color-aura-muted)] py-4">
        You can always update your preferences at any time from Profile & Settings.
      </footer>
    </div>
  );
}
