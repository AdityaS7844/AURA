import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  User,
  Lock,
  MapPin,
  Palette,
  Compass,
  Check,
  AlertCircle,
  Save,
  Trash2,
  AlertTriangle,
  X,
} from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { useAuth } from '../context/AuthContext';
import { getPreferencesApi, updatePreferencesApi } from '../api/preferences';
import { changePasswordApi, deleteAccountApi, updateUserApi } from '../api/auth';
import ColorSwatchPicker from '../components/common/ColorSwatchPicker';
import { STYLES } from '../utils/constants';

export default function ProfilePage() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();

  // Name State
  const [displayName, setDisplayName] = useState(user?.name || '');
  const [savingName, setSavingName] = useState(false);
  const [nameSuccess, setNameSuccess] = useState('');
  const [nameError, setNameError] = useState('');

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

  // Account Deletion State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState('');

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

  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!displayName.trim()) return;

    try {
      setSavingName(true);
      setNameSuccess('');
      setNameError('');
      const updatedUser = await updateUserApi({ name: displayName.trim() });
      const currentToken = localStorage.getItem('aura_token');
      login(updatedUser, currentToken);
      setNameSuccess('Profile name updated successfully!');
      setTimeout(() => setNameSuccess(''), 4000);
    } catch (err) {
      console.error('Error updating name:', err);
      setNameError(err.response?.data?.detail || 'Failed to update name.');
    } finally {
      setSavingName(false);
    }
  };

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

  const handleDeleteAccount = async () => {
    try {
      setDeletingAccount(true);
      setDeleteError('');
      await deleteAccountApi();
      logout();
      navigate('/login');
    } catch (err) {
      console.error('Error deleting account:', err);
      setDeleteError(err.response?.data?.detail || 'Failed to delete account.');
      setDeletingAccount(false);
    }
  };

  return (
    <AppLayout>
      <div className="p-6 sm:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
        {/* Header */}
        <div className="pb-6 border-b border-[var(--color-aura-border)]">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-[var(--color-aura-primary)] text-white flex items-center justify-center shadow-xs">
              <User className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-[var(--font-heading)]">
              Profile & Account Settings
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[var(--color-aura-muted)] mt-1.5">
            Manage your personal profile, styling preferences, and account security.
          </p>
        </div>

        {/* Account Info & Display Name Card */}
        <section className="bg-[var(--color-aura-surface)] p-6 sm:p-7 rounded-3xl border border-[var(--color-aura-border)] shadow-xs space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-aura-lavender)] text-[var(--color-aura-primary)] flex items-center justify-center font-bold text-2xl shadow-xs">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-lg font-bold font-[var(--font-heading)]">{user?.name}</h2>
              <p className="text-xs text-[var(--color-aura-muted)]">{user?.email}</p>
              <div className="mt-1 flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[var(--color-aura-lavender)] text-[var(--color-aura-primary)]">
                  {user?.role}
                </span>
                <span className="text-xs text-[var(--color-aura-muted)]">User #{user?.id}</span>
              </div>
            </div>
          </div>

          {nameSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200 flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{nameSuccess}</span>
            </div>
          )}

          {nameError && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium border border-red-200 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{nameError}</span>
            </div>
          )}

          <form onSubmit={handleUpdateName} className="space-y-3 pt-2 border-t border-[var(--color-aura-border)]">
            <div className="max-w-md">
              <label htmlFor="display-name" className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-aura-muted)] mb-1.5">
                Display Name
              </label>
              <div className="flex gap-2">
                <input
                  id="display-name"
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--color-aura-border)] bg-[var(--color-aura-page)] focus:bg-white focus:border-[var(--color-aura-primary)] text-xs outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-aura-primary)]/20"
                />
                <button
                  type="submit"
                  disabled={savingName || displayName === user?.name}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[var(--color-aura-primary)] hover:bg-[var(--color-aura-accent)] transition-all shadow-xs cursor-pointer disabled:opacity-40 shrink-0"
                >
                  {savingName ? 'Saving...' : 'Update Name'}
                </button>
              </div>
            </div>
          </form>
        </section>

        {/* Style Preferences Section */}
        <section className="bg-[var(--color-aura-surface)] p-6 sm:p-7 rounded-3xl border border-[var(--color-aura-border)] shadow-xs">
          <div className="flex items-center space-x-3 pb-4 mb-6 border-b border-[var(--color-aura-border)]">
            <div className="p-2.5 rounded-xl bg-[var(--color-aura-lavender)] text-[var(--color-aura-primary)]">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-[var(--font-heading)]">AI Stylist & Wardrobe Preferences</h3>
              <p className="text-xs text-[var(--color-aura-muted)]">These preferences guide the Gemini outfit recommendation logic</p>
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
                <label htmlFor="pref-city" className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-aura-muted)] mb-1.5 flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[var(--color-aura-primary)]" />
                  <span>Home City</span>
                </label>
                <input
                  id="pref-city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Mumbai, Pune, Delhi"
                  className="block w-full max-w-md px-4 py-2.5 rounded-xl border border-[var(--color-aura-border)] bg-[var(--color-aura-page)] focus:bg-white focus:border-[var(--color-aura-primary)] text-xs outline-none transition-all focus-visible:ring-2 focus-visible:ring-[var(--color-aura-primary)]/20"
                />
                <p className="text-[11px] text-[var(--color-aura-muted)] mt-1">
                  Used by Open-Meteo to automatically fetch local weather for smart outfit recommendations.
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
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[var(--color-aura-primary)] hover:bg-[var(--color-aura-accent)] transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingPrefs ? 'Saving Changes...' : 'Save Preferences'}</span>
                </button>
              </div>
            </form>
          )}
        </section>

        {/* Security & Password Section */}
        <section className="bg-[var(--color-aura-surface)] p-6 sm:p-7 rounded-3xl border border-[var(--color-aura-border)] shadow-xs">
          <div className="flex items-center space-x-3 pb-4 mb-6 border-b border-[var(--color-aura-border)]">
            <div className="p-2.5 rounded-xl bg-[var(--color-aura-lavender)] text-[var(--color-aura-primary)]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-[var(--font-heading)]">Change Password</h3>
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
              <label htmlFor="old-pw" className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-aura-muted)] mb-1.5">
                Current Password
              </label>
              <input
                id="old-pw"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
                className="block w-full px-4 py-2.5 rounded-xl border border-[var(--color-aura-border)] bg-[var(--color-aura-page)] focus:bg-white focus:border-[var(--color-aura-primary)] text-xs outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-aura-primary)]/20"
              />
            </div>

            <div>
              <label htmlFor="new-pw" className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-aura-muted)] mb-1.5">
                New Password (min 8 characters)
              </label>
              <input
                id="new-pw"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                className="block w-full px-4 py-2.5 rounded-xl border border-[var(--color-aura-border)] bg-[var(--color-aura-page)] focus:bg-white focus:border-[var(--color-aura-primary)] text-xs outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-aura-primary)]/20"
              />
            </div>

            <div>
              <label htmlFor="confirm-pw" className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-aura-muted)] mb-1.5">
                Confirm New Password
              </label>
              <input
                id="confirm-pw"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="block w-full px-4 py-2.5 rounded-xl border border-[var(--color-aura-border)] bg-[var(--color-aura-page)] focus:bg-white focus:border-[var(--color-aura-primary)] text-xs outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-aura-primary)]/20"
              />
            </div>

            <button
              type="submit"
              disabled={savingPassword}
              className="mt-2 inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[var(--color-aura-primary)] hover:bg-[var(--color-aura-accent)] transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <span>{savingPassword ? 'Updating...' : 'Update Password'}</span>
            </button>
          </form>
        </section>

        {/* Danger Zone: Delete Account */}
        <section className="bg-red-50/40 p-6 sm:p-7 rounded-3xl border border-red-200 space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-red-200/60">
            <div className="p-2.5 rounded-xl bg-red-100 text-red-600">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-red-950 font-[var(--font-heading)]">Danger Zone</h3>
              <p className="text-xs text-red-800">Permanently delete your account and all associated wardrobe data</p>
            </div>
          </div>

          <p className="text-xs text-red-900/80 leading-relaxed">
            Deleting your account will remove all your wardrobe items, preferences, saved outfits, wear tracking, and calendar schedules. This action cannot be undone.
          </p>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-xs cursor-pointer"
          >
            Delete Account
          </button>
        </section>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[var(--color-aura-surface)] rounded-3xl border border-[var(--color-aura-border)] shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center space-x-3 text-red-600">
                <AlertTriangle className="w-6 h-6 shrink-0" />
                <h3 className="text-base font-bold font-[var(--font-heading)]">Delete Account Confirmation</h3>
              </div>

              <p className="text-xs text-[var(--color-aura-muted)] leading-relaxed">
                Are you absolutely sure you want to delete your account? All wardrobe items, outfit history, and settings will be permanently erased from SQLite.
              </p>

              {deleteError && (
                <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
                  {deleteError}
                </div>
              )}

              <div className="pt-3 border-t border-[var(--color-aura-border)] flex items-center justify-end space-x-2">
                <button
                  type="button"
                  disabled={deletingAccount}
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--color-aura-muted)] hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deletingAccount}
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {deletingAccount ? 'Deleting...' : 'Yes, Permanently Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
