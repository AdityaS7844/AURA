import React from 'react';
import { Check } from 'lucide-react';

export const PRESET_COLORS = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF', border: true },
  { name: 'Navy', hex: '#1F2A44' },
  { name: 'Gray', hex: '#808080' },
  { name: 'Beige', hex: '#D2B48C' },
  { name: 'Brown', hex: '#8B4513' },
  { name: 'AURA Purple', hex: '#4B2E9E' },
  { name: 'Lavender', hex: '#EAE3FF', border: true },
  { name: 'Olive Green', hex: '#556B2F' },
  { name: 'Burgundy', hex: '#800020' },
  { name: 'Sky Blue', hex: '#87CEEB' },
  { name: 'Red', hex: '#FF0000' },
  { name: 'Yellow', hex: '#F2C94C' },
  { name: 'Pastel Pink', hex: '#FFD1DC', border: true },
];

export default function ColorSwatchPicker({ selectedColors = [], onChange, label, description }) {
  const toggleColor = (hex) => {
    if (selectedColors.includes(hex)) {
      onChange(selectedColors.filter((c) => c !== hex));
    } else {
      onChange([...selectedColors, hex]);
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-aura-muted)]">{label}</label>}
      {description && <p className="text-xs text-[var(--color-aura-muted)]">{description}</p>}
      
      <div className="flex flex-wrap gap-2.5 pt-1">
        {PRESET_COLORS.map((color) => {
          const isSelected = selectedColors.includes(color.hex);
          const isLight = color.hex === '#FFFFFF' || color.hex === '#EAE3FF' || color.hex === '#FFD1DC';

          return (
            <button
              key={color.hex}
              type="button"
              onClick={() => toggleColor(color.hex)}
              title={`${color.name} (${color.hex})`}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
                color.border ? 'border border-[var(--color-aura-border)]' : ''
              } ${
                isSelected
                  ? 'ring-2 ring-offset-2 ring-[var(--color-aura-primary)] scale-105 shadow-sm'
                  : 'hover:scale-105 opacity-90 hover:opacity-100'
              }`}
              style={{ backgroundColor: color.hex }}
            >
              {isSelected && (
                <Check
                  className={`w-4 h-4 ${isLight ? 'text-[var(--color-aura-text)]' : 'text-white'}`}
                  strokeWidth={3}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
