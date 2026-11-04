import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, LogOut, User, ShieldCheck, MapPin, Palette, Compass, ArrowRight, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getPreferencesApi } from '../api/preferences';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState(null);
  const [loadingPrefs, setLoadingPrefs] = useState(true);

  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const data = await getPreferencesApi();
        setPreferences(data);
        // If onboarding is not completed, navigate to onboarding wizard
        if (!data.onboarding_done) {
          navigate('/onboarding', { replace: true });
        }
      } catch (err) {
        console.error('Failed to load preferences:', err);
      } finally {
        setLoadingPrefs(false);
      }
    };
    fetchPrefs();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[var(--color-aura-page)] text-[var(--color-aura-text)] flex flex-col justify-between">
      {/* Top Navigation Bar */}
      <header className="bg-[var(--color-aura-surface)] border-b border-[var(--color-aura-border)] px-8 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-aura-primary)] flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-2xl font-bold tracking-tight text-[var(--color-aura-primary)] font-[var(--font-heading)]">AURA</span>
              <span className="text-xs ml-2 px-2.5 py-0.5 rounded-full bg-[var(--color-aura-lavender)] text-[var(--color-aura-primary)] font-medium">Dashboard</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/profile"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[var(--color-aura-text)] bg-[var(--color-aura-page)] border border-[var(--color-aura-border)] hover:bg-[var(--color-aura-lavender)]/30 transition-colors"
            >
              <Settings className="w-3.5 h-3.5 text-[var(--color-aura-primary)]" />
              <span>Profile & Preferences</span>
            </Link>

            <div className="flex items-center space-x-2 text-xs text-[var(--color-aura-muted)] bg-[var(--color-aura-page)] px-3 py-1.5 rounded-xl border border-[var(--color-aura-border)]">
              <User className="w-3.5 h-3.5 text-[var(--color-aura-primary)]" />
              <span className="font-medium text-[var(--color-aura-text)]">{user?.name}</span>
            </div>

            <button
              onClick={logout}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-6 py-10 flex-1 w-full space-y-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-[var(--color-aura-primary)] to-[var(--color-aura-accent)] rounded-3xl p-8 text-white shadow-lg">
          <div className="max-w-2xl">
            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold tracking-wide uppercase">
              Milestone 2 Complete
            </span>
            <h1 className="text-3xl md:text-4xl font-bold font-[var(--font-heading)] mt-4 mb-2">
              Welcome, {user?.name}!
            </h1>
            <p className="text-white/80 text-sm md:text-base">
              Your profile preferences and styling criteria have been successfully configured and stored in SQLite.
            </p>
          </div>
        </div>

        {/* User Preferences Summary Card */}
        <div className="bg-[var(--color-aura-surface)] p-6 sm:p-8 rounded-2xl border border-[var(--color-aura-border)] shadow-xs">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-[var(--color-aura-border)]">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-[var(--color-aura-lavender)] text-[var(--color-aura-primary)]">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold font-[var(--font-heading)]">Your Styling Profile</h2>
                <p className="text-xs text-[var(--color-aura-muted)]">Configured preferences for Gemini outfit reasoning</p>
              </div>
            </div>

            <Link
              to="/profile"
              className="text-xs font-semibold text-[var(--color-aura-primary)] hover:underline flex items-center space-x-1"
            >
              <span>Edit Preferences</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Home City */}
            <div className="p-4 rounded-xl bg-[var(--color-aura-page)] border border-[var(--color-aura-border)]">
              <div className="flex items-center space-x-2 text-[var(--color-aura-primary)] mb-1">
                <MapPin className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Home City</span>
              </div>
              <div className="text-base font-bold text-[var(--color-aura-text)]">
                {preferences?.city || 'Not specified'}
              </div>
              <p className="text-[11px] text-[var(--color-aura-muted)] mt-1">
                Used for live weather forecasts via Open-Meteo
              </p>
            </div>

            {/* Preferred Styles */}
            <div className="p-4 rounded-xl bg-[var(--color-aura-page)] border border-[var(--color-aura-border)]">
              <div className="flex items-center space-x-2 text-[var(--color-aura-primary)] mb-2">
                <Compass className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Styles</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {preferences?.styles && preferences.styles.length > 0 ? (
                  preferences.styles.map((style) => (
                    <span
                      key={style}
                      className="text-xs px-2.5 py-0.5 rounded-lg bg-[var(--color-aura-lavender)] text-[var(--color-aura-primary)] font-medium capitalize"
                    >
                      {style}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-[var(--color-aura-muted)]">No styles selected</span>
                )}
              </div>
            </div>

            {/* Favorite Colors */}
            <div className="p-4 rounded-xl bg-[var(--color-aura-page)] border border-[var(--color-aura-border)]">
              <div className="flex items-center space-x-2 text-[var(--color-aura-primary)] mb-2">
                <Palette className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Favorite Colors</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {preferences?.favorite_colors && preferences.favorite_colors.length > 0 ? (
                  preferences.favorite_colors.map((hex) => (
                    <span
                      key={hex}
                      className="w-6 h-6 rounded-md border border-black/10 inline-block shadow-2xs"
                      style={{ backgroundColor: hex }}
                      title={hex}
                    />
                  ))
                ) : (
                  <span className="text-xs text-[var(--color-aura-muted)]">None selected</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Next Milestone Card */}
        <div className="bg-[var(--color-aura-surface)] p-6 rounded-2xl border border-[var(--color-aura-border)] shadow-xs flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-2xl bg-[var(--color-aura-lavender)] text-[var(--color-aura-primary)]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base font-[var(--font-heading)]">Ready for Milestone 3: Wardrobe Backend & Image Uploads</h3>
              <p className="text-xs text-[var(--color-aura-muted)]">
                Next up: <code className="text-xs font-mono">clothing_items</code> table, image validation/resizing, CRUD endpoints, and test seed data.
              </p>
            </div>
          </div>

          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-[var(--color-aura-lavender)] text-[var(--color-aura-primary)]">
            M2 Verified
          </span>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--color-aura-border)] py-6 text-center text-xs text-[var(--color-aura-muted)] bg-[var(--color-aura-surface)]">
        AURA Wardrobe System • React 19 + FastAPI + SQLite
      </footer>
    </div>
  );
}
