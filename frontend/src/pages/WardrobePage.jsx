import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Shirt, AlertCircle, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import FilterBar from '../components/wardrobe/FilterBar';
import ClothingCard from '../components/wardrobe/ClothingCard';
import Skeleton from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';
import { listItemsApi } from '../api/wardrobe';

export default function WardrobePage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter States
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [season, setSeason] = useState('all');
  const [occasion, setOccasion] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;

  const fetchWardrobe = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        limit,
        category: category || undefined,
        season: season !== 'all' ? season : undefined,
        occasion: occasion || undefined,
        search: search.trim() || undefined,
      };

      const data = await listItemsApi(params);
      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to fetch wardrobe items:', err);
      setError(err.response?.data?.detail || 'Failed to load wardrobe clothes.');
    } finally {
      setLoading(false);
    }
  }, [page, category, season, occasion, search]);

  useEffect(() => {
    fetchWardrobe();
  }, [fetchWardrobe]);

  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setSeason('all');
    setOccasion('');
    setPage(1);
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <AppLayout>
      <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--color-aura-border)]">
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-2xl font-bold font-[var(--font-heading)] text-[var(--color-aura-text)]">
                My Wardrobe
              </h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[var(--color-aura-lavender)] text-[var(--color-aura-primary)]">
                {total} items
              </span>
            </div>
            <p className="text-xs text-[var(--color-aura-muted)] mt-1">
              Browse, filter, and organize your owned clothing collection.
            </p>
          </div>

          <Link
            to="/wardrobe/add"
            className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[var(--color-aura-primary)] hover:bg-[var(--color-aura-accent)] transition-all shadow-xs cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Clothing Item</span>
          </Link>
        </div>

        {/* Search & Filter Bar */}
        <FilterBar
          search={search}
          onSearchChange={(val) => { setSearch(val); setPage(1); }}
          category={category}
          onCategoryChange={(val) => { setCategory(val); setPage(1); }}
          season={season}
          onSeasonChange={(val) => { setSeason(val); setPage(1); }}
          occasion={occasion}
          onOccasionChange={(val) => { setOccasion(val); setPage(1); }}
          onResetFilters={handleResetFilters}
          totalItems={total}
        />

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 text-red-700 text-xs border border-red-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchWardrobe}
              className="text-xs font-bold underline hover:text-red-800 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Clothing Items Grid / Skeleton / Empty State */}
        {loading ? (
          <Skeleton count={8} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={Shirt}
            title={category || search ? 'No matching clothing items' : 'Your wardrobe is empty'}
            description={
              category || search
                ? 'Try adjusting your search keywords or resetting your active category filters.'
                : 'Start digitizing your physical clothes to unlock AI personalized outfit styling.'
            }
            actionText={category || search ? 'Reset Filters' : 'Add Your First Item'}
            actionLink={category || search ? undefined : '/wardrobe/add'}
            onAction={category || search ? handleResetFilters : undefined}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((item) => (
              <ClothingCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="pt-6 border-t border-[var(--color-aura-border)] flex items-center justify-between text-xs text-[var(--color-aura-muted)]">
            <span>
              Showing Page <strong className="text-[var(--color-aura-text)]">{page}</strong> of <strong className="text-[var(--color-aura-text)]">{totalPages}</strong> ({total} items total)
            </span>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1}
                className="p-2 rounded-xl border border-[var(--color-aura-border)] bg-[var(--color-aura-surface)] hover:bg-gray-50 disabled:opacity-40 cursor-pointer transition-colors"
                title="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page >= totalPages}
                className="p-2 rounded-xl border border-[var(--color-aura-border)] bg-[var(--color-aura-surface)] hover:bg-gray-50 disabled:opacity-40 cursor-pointer transition-colors"
                title="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
