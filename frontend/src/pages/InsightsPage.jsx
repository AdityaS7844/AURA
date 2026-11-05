import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  Shirt,
  Flame,
  Sparkles,
  Bookmark,
  Award,
  ArrowRight,
  TrendingUp,
  Clock,
  Wand2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { getInsightsSummaryApi } from '../api/insights';

const CATEGORY_COLORS = {
  top: { bg: 'bg-blue-500', text: 'text-blue-700', light: 'bg-blue-50', border: 'border-blue-200' },
  bottom: { bg: 'bg-indigo-500', text: 'text-indigo-700', light: 'bg-indigo-50', border: 'border-indigo-200' },
  dress: { bg: 'bg-purple-500', text: 'text-purple-700', light: 'bg-purple-50', border: 'border-purple-200' },
  outerwear: { bg: 'bg-amber-500', text: 'text-amber-700', light: 'bg-amber-50', border: 'border-amber-200' },
  footwear: { bg: 'bg-emerald-500', text: 'text-emerald-700', light: 'bg-emerald-50', border: 'border-emerald-200' },
  accessory: { bg: 'bg-rose-500', text: 'text-rose-700', light: 'bg-rose-50', border: 'border-rose-200' },
};

export default function InsightsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);
        const res = await getInsightsSummaryApi();
        setData(res);
      } catch (err) {
        console.error('Failed to load insights summary:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, []);

  const totalItems = data?.total_items || 0;
  const byCategory = data?.by_category || {};
  const mostWorn = data?.most_worn || [];
  const neverWorn = data?.never_worn || [];
  const savedOutfits = data?.saved_outfits || 0;
  const totalOutfits = data?.total_outfits_styled || 0;

  // Calculate wardrobe utilization percentage
  const wornItemsCount = mostWorn.length > 0 ? totalItems - neverWorn.length : 0;
  const utilizationRate = totalItems > 0 ? Math.round((wornItemsCount / totalItems) * 100) : 0;

  return (
    <AppLayout>
      <div className="p-6 sm:p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-200">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--color-aura-border)]">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-[var(--color-aura-primary)] text-white flex items-center justify-center shadow-xs">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-aura-text)] font-[var(--font-heading)]">
                Wardrobe Insights & Analytics
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[var(--color-aura-muted)] mt-1.5">
              Data-driven analytics on your clothing utilization, wear frequencies, and styling trends
            </p>
          </div>

          <Link
            to="/stylist"
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[var(--color-aura-primary)] hover:bg-[var(--color-aura-accent)] transition-all shadow-xs flex items-center space-x-2 self-start cursor-pointer shrink-0"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Style Outfits</span>
          </Link>
        </div>

        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-28 rounded-2xl bg-gray-100 animate-pulse" />
              ))}
            </div>
            <div className="h-64 rounded-3xl bg-gray-100 animate-pulse" />
          </div>
        ) : totalItems === 0 ? (
          <div className="bg-[var(--color-aura-surface)] rounded-3xl border border-[var(--color-aura-border)] p-12 text-center space-y-4 max-w-lg mx-auto shadow-xs">
            <div className="w-16 h-16 rounded-3xl bg-[var(--color-aura-lavender)] text-[var(--color-aura-primary)] flex items-center justify-center mx-auto shadow-xs">
              <Shirt className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--color-aura-text)] font-[var(--font-heading)]">
                No Wardrobe Data Yet
              </h3>
              <p className="text-xs text-[var(--color-aura-muted)] mt-1.5 leading-relaxed">
                Add clothing items to your wardrobe to unlock category breakdowns, wear frequency tracking, and styling insights!
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/wardrobe/add"
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[var(--color-aura-primary)] hover:bg-[var(--color-aura-accent)] transition-all shadow-xs"
              >
                <span>Add Your First Item</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl bg-[var(--color-aura-surface)] border border-[var(--color-aura-border)] shadow-xs flex flex-col justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-aura-muted)]">
                  Total Items
                </span>
                <div className="text-3xl font-black text-[var(--color-aura-text)] font-[var(--font-heading)] mt-2">
                  {totalItems}
                </div>
                <p className="text-[10px] text-[var(--color-aura-muted)] mt-1">In your active wardrobe</p>
              </div>

              <div className="p-5 rounded-3xl bg-[var(--color-aura-surface)] border border-[var(--color-aura-border)] shadow-xs flex flex-col justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-aura-muted)]">
                  Saved Outfits
                </span>
                <div className="text-3xl font-black text-[var(--color-aura-primary)] font-[var(--font-heading)] mt-2">
                  {savedOutfits}
                </div>
                <p className="text-[10px] text-[var(--color-aura-muted)] mt-1">Bookmarked combinations</p>
              </div>

              <div className="p-5 rounded-3xl bg-[var(--color-aura-surface)] border border-[var(--color-aura-border)] shadow-xs flex flex-col justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-aura-muted)]">
                  Total Styled
                </span>
                <div className="text-3xl font-black text-indigo-600 font-[var(--font-heading)] mt-2">
                  {totalOutfits}
                </div>
                <p className="text-[10px] text-[var(--color-aura-muted)] mt-1">AI recommendation cycles</p>
              </div>

              <div className="p-5 rounded-3xl bg-[var(--color-aura-surface)] border border-[var(--color-aura-border)] shadow-xs flex flex-col justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-aura-muted)]">
                  Utilization
                </span>
                <div className="text-3xl font-black text-emerald-600 font-[var(--font-heading)] mt-2">
                  {utilizationRate}%
                </div>
                <p className="text-[10px] text-[var(--color-aura-muted)] mt-1">Wardrobe worn at least 1×</p>
              </div>
            </div>

            {/* Category Breakdown Progress Bars */}
            <div className="bg-[var(--color-aura-surface)] p-6 sm:p-8 rounded-3xl border border-[var(--color-aura-border)] shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[var(--color-aura-text)] font-[var(--font-heading)]">
                    Category Distribution
                  </h3>
                  <p className="text-xs text-[var(--color-aura-muted)]">
                    How your wardrobe is balanced across clothing categories
                  </p>
                </div>
                <span className="text-xs font-bold text-[var(--color-aura-muted)]">{Object.keys(byCategory).length} Active Categories</span>
              </div>

              <div className="space-y-4">
                {Object.entries(byCategory).map(([cat, count]) => {
                  const percentage = totalItems > 0 ? Math.round((count / totalItems) * 100) : 0;
                  const colors = CATEGORY_COLORS[cat] || { bg: 'bg-gray-500', text: 'text-gray-700', light: 'bg-gray-50', border: 'border-gray-200' };

                  return (
                    <div key={cat} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[var(--color-aura-text)] capitalize flex items-center space-x-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${colors.bg}`} />
                          <span>{cat}</span>
                        </span>
                        <span className="font-semibold text-[var(--color-aura-muted)]">
                          {count} {count === 1 ? 'item' : 'items'} ({percentage}%)
                        </span>
                      </div>
                      <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${colors.bg} rounded-full transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Most Worn vs Never Worn Dual Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Most Worn Pieces */}
              <div className="bg-[var(--color-aura-surface)] p-6 rounded-3xl border border-[var(--color-aura-border)] shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--color-aura-border)]">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[var(--color-aura-text)] font-[var(--font-heading)]">
                        Most Worn Pieces
                      </h3>
                      <p className="text-xs text-[var(--color-aura-muted)]">Your highest-rotation wardrobe items</p>
                    </div>
                  </div>
                </div>

                {mostWorn.length === 0 ? (
                  <p className="text-xs text-[var(--color-aura-muted)] py-6 text-center italic">
                    No wear tracked yet. Click "Worn" on outfit cards to start tracking wear frequencies!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {mostWorn.map((item, index) => (
                      <Link
                        key={item.id}
                        to={`/wardrobe/${item.id}`}
                        className="flex items-center justify-between p-3 rounded-2xl border border-[var(--color-aura-border)] hover:border-[var(--color-aura-primary)] bg-[var(--color-aura-page)] transition-all group"
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <span className="text-xs font-black text-[var(--color-aura-muted)] w-4 text-center shrink-0">
                            #{index + 1}
                          </span>
                          <div className="w-12 h-12 rounded-xl bg-white overflow-hidden shrink-0 border border-[var(--color-aura-border)] flex items-center justify-center">
                            {item.image_url ? (
                              <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <Shirt className="w-5 h-5 text-[var(--color-aura-muted)]" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-[var(--color-aura-text)] truncate font-[var(--font-heading)] group-hover:text-[var(--color-aura-primary)] transition-colors">
                              {item.name}
                            </h4>
                            <p className="text-[10px] text-[var(--color-aura-muted)] capitalize">
                              {item.category} • {item.sub_type || 'standard'}
                            </p>
                          </div>
                        </div>

                        <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 shrink-0">
                          {item.times_worn}×
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Never Worn / Forgotten Gems */}
              <div className="bg-[var(--color-aura-surface)] p-6 rounded-3xl border border-[var(--color-aura-border)] shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--color-aura-border)]">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                      <Flame className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[var(--color-aura-text)] font-[var(--font-heading)]">
                        Forgotten Gems
                      </h3>
                      <p className="text-xs text-[var(--color-aura-muted)]">Clothes with 0 wears waiting to be styled</p>
                    </div>
                  </div>
                </div>

                {neverWorn.length === 0 ? (
                  <p className="text-xs text-[var(--color-aura-muted)] py-6 text-center italic">
                    Great job! You have worn every item in your wardrobe at least once.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {neverWorn.slice(0, 5).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 rounded-2xl border border-[var(--color-aura-border)] bg-[var(--color-aura-page)]"
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className="w-12 h-12 rounded-xl bg-white overflow-hidden shrink-0 border border-[var(--color-aura-border)] flex items-center justify-center">
                            {item.image_url ? (
                              <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <Shirt className="w-5 h-5 text-[var(--color-aura-muted)]" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-[var(--color-aura-text)] truncate font-[var(--font-heading)]">
                              {item.name}
                            </h4>
                            <p className="text-[10px] text-[var(--color-aura-muted)] capitalize">
                              {item.category} • {item.color_name}
                            </p>
                          </div>
                        </div>

                        <Link
                          to={`/stylist?occasion=casual`}
                          className="px-3 py-1.5 rounded-xl text-[10px] font-bold text-[var(--color-aura-primary)] bg-white border border-[var(--color-aura-border)] hover:bg-[var(--color-aura-lavender)] transition-all shrink-0 flex items-center space-x-1"
                        >
                          <Wand2 className="w-3 h-3" />
                          <span>Style It</span>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
