import React from 'react';
import { Link } from 'react-router-dom';
import { Shirt, Flame, Award, Eye } from 'lucide-react';
import WardrobeImage from '../common/WardrobeImage';

const CATEGORY_COLORS = {
  top: 'bg-blue-50 text-blue-700 border-blue-200',
  bottom: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  dress: 'bg-purple-50 text-purple-700 border-purple-200',
  outerwear: 'bg-amber-50 text-amber-700 border-amber-200',
  footwear: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  accessory: 'bg-rose-50 text-rose-700 border-rose-200',
};

export default function ClothingCard({ item }) {
  return (
    <Link
      to={`/wardrobe/${item.id}`}
      className="group bg-[var(--color-aura-surface)] rounded-2xl border border-[var(--color-aura-border)] overflow-hidden shadow-xs hover:shadow-md hover:border-[var(--color-aura-accent)] transition-all flex flex-col cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative h-60 w-full bg-[var(--color-aura-page)] overflow-hidden flex items-center justify-center">
        <WardrobeImage
          src={item.image_url}
          alt={item.name}
          category={item.category}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Category Pill Tag */}
        <span
          className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-2xs ${
            CATEGORY_COLORS[item.category] || 'bg-gray-50 text-gray-700 border-gray-200'
          }`}
        >
          {item.category}
        </span>

        {/* Wear Count Badge */}
        {item.times_worn > 0 && (
          <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/60 text-white backdrop-blur-xs flex items-center space-x-1">
            <span>Worn {item.times_worn}×</span>
          </span>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h3 className="font-bold text-sm text-[var(--color-aura-text)] group-hover:text-[var(--color-aura-primary)] transition-colors line-clamp-1 font-[var(--font-heading)]">
            {item.name}
          </h3>
          <p className="text-xs text-[var(--color-aura-muted)] capitalize mt-0.5">
            {item.sub_type ? item.sub_type.replace('_', ' ') : item.category} • {item.pattern}
          </p>
        </div>

        {/* Color & Attributes Strip */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-[var(--color-aura-muted)]">
          <div className="flex items-center space-x-1.5">
            <span
              className="w-3.5 h-3.5 rounded-full border border-black/10 inline-block shrink-0 shadow-2xs"
              style={{ backgroundColor: item.color_hex }}
              title={item.color_hex}
            />
            <span className="text-[11px] capitalize truncate max-w-[80px]">{item.color_name}</span>
          </div>

          <div className="flex items-center space-x-2 text-[10px]">
            <span title={`Warmth: ${item.warmth}/5`} className="flex items-center text-amber-600 font-medium">
              <Flame className="w-3 h-3 mr-0.5" />
              {item.warmth}
            </span>
            <span title={`Formality: ${item.formality}/5`} className="flex items-center text-indigo-600 font-medium">
              <Award className="w-3 h-3 mr-0.5" />
              {item.formality}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
