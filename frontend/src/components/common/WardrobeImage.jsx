import React, { useState } from 'react';
import { Shirt } from 'lucide-react';
import { getImageUrl } from '../../utils/image';

export default function WardrobeImage({
  src,
  alt = '',
  className = 'w-full h-full object-cover',
  fallbackClassName = 'flex flex-col items-center justify-center text-[var(--color-aura-muted)] p-6 text-center w-full h-full',
  iconSize = 'w-7 h-7',
  category,
}) {
  const [error, setError] = useState(false);
  const resolvedSrc = getImageUrl(src);

  if (resolvedSrc && !error) {
    return (
      <img
        src={resolvedSrc}
        alt={alt}
        loading="lazy"
        onError={() => setError(true)}
        className={className}
      />
    );
  }

  return (
    <div className={fallbackClassName}>
      <div className="w-14 h-14 rounded-2xl bg-[var(--color-aura-lavender)] text-[var(--color-aura-primary)] flex items-center justify-center mb-2 shadow-2xs group-hover:scale-110 transition-transform">
        <Shirt className={iconSize} />
      </div>
      {category && (
        <span className="text-[11px] font-medium uppercase tracking-wider capitalize">
          {category}
        </span>
      )}
    </div>
  );
}
