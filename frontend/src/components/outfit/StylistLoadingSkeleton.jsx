import React, { useState, useEffect } from 'react';
import { Sparkles, CloudSun, Palette, Layers, CheckCircle2 } from 'lucide-react';

const LOADING_STEPS = [
  { icon: CloudSun, text: 'Factoring in live temperature and forecast...' },
  { icon: Palette, text: 'Evaluating color harmonies and your palette preferences...' },
  { icon: Layers, text: 'Matching tops, bottoms, outerwear, and footwear...' },
  { icon: Sparkles, text: 'Styling complete outfits with Google Gemini...' },
];

export default function StylistLoadingSkeleton() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev + 1) % LOADING_STEPS.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  const CurrentIcon = LOADING_STEPS[currentStepIndex].icon;

  return (
    <div className="space-y-8 py-8 animate-in fade-in duration-300">
      {/* Central Spinner & Status Badge */}
      <div className="max-w-md mx-auto text-center space-y-4">
        <div className="relative w-20 h-20 mx-auto">
          <div className="absolute inset-0 rounded-3xl bg-[var(--color-aura-primary)]/20 animate-ping" />
          <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-[var(--color-aura-primary)] to-[var(--color-aura-accent)] text-white flex items-center justify-center shadow-xl">
            <CurrentIcon className="w-9 h-9 animate-bounce" />
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold text-[var(--color-aura-text)] font-[var(--font-heading)] flex items-center justify-center gap-2">
            Styling with Gemini AI
            <Sparkles className="w-5 h-5 text-[var(--color-aura-accent)] animate-spin" />
          </h3>
          <p className="text-xs text-[var(--color-aura-muted)] mt-1.5 h-5 font-medium transition-all duration-300">
            {LOADING_STEPS[currentStepIndex].text}
          </p>
        </div>
      </div>

      {/* Pulsing Skeleton Outfit Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className="rounded-3xl border border-[var(--color-aura-border)] bg-[var(--color-aura-surface)] p-6 space-y-5 animate-pulse"
          >
            {/* Header Placeholder */}
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-5 w-40 bg-gray-200 rounded-lg" />
                <div className="h-3 w-24 bg-gray-100 rounded-md" />
              </div>
              <div className="h-7 w-20 bg-gray-200 rounded-full" />
            </div>

            {/* Collage Placeholder */}
            <div className="grid grid-cols-3 gap-3 h-44">
              <div className="h-full bg-gray-200 rounded-2xl" />
              <div className="h-full bg-gray-200 rounded-2xl" />
              <div className="h-full bg-gray-200 rounded-2xl" />
            </div>

            {/* Reason Placeholder */}
            <div className="space-y-2 bg-[var(--color-aura-page)] p-3 rounded-2xl border border-[var(--color-aura-border)]">
              <div className="h-3 w-full bg-gray-200 rounded-md" />
              <div className="h-3 w-4/5 bg-gray-200 rounded-md" />
            </div>

            {/* Footer Placeholder */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex space-x-2">
                <div className="h-8 w-8 bg-gray-200 rounded-xl" />
                <div className="h-8 w-8 bg-gray-200 rounded-xl" />
              </div>
              <div className="h-8 w-28 bg-gray-200 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
