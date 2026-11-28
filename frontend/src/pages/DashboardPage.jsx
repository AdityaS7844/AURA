import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Shirt,
  Plus,
  Palette,
  Compass,
  ArrowRight,
  Wand2,
  Bookmark,
  BarChart3,
  Calendar,
  TrendingUp,
  Flame,
  Clock,
  Layers,
} from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import WeatherCard from '../components/weather/WeatherCard';
import WardrobeImage from '../components/common/WardrobeImage';
import OutfitCard from '../components/outfit/OutfitCard';
import { useAuth } from '../context/AuthContext';
import { getPreferencesApi } from '../api/preferences';
import { listItemsApi } from '../api/wardrobe';
import { getInsightsSummaryApi } from '../api/insights';
import { getSavedOutfitsApi } from '../api/outfits';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [preferences, setPreferences] = useState(null);
  const [insights, setInsights] = useState(null);
  const [recentItems, setRecentItems] = useState([]);
  const [latestOutfit, setLatestOutfit] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // 1. Fetch Preferences
        const prefData = await getPreferencesApi();
        setPreferences(prefData);
        if (!prefData.onboarding_done) {
          navigate('/onboarding', { replace: true });
          return;
        }

        // 2. Fetch Insights Summary
        const insightsData = await getInsightsSummaryApi().catch(() => null);
        setInsights(insightsData);

        // 3. Fetch Recent Wardrobe Additions (latest 4)
        const recentRes = await listItemsApi({ limit: 4, sort_by: 'created_at', sort_order: 'desc' }).catch(() => null);
        setRecentItems(recentRes?.items || []);

        // 4. Fetch Latest Styled Outfit (Look of the Day)
        const historyRes = await getSavedOutfitsApi({ type: 'history', page: 1, limit: 1 }).catch(() => null);
        if (historyRes?.outfits && historyRes.outfits.length > 0) {
          setLatestOutfit(historyRes.outfits[0]);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const totalItems = insights?.total_items || 0;
  const savedCount = insights?.saved_outfits || 0;
  const totalStyled = insights?.total_outfits_styled || 0;
  const mostWorn = insights?.most_worn || [];
  const neverWorn = insights?.never_worn || [];
  const byCategory = insights?.by_category || {};

  // Calculate utilization %
  const wornCount = totalItems > 0 ? totalItems - neverWorn.length : 0;
  const utilization = totalItems > 0 ? Math.round((wornCount / totalItems) * 100) : 0;

  return (
    <AppLayout>
      <div className="p-6 sm:p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-200">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-[var(--color-aura-primary)] via-indigo-900 to-[var(--color-aura-accent)] rounded-3xl p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-bold font-[var(--font-heading)] mb-2">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-white/85 text-sm md:text-base leading-relaxed">
              Your digital wardrobe contains <strong>{totalItems} items</strong>. You've styled{' '}
              <strong>{totalStyled} outfits</strong> with <strong>{savedCount} saved</strong> to your personal collection.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/stylist"
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-[var(--color-aura-primary)] bg-white hover:bg-gray-50 transition-all shadow-md flex items-center space-x-1.5 cursor-pointer"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>AI Stylist</span>
            </Link>
            <Link
              to="/planner"
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-white/20 hover:bg-white/30 border border-white/30 transition-all flex items-center space-x-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Planner</span>
            </Link>
            <Link
              to="/insights"
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-white/20 hover:bg-white/30 border border-white/30 transition-all flex items-center space-x-1.5"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Insights</span>
            </Link>
            <Link
              to="/wardrobe/add"
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-white/20 hover:bg-white/30 border border-white/30 transition-all flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Item</span>
            </Link>
          </div>
        </div>

        {/* Live Weather & KPI Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Weather Card (1 column) */}
          <div className="md:col-span-1">
            <WeatherCard city={preferences?.city || 'Mumbai'} />
          </div>

          {/* Quick Metrics (2 columns with 4 cards) */}
          <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-2 gap-4">
            {/* Total Clothes */}
            <Link
              to="/wardrobe"
              className="p-5 rounded-2xl bg-[var(--color-aura-surface)] border border-[var(--color-aura-border)] shadow-xs hover:border-[var(--color-aura-accent)] transition-all flex items-center justify-between group cursor-pointer"
            >
              <div>
                <span className="text-[11px] font-semibold text-[var(--color-aura-muted)] uppercase tracking-wider">
                  Total Items
                </span>
                <div className="text-2xl font-bold text-[var(--color-aura-text)] mt-1">{totalItems}</div>
                <p className="text-[11px] text-[var(--color-aura-primary)] group-hover:underline mt-1 font-medium">
                  Browse wardrobe →
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Shirt className="w-6 h-6" />
              </div>
            </Link>

            {/* Wardrobe Utilization */}
            <Link
              to="/insights"
              className="p-5 rounded-2xl bg-[var(--color-aura-surface)] border border-[var(--color-aura-border)] shadow-xs hover:border-[var(--color-aura-accent)] transition-all flex items-center justify-between group cursor-pointer"
            >
              <div>
                <span className="text-[11px] font-semibold text-[var(--color-aura-muted)] uppercase tracking-wider">
                  Utilization
                </span>
                <div className="text-2xl font-bold text-[var(--color-aura-text)] mt-1">{utilization}%</div>
                <p className="text-[11px] text-[var(--color-aura-muted)] mt-1">
                  {wornCount} worn / {neverWorn.length} never
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <TrendingUp className="w-6 h-6" />
              </div>
            </Link>

            {/* Saved Outfits */}
            <Link
              to="/saved"
              className="p-5 rounded-2xl bg-[var(--color-aura-surface)] border border-[var(--color-aura-border)] shadow-xs hover:border-[var(--color-aura-accent)] transition-all flex items-center justify-between group cursor-pointer"
            >
              <div>
                <span className="text-[11px] font-semibold text-[var(--color-aura-muted)] uppercase tracking-wider">
                  Saved Outfits
                </span>
                <div className="text-2xl font-bold text-[var(--color-aura-text)] mt-1">{savedCount}</div>
                <p className="text-[11px] text-[var(--color-aura-primary)] group-hover:underline mt-1 font-medium">
                  View saved →
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Bookmark className="w-6 h-6" />
              </div>
            </Link>

            {/* Total Styled */}
            <Link
              to="/saved?tab=history"
              className="p-5 rounded-2xl bg-[var(--color-aura-surface)] border border-[var(--color-aura-border)] shadow-xs hover:border-[var(--color-aura-accent)] transition-all flex items-center justify-between group cursor-pointer"
            >
              <div>
                <span className="text-[11px] font-semibold text-[var(--color-aura-muted)] uppercase tracking-wider">
                  Outfits Styled
                </span>
                <div className="text-2xl font-bold text-[var(--color-aura-text)] mt-1">{totalStyled}</div>
                <p className="text-[11px] text-[var(--color-aura-muted)] mt-1">By Google Gemini AI</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
            </Link>
          </div>
        </div>

        {/* 2-Column Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column (2 cols): Latest AI Recommendation & Recent Clothes */}
          <div className="lg:col-span-2 space-y-8">
            {/* AI Look Showcase */}
            <div className="bg-[var(--color-aura-surface)] rounded-3xl border border-[var(--color-aura-border)] p-6 sm:p-7 shadow-xs">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-[var(--color-aura-border)]">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-[var(--color-aura-lavender)] text-[var(--color-aura-primary)]">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold font-[var(--font-heading)]">AI Look of the Day</h2>
                    <p className="text-xs text-[var(--color-aura-muted)]">
                      {latestOutfit ? 'Your most recent Gemini recommendation' : 'Ready to style your outfit'}
                    </p>
                  </div>
                </div>

                {latestOutfit ? (
                  <Link
                    to="/saved?tab=history"
                    className="text-xs font-semibold text-[var(--color-aura-primary)] hover:underline flex items-center space-x-1"
                  >
                    <span>View All History</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <Link
                    to="/stylist"
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-[var(--color-aura-primary)] hover:bg-[var(--color-aura-accent)] transition-all shadow-xs flex items-center space-x-1"
                  >
                    <Wand2 className="w-3 h-3" />
                    <span>Generate</span>
                  </Link>
                )}
              </div>

              {latestOutfit ? (
                <div className="max-w-md mx-auto">
                  <OutfitCard
                    outfit={latestOutfit}
                    onUpdate={(updated) => setLatestOutfit(updated)}
                  />
                </div>
              ) : (
                <div className="p-8 text-center rounded-2xl bg-gray-50 border border-dashed border-[var(--color-aura-border)] space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--color-aura-lavender)] text-[var(--color-aura-primary)] flex items-center justify-center mx-auto">
                    <Wand2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-[var(--color-aura-text)]">No outfits generated yet</h3>
                  <p className="text-xs text-[var(--color-aura-muted)] max-w-sm mx-auto">
                    Let Gemini style your first outfit based on today's weather in {preferences?.city || 'your city'}.
                  </p>
                  <Link
                    to="/stylist"
                    className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[var(--color-aura-primary)] hover:bg-[var(--color-aura-accent)] transition-all shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Launch AI Stylist Now</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Recent Wardrobe Additions */}
            <div className="bg-[var(--color-aura-surface)] rounded-3xl border border-[var(--color-aura-border)] p-6 sm:p-7 shadow-xs">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-[var(--color-aura-border)]">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                    <Shirt className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold font-[var(--font-heading)]">Recently Added Clothes</h2>
                    <p className="text-xs text-[var(--color-aura-muted)]">Latest items in your digital closet</p>
                  </div>
                </div>

                <Link
                  to="/wardrobe"
                  className="text-xs font-semibold text-[var(--color-aura-primary)] hover:underline flex items-center space-x-1"
                >
                  <span>All Items ({totalItems})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {recentItems.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {recentItems.map((item) => (
                    <Link
                      key={item.id}
                      to={`/wardrobe/${item.id}`}
                      className="group rounded-2xl border border-[var(--color-aura-border)] bg-[var(--color-aura-page)] p-3 hover:border-[var(--color-aura-primary)] hover:shadow-xs transition-all flex flex-col justify-between"
                    >
                      <div className="aspect-square w-full rounded-xl bg-white border border-[var(--color-aura-border)] overflow-hidden mb-2.5 flex items-center justify-center">
                        <WardrobeImage
                          src={item.image_url}
                          alt={item.name}
                          category={item.category}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          fallbackClassName="flex items-center justify-center text-[var(--color-aura-muted)] p-2 w-full h-full"
                          iconSize="w-6 h-6"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-[10px] text-[var(--color-aura-muted)] mb-1">
                          <span className="capitalize font-semibold text-[var(--color-aura-primary)]">
                            {item.category}
                          </span>
                          <span>Worn {item.times_worn || 0}x</span>
                        </div>
                        <h4 className="text-xs font-bold text-[var(--color-aura-text)] truncate">{item.name}</h4>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center rounded-2xl bg-gray-50 border border-dashed border-[var(--color-aura-border)]">
                  <p className="text-xs text-[var(--color-aura-muted)] mb-3">No clothing items added yet.</p>
                  <Link
                    to="/wardrobe/add"
                    className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-[var(--color-aura-primary)]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add First Item</span>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Side Column (1 col): Wardrobe Breakdown & Forgotten Gems */}
          <div className="space-y-8">
            {/* Category Breakdown Card */}
            <div className="bg-[var(--color-aura-surface)] rounded-3xl border border-[var(--color-aura-border)] p-6 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--color-aura-border)]">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                    <Layers className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold font-[var(--font-heading)]">Category Breakdown</h3>
                </div>
                <Link
                  to="/insights"
                  className="text-[11px] font-semibold text-[var(--color-aura-primary)] hover:underline"
                >
                  Insights →
                </Link>
              </div>

              <div className="space-y-3">
                {Object.entries(byCategory).map(([category, count]) => {
                  const pct = totalItems > 0 ? Math.round((count / totalItems) * 100) : 0;
                  return (
                    <div key={category} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold capitalize text-[var(--color-aura-text)]">{category}</span>
                        <span className="text-[var(--color-aura-muted)]">
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[var(--color-aura-primary)] rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Styling Profile Card */}
            <div className="bg-[var(--color-aura-surface)] rounded-3xl border border-[var(--color-aura-border)] p-6 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--color-aura-border)]">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                    <Palette className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold font-[var(--font-heading)]">Styling Profile</h3>
                </div>
                <Link
                  to="/profile"
                  className="text-[11px] font-semibold text-[var(--color-aura-primary)] hover:underline"
                >
                  Edit →
                </Link>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-aura-muted)] block mb-1.5">
                    Aesthetic
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {preferences?.styles?.map((s) => (
                      <span
                        key={s}
                        className="text-[11px] px-2.5 py-0.5 rounded-lg bg-[var(--color-aura-lavender)] text-[var(--color-aura-primary)] font-medium capitalize"
                      >
                        {s}
                      </span>
                    )) || <span className="text-xs text-[var(--color-aura-muted)]">None set</span>}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-aura-muted)] block mb-1.5">
                    Palette
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {preferences?.favorite_colors?.map((c) => (
                      <span
                        key={c}
                        className="w-5 h-5 rounded-md border border-black/15 shadow-2xs inline-block"
                        style={{ backgroundColor: c }}
                        title={c}
                      />
                    )) || <span className="text-xs text-[var(--color-aura-muted)]">None set</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Forgotten Gems Mini Spotlight */}
            {neverWorn.length > 0 && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50/40 rounded-3xl border border-amber-200/70 p-6 shadow-xs">
                <div className="flex items-center space-x-2.5 mb-2">
                  <div className="p-2 rounded-xl bg-amber-500 text-white shadow-2xs">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-amber-950 font-[var(--font-heading)]">Forgotten Gems</h3>
                    <p className="text-[10px] text-amber-800">{neverWorn.length} items never worn yet</p>
                  </div>
                </div>
                <p className="text-xs text-amber-900/80 mb-3.5 leading-relaxed">
                  Put unloved wardrobe pieces to use. Style an outfit anchored around one today!
                </p>
                <div className="space-y-2">
                  {neverWorn.slice(0, 2).map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-xl bg-white/80 border border-amber-200/50 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center space-x-2.5 overflow-hidden">
                        <div className="w-9 h-9 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 shrink-0">
                          <WardrobeImage
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            fallbackClassName="flex items-center justify-center text-gray-400 w-full h-full"
                            iconSize="w-4 h-4"
                          />
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-semibold text-gray-900 truncate">{item.name}</p>
                          <p className="text-[10px] text-gray-500 capitalize">{item.category}</p>
                        </div>
                      </div>
                      <Link
                        to={`/stylist?anchorId=${item.id}`}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 transition-colors shrink-0 flex items-center space-x-1"
                      >
                        <Wand2 className="w-2.5 h-2.5" />
                        <span>Style</span>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
