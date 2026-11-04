import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Shirt, Plus, MapPin, Palette, Compass, ArrowRight, CheckCircle2 } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { useAuth } from '../context/AuthContext';
import { getPreferencesApi } from '../api/preferences';
import { listItemsApi } from '../api/wardrobe';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState(null);
  const [wardrobeCount, setWardrobeCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const prefData = await getPreferencesApi();
        setPreferences(prefData);
        if (!prefData.onboarding_done) {
          navigate('/onboarding', { replace: true });
          return;
        }

        const wardrobeData = await listItemsApi({ limit: 1 });
        setWardrobeCount(wardrobeData.total || 0);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      }
    };
    fetchData();
  }, [navigate]);

  return (
    <AppLayout>
      <div className="p-6 sm:p-8 max-w-6xl mx-auto space-y-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-[var(--color-aura-primary)] to-[var(--color-aura-accent)] rounded-3xl p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold tracking-wide uppercase">
              AURA Wardrobe System
            </span>
            <h1 className="text-3xl md:text-4xl font-bold font-[var(--font-heading)] mt-3 mb-2">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-white/80 text-sm md:text-base">
              Your digital wardrobe contains <strong>{wardrobeCount} clothing items</strong> ready for smart outfit combinations.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <Link
              to="/wardrobe"
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-[var(--color-aura-primary)] bg-white hover:bg-gray-50 transition-all shadow-xs"
            >
              View Wardrobe
            </Link>
            <Link
              to="/wardrobe/add"
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-white/20 hover:bg-white/30 border border-white/30 transition-all"
            >
              + Add Clothes
            </Link>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[var(--color-aura-surface)] border border-[var(--color-aura-border)] shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[var(--color-aura-muted)] uppercase tracking-wider">Total Clothes</span>
              <div className="text-2xl font-bold text-[var(--color-aura-text)] mt-1">{wardrobeCount}</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Shirt className="w-6 h-6" />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[var(--color-aura-surface)] border border-[var(--color-aura-border)] shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[var(--color-aura-muted)] uppercase tracking-wider">Home City</span>
              <div className="text-2xl font-bold text-[var(--color-aura-text)] mt-1">{preferences?.city || 'Not set'}</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[var(--color-aura-primary)] flex items-center justify-center">
              <MapPin className="w-6 h-6" />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[var(--color-aura-surface)] border border-[var(--color-aura-border)] shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[var(--color-aura-muted)] uppercase tracking-wider">Style Aesthetic</span>
              <div className="text-sm font-bold text-[var(--color-aura-text)] capitalize mt-1.5 truncate max-w-[140px]">
                {preferences?.styles?.join(', ') || 'General'}
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Compass className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Styling Profile Preview Card */}
        <div className="bg-[var(--color-aura-surface)] p-6 sm:p-8 rounded-2xl border border-[var(--color-aura-border)] shadow-xs">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-[var(--color-aura-border)]">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-[var(--color-aura-lavender)] text-[var(--color-aura-primary)]">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold font-[var(--font-heading)]">Your Styling Profile</h2>
                <p className="text-xs text-[var(--color-aura-muted)]">Active preferences stored in SQLite</p>
              </div>
            </div>

            <Link
              to="/profile"
              className="text-xs font-semibold text-[var(--color-aura-primary)] hover:underline flex items-center space-x-1"
            >
              <span>Edit Profile</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-aura-muted)] block mb-2">
                Preferred Styles
              </span>
              <div className="flex flex-wrap gap-2">
                {preferences?.styles?.map((s) => (
                  <span
                    key={s}
                    className="text-xs px-3 py-1 rounded-xl bg-[var(--color-aura-lavender)] text-[var(--color-aura-primary)] font-semibold capitalize"
                  >
                    {s}
                  </span>
                )) || <span className="text-xs text-[var(--color-aura-muted)]">None</span>}
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-aura-muted)] block mb-2">
                Favorite Color Palette
              </span>
              <div className="flex flex-wrap gap-2">
                {preferences?.favorite_colors?.map((c) => (
                  <span
                    key={c}
                    className="w-6 h-6 rounded-md border border-black/15 shadow-2xs inline-block"
                    style={{ backgroundColor: c }}
                    title={c}
                  />
                )) || <span className="text-xs text-[var(--color-aura-muted)]">None</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
