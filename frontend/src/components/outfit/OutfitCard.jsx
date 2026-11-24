import React, { useState, useEffect } from 'react';
import { Sparkles, Shirt, Eye, ThumbsUp, ThumbsDown, Bookmark, Check, CalendarCheck } from 'lucide-react';
import OutfitDetailModal from './OutfitDetailModal';
import { submitFeedbackApi } from '../../api/outfits';

export default function OutfitCard({ outfit: initialOutfit, onUpdate }) {
  const [outfit, setOutfit] = useState(initialOutfit);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [justWorn, setJustWorn] = useState(false);

  // Sync state if initialOutfit prop changes
  React.useEffect(() => {
    setOutfit(initialOutfit);
  }, [initialOutfit]);

  const handleFeedback = async (action) => {
    try {
      setActionLoading(true);
      const res = await submitFeedbackApi(outfit.id, action);
      if (res.outfit) {
        setOutfit(res.outfit);
        if (onUpdate) onUpdate(res.outfit);
      }
      if (action === 'worn') {
        setJustWorn(true);
        setTimeout(() => setJustWorn(false), 3000);
      }
    } catch (err) {
      console.error(`Failed to submit ${action} feedback:`, err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveToggle = () => {
    const nextAction = outfit.is_saved ? 'unsave' : 'save';
    handleFeedback(nextAction);
  };

  const items = outfit.items || [];
  const itemCount = items.length;

  return (
    <>
      <div className="group rounded-3xl border border-[var(--color-aura-border)] bg-[var(--color-aura-surface)] shadow-xs hover:shadow-lg hover:border-[var(--color-aura-accent)] transition-all flex flex-col justify-between overflow-hidden">
        {/* Card Header */}
        <div className="p-5 pb-3">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--color-aura-lavender)] text-[var(--color-aura-primary)] border border-[var(--color-aura-accent)]/20">
              {outfit.occasion}
            </span>
            {outfit.score && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1 shrink-0">
                <Sparkles className="w-3 h-3 text-emerald-500" />
                <span>{outfit.score}% Match</span>
              </span>
            )}
          </div>

          <h3 className="text-base font-bold text-[var(--color-aura-text)] font-[var(--font-heading)] line-clamp-1 group-hover:text-[var(--color-aura-primary)] transition-colors">
            {outfit.name}
          </h3>
        </div>

        {/* Real Wardrobe Items Photo Collage */}
        <div className="px-5 py-2">
          <div
            onClick={() => setIsDetailOpen(true)}
            className="cursor-pointer group/collage relative bg-[var(--color-aura-page)] rounded-2xl p-2 border border-[var(--color-aura-border)] hover:border-[var(--color-aura-primary)] transition-all"
          >
            <div
              className={`grid gap-2 ${
                itemCount === 1
                  ? 'grid-cols-1 h-52'
                  : itemCount === 2
                  ? 'grid-cols-2 h-52'
                  : itemCount === 3
                  ? 'grid-cols-3 h-48'
                  : 'grid-cols-2 sm:grid-cols-4 h-44'
              }`}
            >
              {items.map((item) => (
                <div
                  key={item.id}
                  className="relative rounded-xl overflow-hidden bg-white border border-[var(--color-aura-border)] flex items-center justify-center group/item"
                >
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-[var(--color-aura-muted)] p-2 text-center">
                      <Shirt className="w-6 h-6 mb-1 opacity-70" />
                      <span className="text-[9px] font-bold uppercase truncate max-w-[70px]">{item.category}</span>
                    </div>
                  )}

                  {/* Thumbnail Label Overlay */}
                  <span className="absolute bottom-1.5 left-1.5 right-1.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-black/60 text-white backdrop-blur-xs truncate text-center capitalize">
                    {item.name}
                  </span>
                </div>
              ))}
            </div>

            {/* View Full Collage Hover Pill */}
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/collage:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
              <span className="px-3 py-1.5 rounded-xl bg-white/95 text-[var(--color-aura-primary)] text-xs font-bold shadow-md flex items-center space-x-1.5 backdrop-blur-xs">
                <Eye className="w-3.5 h-3.5" />
                <span>View Breakdown</span>
              </span>
            </div>
          </div>
        </div>

        {/* Stylist Reason Snippet */}
        <div className="p-5 pt-2 flex-1 flex flex-col justify-between space-y-4">
          {outfit.reason && (
            <p className="text-xs text-[var(--color-aura-muted)] leading-relaxed italic line-clamp-2 bg-[var(--color-aura-page)] p-3 rounded-xl border border-[var(--color-aura-border)]/60">
              "{outfit.reason}"
            </p>
          )}

          {/* Item Category Chips */}
          <div className="flex flex-wrap gap-1.5">
            {items.map((it) => (
              <span
                key={it.id}
                className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-gray-100 text-[var(--color-aura-text)] flex items-center space-x-1 capitalize"
              >
                <span
                  className="w-2 h-2 rounded-full border border-black/15 inline-block"
                  style={{ backgroundColor: it.color_hex }}
                />
                <span>{it.category}</span>
              </span>
            ))}
          </div>

          {/* Action Bar with Live M8 Feedback */}
          <div className="pt-3 border-t border-[var(--color-aura-border)] flex items-center justify-between">
            <div className="flex items-center space-x-1">
              {/* Like Button */}
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleFeedback('like')}
                title={outfit.feedback === 'like' ? 'Liked' : 'Like outfit'}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  outfit.feedback === 'like'
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-2xs'
                    : 'text-[var(--color-aura-muted)] hover:bg-gray-100 hover:text-emerald-600'
                }`}
              >
                <ThumbsUp className={`w-3.5 h-3.5 ${outfit.feedback === 'like' ? 'fill-current' : ''}`} />
              </button>

              {/* Dislike Button */}
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleFeedback('dislike')}
                title={outfit.feedback === 'dislike' ? 'Disliked' : 'Dislike outfit'}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  outfit.feedback === 'dislike'
                    ? 'bg-rose-50 text-rose-600 border border-rose-200 shadow-2xs'
                    : 'text-[var(--color-aura-muted)] hover:bg-gray-100 hover:text-rose-600'
                }`}
              >
                <ThumbsDown className={`w-3.5 h-3.5 ${outfit.feedback === 'dislike' ? 'fill-current' : ''}`} />
              </button>

              {/* Save / Bookmark Button */}
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleSaveToggle}
                title={outfit.is_saved ? 'Saved to collection (click to remove)' : 'Save outfit'}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  outfit.is_saved
                    ? 'bg-[var(--color-aura-lavender)] text-[var(--color-aura-primary)] border border-[var(--color-aura-primary)]/30 shadow-2xs'
                    : 'text-[var(--color-aura-muted)] hover:bg-gray-100 hover:text-[var(--color-aura-primary)]'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${outfit.is_saved ? 'fill-current' : ''}`} />
              </button>

              {/* I Wore This Button */}
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleFeedback('worn')}
                title="Mark this outfit as worn today (updates item wear counts)"
                className={`px-2 py-1 rounded-xl text-[10px] font-bold flex items-center space-x-1 transition-all cursor-pointer ${
                  justWorn
                    ? 'bg-emerald-500 text-white'
                    : 'text-[var(--color-aura-muted)] hover:bg-gray-100 hover:text-[var(--color-aura-text)]'
                }`}
              >
                {justWorn ? (
                  <>
                    <Check className="w-3 h-3" />
                    <span>Worn!</span>
                  </>
                ) : (
                  <>
                    <CalendarCheck className="w-3 h-3" />
                    <span className="hidden sm:inline">Worn</span>
                  </>
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsDetailOpen(true)}
              className="text-xs font-bold text-[var(--color-aura-primary)] hover:underline flex items-center space-x-1 cursor-pointer py-1 px-2 rounded-lg hover:bg-[var(--color-aura-lavender)] transition-colors"
            >
              <span>Details</span>
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Outfit Detail Modal */}
      <OutfitDetailModal
        outfit={outfit}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onUpdate={(updated) => {
          setOutfit(updated);
          if (onUpdate) onUpdate(updated);
        }}
      />
    </>
  );
}
