import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, User, Lock, MapPin, Palette, Compass, Check, AlertCircle, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getPreferencesApi, updatePreferencesApi } from '../api/preferences';
import { changePasswordApi } from '../api/auth';
import ColorSwatchPicker from '../components/common/ColorSwatchPicker';
import { STYLES } from '../utils/constants';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Preferences State
  const [styles, setStyles] = useState([]);
  const [favoriteColors, setFavoriteColors] = useState([]);
  const [avoidColors, setAvoidColors] = useState([]);
  const [city, setCity] = useState('');
  const [loadingPrefs, setLoadingPrefs] = useState(true);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [prefSuccess, setPrefSuccess] = useState('');
  const [prefError, setPrefError] = useState('');

  // Password Change State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError] = useState('');

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const data = await getPreferencesApi();
        setStyles(data.styles || []);
        setFavoriteColors(data.favorite_colors || []);
        setAvoidColors(data.avoid_colors || []);
        setCity(data.city || '');
      } catch (err) {
        console.error('Failed to load preferences:', err);
        setPrefError('Failed to load wardrobe preferences.');
      } finally {
        setLoadingPrefs(false);
      }
    };

    loadPreferences();
  }, []);

  const toggleStyle = (style) => {
    if (styles.includes(style)) {
      if (styles.length > 1) {
        setStyles(styles.filter((s) => s !== style));
      }
    } else {
      setStyles([...styles, style]);
    }
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setSavingPrefs(true);
    setPrefSuccess('');
    setPrefError('');

    try {
      await updatePreferencesApi({
        styles,
        favorite_colors: favoriteColors,
        avoid_colors: avoidColors,
        city: city.trim() || null,
        onboarding_done: true,
      });
      setPrefSuccess('Style preferences updated successfully!');
      setTimeout(() => setPrefSuccess(''), 4000);
    } catch (err) {
      console.error('Error saving preferences:', err);
      setPrefError(err.response?.data?.detail || 'Failed to update preferences.');
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwSuccess('');
    setPwError('');

    if (newPassword.length < 8) {
      setPwError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwError('New passwords do not match.');
      return;
    }

    setSavingPassword(true);
    try {
      await changePasswordApi({
        old_password: oldPassword,
        new_password: newPassword,
      });
      setPwSuccess('Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPwSuccess(''), 4000);
    } catch (err) {
      console.error('Error changing password:', err);
      setPwError(err.response?.data?.detail || 'Current password incorrect.');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-aura-page)] text-[var(--color-aura-text)]">
      {/* Top Header */}
      <header className="bg-[var(--color-aura-surface)] border-b border-[var(--color-aura-border)] px-6 py-4 shadow-xs sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              to="/"
              className="p-2 rounded-xl text-[var(--color-aura-muted)] hover:text-[var(--color-aura-text)] hover:bg-gray-100 transition-colors"
              title="Return to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold font-[var(--font-heading)]">Profile & Preferences</h1>
              <p className="text-xs text-[var(--color-aura-muted)]">Manage your personal style profile and security</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Account Info Card */}
        <section className="bg-[var(--color-aura-surface)] p-6 rounded-2xl border border-[var(--color-aura-border)] shadow-xs">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-[var(--color-aura-lavender)] text-[var(--color-aura-primary)] flex items-center justify-center font-bold text-xl">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-lg font-bold font-[var(--font-heading)]">{user?.name}</h2>
              <p className="text-xs text-[var(--color-aura-muted)]">{user?.email}</p>
              <div className="mt-1 flex items-center space-x-2">
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-[var(--color-aura-lavender)] text-[var(--color-aura-primary)]">
                  {user?.role}
                </span>
                <span className="text-xs text-[var(--color-aura-muted)]">User ID #{user?.id}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Style Preferences Section */}
        <section className="bg-[var(--color-aura-surface)] p-6 sm:p-8 rounded-2xl border border-[var(--color-aura-border)] shadow-xs">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-[var(--color-aura-border)]">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-[var(--color-aura-lavender)] text-[var(--color-aura-primary)]">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-[var(--font-heading)]">Stylist & Wardrobe Preferences</h3>
                <p className="text-xs text-[var(--color-aura-muted)]">These preferences guide the Gemini outfit recommendation logic</p>
              </div>
            </div>
          </div>

          {prefSuccess && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200 flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{prefSuccess}</span>
            </div>
          )}

          {prefError && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-700 text-xs font-medium border border-red-200 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{prefError}</span>
            </div>
          )}

          {loadingPrefs ? (
            <div className="py-8 text-center text-sm text-[var(--color-aura-muted)]">Loading preferences...</div>
          ) : (
            <form onSubmit={handleSavePreferences} className="space-y-6">
              {/* Home City */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-aura-muted)] mb-2 flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[var(--color-aura-primary)]" />
                  <span>Home City</span>
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Mumbai, Pune, Delhi"
                  className="block w-full max-w-md px-4 py-2.5 rounded-xl border border-[var(--color-aura-border)] bg-[var(--color-aura-page)] focus:bg-[var(--color-aura-surface)] focus:border-[var(--color-aura-primary)] text-sm outline-none transition-all"
                />
                <p className="text-[11px] text-[var(--color-aura-muted)] mt-1">
                  Used by the Open-Meteo weather service to adapt outfit recommendations to local conditions.
                </p>
              </div>

              {/* Preferred Styles */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-aura-muted)] mb-2 flex items-center space-x-1.5">
                  <Compass className="w-3.5 h-3.5 text-[var(--color-aura-primary)]" />
                  <span>Preferred Styles</span>
                </label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {STYLES.map((style) => {
                    const isSelected = styles.includes(style);
                    return (
                      <button
                        key={style}
                        type="button"
                        onClick={() => toggleStyle(style)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-medium capitalize border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[var(--color-aura-lavender)] text-[var(--color-aura-primary)] border-[var(--color-aura-primary)] font-semibold shadow-2xs'
                            : 'border-[var(--color-aura-border)] text-[var(--color-aura-muted)] hover:bg-gray-50'
                        }`}
                      >
                        {style} {isSelected && '✓'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Favorite Colors */}
              <div>
                <ColorSwatchPicker
                  label="Favorite Colors"
                  description="Colors that you feel confident wearing"
                  selectedColors={favoriteColors}
                  onChange={setFavoriteColors}
                />
              </div>

              {/* Avoid Colors */}
              <div>
                <ColorSwatchPicker
                  label="Colors to Avoid"
                  description="Colors you wish to omit from AI recommendations"
                  selectedColors={avoidColors}
                  onChange={setAvoidColors}
                />
              </div>

              {/* Save Preferences Button */}
              <div className="pt-4 border-t border-[var(--color-aura-border)] flex justify-end">
                <button
                  type="submit"
                  disabled={savingPrefs}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[var(--color-aura-primary)] hover:bg-[var(--color-aura-accent)] transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingPrefs ? 'Saving Changes...' : 'Save Preferences'}</span>
                </button>
              </div>
            </form>
          )}
        </section>

        {/* Security & Password Section */}
        <section className="bg-[var(--color-aura-surface)] p-6 sm:p-8 rounded-2xl border border-[var(--color-aura-border)] shadow-xs">
          <div className="flex items-center space-x-3 pb-4 mb-6 border-b border-[var(--color-aura-border)]">
            <div className="p-2.5 rounded-xl bg-[var(--color-aura-lavender)] text-[var(--color-aura-primary)]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-[var(--font-heading)]">Change Password</h3>
              <p className="text-xs text-[var(--color-aura-muted)]">Ensure your account uses a strong password (minimum 8 characters)</p>
            </div>
          </div>

          {pwSuccess && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200 flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{pwSuccess}</span>
            </div>
          )}

          {pwError && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-700 text-xs font-medium border border-red-200 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{pwError}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-aura-muted)] mb-1.5">
                Current Password
              </label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
                className="block w-full px-4 py-2.5 rounded-xl border border-[var(--color-aura-border)] bg-[var(--color-aura-page)] focus:bg-[var(--color-aura-surface)] focus:border-[var(--color-aura-primary)] text-sm outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-aura-muted)] mb-1.5">
                New Password (min 8 characters)
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                className="block w-full px-4 py-2.5 rounded-xl border border-[var(--color-aura-border)] bg-[var(--color-aura-page)] focus:bg-[var(--color-aura-surface)] focus:border-[var(--color-aura-primary)] text-sm outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-aura-muted)] mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="block w-full px-4 py-2.5 rounded-xl border border-[var(--color-aura-border)] bg-[var(--color-aura-page)] focus:bg-[var(--color-aura-surface)] focus:border-[var(--color-aura-primary)] text-sm outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={savingPassword}
              className="mt-2 inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[var(--color-aura-primary)] hover:bg-[var(--color-aura-accent)] transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <span>{savingPassword ? 'Updating...' : 'Update Password'}</span>
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
