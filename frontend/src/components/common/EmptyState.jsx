import React from 'react';
import { Shirt, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmptyState({
  icon: Icon = Shirt,
  title = 'No clothing items found',
  description = 'Your wardrobe looks empty or no items match your active filters.',
  actionText = 'Add Clothing Item',
  actionLink = '/wardrobe/add',
  onAction,
}) {
  return (
    <div className="bg-[var(--color-aura-surface)] rounded-2xl border border-[var(--color-aura-border)] p-12 text-center max-w-lg mx-auto shadow-xs my-8">
      <div className="w-16 h-16 rounded-2xl bg-[var(--color-aura-lavender)] text-[var(--color-aura-primary)] flex items-center justify-center mx-auto mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold font-[var(--font-heading)] text-[var(--color-aura-text)] mb-2">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-[var(--color-aura-muted)] mb-6 max-w-sm mx-auto">
        {description}
      </p>

      {actionLink && (
        <Link
          to={actionLink}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[var(--color-aura-primary)] hover:bg-[var(--color-aura-accent)] transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{actionText}</span>
        </Link>
      )}

      {onAction && !actionLink && (
        <button
          onClick={onAction}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[var(--color-aura-primary)] hover:bg-[var(--color-aura-accent)] transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
}
