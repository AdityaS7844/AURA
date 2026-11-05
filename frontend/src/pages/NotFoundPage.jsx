import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, Shirt, Wand2, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[var(--color-aura-page)] flex items-center justify-center p-6 text-[var(--color-aura-text)]">
      <div className="max-w-md w-full bg-[var(--color-aura-surface)] rounded-3xl border border-[var(--color-aura-border)] p-8 sm:p-10 shadow-lg text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="relative mx-auto w-20 h-20">
          <div className="w-20 h-20 rounded-3xl bg-[var(--color-aura-lavender)] text-[var(--color-aura-primary)] flex items-center justify-center shadow-xs">
            <Compass className="w-10 h-10 animate-spin-slow" />
          </div>
          <span className="absolute -top-1 -right-1 px-2 py-0.5 rounded-full bg-[var(--color-aura-primary)] text-white text-[10px] font-extrabold uppercase tracking-wider">
            404
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold font-[var(--font-heading)]">
            Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-aura-muted)] leading-relaxed">
            The page you're searching for in your digital wardrobe doesn't seem to exist or has moved.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-[var(--color-aura-primary)] hover:bg-[var(--color-aura-accent)] text-white shadow-xs transition-colors flex items-center justify-center space-x-1.5"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/wardrobe"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold border border-[var(--color-aura-border)] hover:bg-gray-50 text-[var(--color-aura-text)] transition-colors flex items-center justify-center space-x-1.5"
          >
            <Shirt className="w-3.5 h-3.5" />
            <span>My Wardrobe</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
