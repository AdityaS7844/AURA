import React, { useState, useEffect } from 'react';
import { X, Search, Check, Shirt, Filter } from 'lucide-react';
import { listItemsApi } from '../../api/wardrobe';

export default function AnchorItemPickerModal({ isOpen, onClose, onSelect, currentSelectedId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    if (!isOpen) return;
    const fetchWardrobe = async () => {
      try {
        setLoading(true);
        const data = await listItemsApi({ limit: 100 });
        setItems(data.items || []);
      } catch (err) {
        console.error('Failed to load wardrobe items for anchor picker:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWardrobe();
  }, [isOpen]);

  if (!isOpen) return null;

  const categories = ['all', 'top', 'bottom', 'dress', 'outerwear', 'footwear', 'accessory'];

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.sub_type && item.sub_type.toLowerCase().includes(search.toLowerCase())) ||
      item.color_name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[var(--color-aura-surface)] w-full max-w-3xl rounded-3xl border border-[var(--color-aura-border)] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[var(--color-aura-border)] flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[var(--color-aura-text)] font-[var(--font-heading)]">
              Select Anchor Clothing Item
            </h3>
            <p className="text-xs text-[var(--color-aura-muted)] mt-0.5">
              Gemini will build every recommendation around this specific piece
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[var(--color-aura-muted)] hover:text-[var(--color-aura-text)] hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 border-b border-[var(--color-aura-border)] bg-[var(--color-aura-page)] flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-[var(--color-aura-muted)]" />
            <input
              type="text"
              placeholder="Search by name, sub-type, or colour..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-[var(--color-aura-surface)] border border-[var(--color-aura-border)] focus:outline-hidden focus:ring-2 focus:ring-[var(--color-aura-primary)]"
            />
          </div>

          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold capitalize transition-colors whitespace-nowrap cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-[var(--color-aura-primary)] text-white shadow-2xs'
                    : 'bg-[var(--color-aura-surface)] text-[var(--color-aura-muted)] border border-[var(--color-aura-border)] hover:bg-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Item Grid */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-44 rounded-2xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <Shirt className="w-10 h-10 text-[var(--color-aura-muted)] mx-auto mb-2 opacity-50" />
              <p className="text-xs font-semibold text-[var(--color-aura-muted)]">No wardrobe items found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {filteredItems.map((item) => {
                const isSelected = currentSelectedId === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      onSelect(item);
                      onClose();
                    }}
                    className={`group relative rounded-2xl border overflow-hidden cursor-pointer transition-all flex flex-col ${
                      isSelected
                        ? 'border-[var(--color-aura-primary)] ring-2 ring-[var(--color-aura-primary)] bg-[var(--color-aura-lavender)]'
                        : 'border-[var(--color-aura-border)] bg-[var(--color-aura-surface)] hover:border-[var(--color-aura-accent)] hover:shadow-md'
                    }`}
                  >
                    {/* Image */}
                    <div className="h-32 w-full bg-[var(--color-aura-page)] relative overflow-hidden flex items-center justify-center">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <Shirt className="w-8 h-8 text-[var(--color-aura-muted)]" />
                      )}
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[var(--color-aura-primary)] text-white flex items-center justify-center shadow-md">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-black/60 text-white backdrop-blur-xs capitalize">
                        {item.category}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="p-3">
                      <p className="text-xs font-bold text-[var(--color-aura-text)] truncate font-[var(--font-heading)]">
                        {item.name}
                      </p>
                      <div className="flex items-center space-x-1.5 mt-1 text-[10px] text-[var(--color-aura-muted)]">
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0"
                          style={{ backgroundColor: item.color_hex }}
                        />
                        <span className="capitalize truncate">{item.color_name}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--color-aura-border)] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--color-aura-muted)] hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
