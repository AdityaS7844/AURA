import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Bookmark, ThumbsUp, History, Sparkles, ChevronLeft, ChevronRight, Wand2 } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import OutfitCard from '../components/outfit/OutfitCard';
import { getSavedOutfitsApi } from '../api/outfits';

const TABS = [
  { id: 'saved', label: 'Saved Outfits', icon: Bookmark, desc: 'Your personal bookmarked collection' },
  { id: 'liked', label: 'Liked Outfits', icon: ThumbsUp, desc: 'Recommendations you gave thumbs up' },
  { id: 'history', label: 'All History', icon: History, desc: 'Chronological log of styled recommendations' },
];

export default function SavedOutfitsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'saved';

  const [outfits, setOutfits] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [loading, setLoading] = useState(true);

  const fetchOutfits = async (tabName, pageNum) => {
    try {
      setLoading(true);
      const data = await getSavedOutfitsApi({
        type: tabName,
        page: pageNum,
        limit,
      });
      setOutfits(data.outfits || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(`Failed to fetch ${tabName} outfits:`, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutfits(activeTab, page);
  }, [activeTab, page]);

  const handleTabChange = (newTab) => {
    setSearchParams({ tab: newTab });
    setPage(1);
  };

  const handleOutfitUpdated = (updatedOutfit) => {
    // If we're on the 'saved' tab and it was unsaved, remove from list
    if (activeTab === 'saved' && !updatedOutfit.is_saved) {
      setOutfits((prev) => prev.filter((o) => o.id !== updatedOutfit.id));
      setTotal((prev) => Math.max(0, prev - 1));
      return;
    }
    // If we're on 'liked' tab and it's no longer liked, remove from list
    if (activeTab === 'liked' && updatedOutfit.feedback !== 'like') {
      setOutfits((prev) => prev.filter((o) => o.id !== updatedOutfit.id));
      setTotal((prev) => Math.max(0, prev - 1));
      return;
    }
    // Otherwise update in place
    setOutfits((prev) =>
      prev.map((o) => (o.id === updatedOutfit.id ? updatedOutfit : o))
    );
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <AppLayout>
      <div className="p-6 sm:p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-200">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--color-aura-border)]">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-[var(--color-aura-primary)] text-white flex items-center justify-center shadow-xs">
                <Bookmark className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-aura-text)] font-[var(--font-heading)]">
                Saved Outfits & History
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[var(--color-aura-muted)] mt-1.5">
              Review your favorite combinations, track outfits you've worn, and access your styling archive
            </p>
          </div>

          <Link
            to="/stylist"
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[var(--color-aura-primary)] hover:bg-[var(--color-aura-accent)] transition-all shadow-xs flex items-center space-x-2 self-start cursor-pointer shrink-0"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Generate New Outfits</span>
          </Link>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex items-center space-x-2 border-b border-[var(--color-aura-border)] pb-2 overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[var(--color-aura-lavender)] text-[var(--color-aura-primary)] shadow-2xs border border-[var(--color-aura-primary)]/30'
                    : 'text-[var(--color-aura-muted)] hover:text-[var(--color-aura-text)] hover:bg-gray-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'fill-current' : ''}`} />
                <span>{tab.label}</span>
                {isActive && (
                  <span className="ml-1 text-[10px] px-2 py-0.5 rounded-full bg-white text-[var(--color-aura-primary)] shadow-2xs font-bold">
                    {total}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-72 rounded-3xl border border-[var(--color-aura-border)] bg-[var(--color-aura-surface)] p-6 animate-pulse"
              />
            ))}
          </div>
        ) : outfits.length === 0 ? (
          <div className="bg-[var(--color-aura-surface)] rounded-3xl border border-[var(--color-aura-border)] p-12 text-center space-y-4 max-w-lg mx-auto shadow-xs">
            <div className="w-16 h-16 rounded-3xl bg-[var(--color-aura-lavender)] text-[var(--color-aura-primary)] flex items-center justify-center mx-auto shadow-xs">
              {activeTab === 'saved' && <Bookmark className="w-8 h-8" />}
              {activeTab === 'liked' && <ThumbsUp className="w-8 h-8" />}
              {activeTab === 'history' && <History className="w-8 h-8" />}
            </div>

            <div>
              <h3 className="text-base font-bold text-[var(--color-aura-text)] font-[var(--font-heading)]">
                {activeTab === 'saved' && 'No Saved Outfits Yet'}
                {activeTab === 'liked' && 'No Liked Outfits Yet'}
                {activeTab === 'history' && 'No Outfits Styled Yet'}
              </h3>
              <p className="text-xs text-[var(--color-aura-muted)] mt-1.5 leading-relaxed">
                {activeTab === 'saved' &&
                  'When you generate outfits with Gemini, click the Bookmark icon to save combinations for quick access!'}
                {activeTab === 'liked' &&
                  'Click the Thumbs Up icon on outfits you love. AURA uses your positive feedback to tune future recommendations!'}
                {activeTab === 'history' &&
                  'Your styling history will appear here whenever you generate outfits for work, casual outings, or special occasions.'}
              </p>
            </div>

            <div className="pt-2">
              <Link
                to="/stylist"
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[var(--color-aura-primary)] hover:bg-[var(--color-aura-accent)] transition-all shadow-xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Go to AI Stylist</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {outfits.map((outfit) => (
                <OutfitCard
                  key={outfit.id}
                  outfit={outfit}
                  onUpdate={handleOutfitUpdated}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-6 border-t border-[var(--color-aura-border)]">
                <span className="text-xs text-[var(--color-aura-muted)]">
                  Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} outfits
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="p-2 rounded-xl border border-[var(--color-aura-border)] text-[var(--color-aura-text)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold px-3 py-1 rounded-lg bg-[var(--color-aura-lavender)] text-[var(--color-aura-primary)]">
                    {page} / {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="p-2 rounded-xl border border-[var(--color-aura-border)] text-[var(--color-aura-text)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
