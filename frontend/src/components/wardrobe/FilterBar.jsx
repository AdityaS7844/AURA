import React from 'react';
import { Search, Filter, X, RotateCcw } from 'lucide-react';
import { CATEGORIES, SEASONS, OCCASIONS } from '../../utils/constants';

export default function FilterBar({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  season,
  onSeasonChange,
  occasion,
  onOccasionChange,
  onResetFilters,
  totalItems,
}) {
  const hasActiveFilters = search || category || (season && season !== 'all') || occasion;

  return (
    <div className="space-y-4 mb-8">
      {/* Search and Secondary Selectors Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--color-aura-muted)]">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search clothes by name, fabric, notes..."
            className="block w-full pl-10 pr-9 py-2.5 rounded-xl border border-[var(--color-aura-border)] bg-[var(--color-aura-surface)] focus:border-[var(--color-aura-primary)] text-xs sm:text-sm outline-none transition-all shadow-2xs"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--color-aura-muted)] hover:text-[var(--color-aura-text)]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Season Filter Dropdown */}
        <select
          value={season}
          onChange={(e) => onSeasonChange(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl border border-[var(--color-aura-border)] bg-[var(--color-aura-surface)] text-xs text-[var(--color-aura-text)] font-medium outline-none cursor-pointer shadow-2xs capitalize"
        >
          <option value="all">Season: All</option>
          {SEASONS.filter((s) => s !== 'all').map((s) => (
            <option key={s} value={s}>
              Season: {s}
            </option>
          ))}
        </select>

        {/* Occasion Filter Dropdown */}
        <select
          value={occasion}
          onChange={(e) => onOccasionChange(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl border border-[var(--color-aura-border)] bg-[var(--color-aura-surface)] text-xs text-[var(--color-aura-text)] font-medium outline-none cursor-pointer shadow-2xs capitalize"
        >
          <option value="">Occasion: All</option>
          {OCCASIONS.map((occ) => (
            <option key={occ} value={occ}>
              Occasion: {occ}
            </option>
          ))}
        </select>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="inline-flex items-center space-x-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
            title="Reset all active filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Category Pills Strip */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => onCategoryChange('')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            !category
              ? 'bg-[var(--color-aura-primary)] text-white shadow-2xs'
              : 'bg-[var(--color-aura-surface)] text-[var(--color-aura-muted)] border border-[var(--color-aura-border)] hover:bg-gray-50'
          }`}
        >
          All Items ({totalItems})
        </button>

        {CATEGORIES.map((cat) => {
          const isSelected = category === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onCategoryChange(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap capitalize transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[var(--color-aura-primary)] text-white shadow-2xs'
                  : 'bg-[var(--color-aura-surface)] text-[var(--color-aura-muted)] border border-[var(--color-aura-border)] hover:bg-gray-50'
              }`}
            >
              {cat}s
            </button>
          );
        })}
      </div>
    </div>
  );
}
