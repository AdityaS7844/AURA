import React from 'react';
import { X, Sparkles, Shirt, ThumbsUp, ThumbsDown, Bookmark, CheckCheck, Thermometer } from 'lucide-react';

export default function OutfitDetailModal({ outfit, isOpen, onClose }) {
  if (!isOpen || !outfit) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[var(--color-aura-surface)] w-full max-w-3xl rounded-3xl border border-[var(--color-aura-border)] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-[var(--color-aura-border)] flex items-start justify-between bg-gradient-to-r from-[var(--color-aura-lavender)]/40 to-transparent">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--color-aura-lavender)] text-[var(--color-aura-primary)] border border-[var(--color-aura-accent)]/30">
                {outfit.occasion}
              </span>
              {outfit.score && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  <span>{outfit.score}% Match</span>
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-aura-text)] font-[var(--font-heading)]">
              {outfit.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[var(--color-aura-muted)] hover:text-[var(--color-aura-text)] hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Stylist Reason Box */}
          {outfit.reason && (
            <div className="p-4 rounded-2xl bg-[var(--color-aura-page)] border border-[var(--color-aura-border)] space-y-1.5">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-[var(--color-aura-primary)] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Stylist's Explanation</span>
              </div>
              <p className="text-xs sm:text-sm text-[var(--color-aura-text)] leading-relaxed italic">
                "{outfit.reason}"
              </p>
            </div>
          )}

          {/* Items In This Outfit */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-aura-muted)] mb-3">
              Included Wardrobe Items ({outfit.items?.length || 0})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {outfit.items?.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center space-x-4 p-3 rounded-2xl border border-[var(--color-aura-border)] bg-[var(--color-aura-surface)] hover:border-[var(--color-aura-accent)] transition-all shadow-2xs"
                >
                  <div className="w-20 h-20 rounded-xl bg-[var(--color-aura-page)] overflow-hidden shrink-0 flex items-center justify-center border border-[var(--color-aura-border)]">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Shirt className="w-8 h-8 text-[var(--color-aura-muted)] opacity-60" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-aura-muted)] capitalize">
                      {item.category} • {item.sub_type || 'standard'}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-[var(--color-aura-text)] truncate font-[var(--font-heading)]">
                      {item.name}
                    </h4>

                    <div className="flex items-center space-x-2 text-[11px] text-[var(--color-aura-muted)]">
                      <div className="flex items-center space-x-1">
                        <span
                          className="w-3 h-3 rounded-full border border-black/15 shrink-0"
                          style={{ backgroundColor: item.color_hex }}
                        />
                        <span className="capitalize">{item.color_name}</span>
                      </div>
                      <span>•</span>
                      <span>Warmth {item.warmth}/5</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer with Actions */}
        <div className="p-4 border-t border-[var(--color-aura-border)] bg-[var(--color-aura-page)] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <button
              disabled
              title="Coming in Milestone 8"
              className="px-3 py-1.5 rounded-xl border border-[var(--color-aura-border)] bg-[var(--color-aura-surface)] text-[var(--color-aura-muted)] text-xs font-semibold flex items-center space-x-1.5 opacity-60 cursor-not-allowed"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>Like</span>
            </button>
            <button
              disabled
              title="Coming in Milestone 8"
              className="px-3 py-1.5 rounded-xl border border-[var(--color-aura-border)] bg-[var(--color-aura-surface)] text-[var(--color-aura-muted)] text-xs font-semibold flex items-center space-x-1.5 opacity-60 cursor-not-allowed"
            >
              <ThumbsDown className="w-3.5 h-3.5" />
              <span>Dislike</span>
            </button>
            <button
              disabled
              title="Coming in Milestone 8"
              className="px-3 py-1.5 rounded-xl border border-[var(--color-aura-border)] bg-[var(--color-aura-surface)] text-[var(--color-aura-muted)] text-xs font-semibold flex items-center space-x-1.5 opacity-60 cursor-not-allowed"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>
            <span className="text-[10px] text-[var(--color-aura-muted)] italic hidden sm:inline">
              (Feedback & Saving activates in M8)
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[var(--color-aura-primary)] hover:bg-[var(--color-aura-accent)] transition-all cursor-pointer shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
