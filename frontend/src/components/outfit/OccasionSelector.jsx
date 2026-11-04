import React from 'react';
import { Coffee, Briefcase, Sparkles, PartyPopper, Heart, Activity, Plane, Flame } from 'lucide-react';

export const OCCASIONS = [
  { id: 'casual', label: 'Casual', icon: Coffee, desc: 'Everyday, coffee with friends, relaxed outings' },
  { id: 'office', label: 'Work & Office', icon: Briefcase, desc: 'Meetings, desk work, business casual' },
  { id: 'formal', label: 'Formal Evening', icon: Sparkles, desc: 'Galas, weddings, formal banquets' },
  { id: 'party', label: 'Party & Night Out', icon: PartyPopper, desc: 'Celebrations, clubs, evening drinks' },
  { id: 'date', label: 'Date Night', icon: Heart, desc: 'Romantic dinners, cozy evenings' },
  { id: 'sports', label: 'Active & Gym', icon: Activity, desc: 'Workouts, running, casual sports' },
  { id: 'travel', label: 'Travel & Transit', icon: Plane, desc: 'Road trips, airport runs, transit' },
  { id: 'festival', label: 'Festive & Cultural', icon: Flame, desc: 'Traditional festivals, celebrations' },
];

export default function OccasionSelector({ value, onChange }) {
  return (
    <div className="space-y-3">
      <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-aura-muted)]">
        Select Occasion <span className="text-red-500">*</span>
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {OCCASIONS.map((occ) => {
          const Icon = occ.icon;
          const isSelected = value === occ.id;
          return (
            <button
              key={occ.id}
              type="button"
              onClick={() => onChange(occ.id)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between h-28 ${
                isSelected
                  ? 'border-[var(--color-aura-primary)] bg-[var(--color-aura-lavender)] ring-2 ring-[var(--color-aura-primary)] shadow-sm'
                  : 'border-[var(--color-aura-border)] bg-[var(--color-aura-surface)] hover:border-[var(--color-aura-accent)] hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'bg-[var(--color-aura-primary)] text-white'
                      : 'bg-gray-100 text-[var(--color-aura-muted)] group-hover:text-[var(--color-aura-primary)]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-[var(--color-aura-primary)] animate-pulse" />
                )}
              </div>
              <div>
                <p className={`text-xs font-bold ${isSelected ? 'text-[var(--color-aura-primary)]' : 'text-[var(--color-aura-text)]'}`}>
                  {occ.label}
                </p>
                <p className="text-[10px] text-[var(--color-aura-muted)] line-clamp-1 mt-0.5">
                  {occ.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
