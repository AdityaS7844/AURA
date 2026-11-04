import React from 'react';

export default function Skeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-[var(--color-aura-surface)] rounded-2xl border border-[var(--color-aura-border)] overflow-hidden shadow-xs animate-pulse"
        >
          <div className="h-56 bg-gray-200" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-200 rounded-md w-3/4" />
            <div className="flex justify-between items-center">
              <div className="h-3 bg-gray-200 rounded-md w-1/3" />
              <div className="h-3 bg-gray-200 rounded-md w-1/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
