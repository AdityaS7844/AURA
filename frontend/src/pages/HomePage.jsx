import React, { useState, useEffect } from 'react';
import { Sparkles, Server, CheckCircle2, AlertCircle, RefreshCw, Database, Palette, ShieldCheck } from 'lucide-react';
import { checkHealth } from '../api/health';

export default function HomePage() {
  const [healthStatus, setHealthStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await checkHealth();
      setHealthStatus(data);
      setLastChecked(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Health check failed:', err);
      setError(err.message || 'Failed to reach backend API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-aura-page)] text-[var(--color-aura-text)] flex flex-col justify-between">
      {/* Top Navigation Bar */}
      <header className="bg-[var(--color-aura-surface)] border-b border-[var(--color-aura-border)] px-8 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-aura-primary)] flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-2xl font-bold tracking-tight text-[var(--color-aura-primary)] font-[var(--font-heading)]">AURA</span>
              <span className="text-xs ml-2 px-2 py-0.5 rounded-full bg-[var(--color-aura-lavender)] text-[var(--color-aura-primary)] font-medium">M0 — Setup</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-[var(--color-aura-primary)] hover:text-[var(--color-aura-accent)] transition-colors"
            >
              Swagger Docs →
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-6 py-12 flex-1 w-full">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[var(--color-aura-lavender)] text-[var(--color-aura-primary)] text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            <span>AI Personalized Wardrobe</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-[var(--font-heading)] text-[var(--color-aura-text)] mb-3">
            Your wardrobe. Your identity. <span className="text-[var(--color-aura-primary)]">Reimagined.</span>
          </h1>
          <p className="text-[var(--color-aura-muted)] text-lg max-w-xl mx-auto">
            Milestone 0: Project architecture, FastAPI backend, SQLite connection, Tailwind CSS v4, and React frontend initialized.
          </p>
        </div>

        {/* Backend Health Verification Card */}
        <div className="bg-[var(--color-aura-surface)] rounded-2xl p-6 md:p-8 border border-[var(--color-aura-border)] shadow-sm mb-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--color-aura-border)]">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-lg bg-[var(--color-aura-lavender)] text-[var(--color-aura-primary)]">
                <Server className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold font-[var(--font-heading)]">Backend Health Check</h2>
                <p className="text-xs text-[var(--color-aura-muted)]">Endpoint: GET /api/v1/health (and /health)</p>
              </div>
            </div>

            <button
              onClick={fetchHealth}
              disabled={loading}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-[var(--color-aura-primary)] text-white hover:bg-[var(--color-aura-accent)] disabled:opacity-50 transition-colors text-sm font-medium cursor-pointer shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Re-check</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[var(--color-aura-page)] border border-[var(--color-aura-border)] flex items-start space-x-3">
              {loading ? (
                <div className="w-5 h-5 rounded-full border-2 border-[var(--color-aura-primary)] border-t-transparent animate-spin mt-0.5" />
              ) : healthStatus?.status === 'ok' ? (
                <CheckCircle2 className="w-5 h-5 text-[var(--color-aura-success)] mt-0.5 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-[var(--color-aura-error)] mt-0.5 shrink-0" />
              )}
              <div>
                <div className="text-sm font-semibold">Service Status</div>
                <div className="text-xs text-[var(--color-aura-muted)] mt-0.5">
                  {loading ? 'Querying backend...' : healthStatus?.status === 'ok' ? (
                    <span className="text-[var(--color-aura-success)] font-medium">Online (status: ok)</span>
                  ) : (
                    <span className="text-[var(--color-aura-error)]">{error || 'Offline'}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[var(--color-aura-page)] border border-[var(--color-aura-border)] flex items-start space-x-3">
              <Database className="w-5 h-5 text-[var(--color-aura-primary)] mt-0.5 shrink-0" />
              <div>
                <div className="text-sm font-semibold">SQLite Database Engine</div>
                <div className="text-xs text-[var(--color-aura-muted)] mt-0.5">
                  Configured with PRAGMA foreign_keys=ON
                </div>
              </div>
            </div>
          </div>

          {lastChecked && (
            <div className="mt-4 text-xs text-right text-[var(--color-aura-muted)]">
              Last checked: {lastChecked}
            </div>
          )}
        </div>

        {/* Design System & Tech Verification Checklist */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-[var(--color-aura-surface)] border border-[var(--color-aura-border)] shadow-xs">
            <div className="flex items-center space-x-2 text-[var(--color-aura-primary)] mb-2">
              <Palette className="w-5 h-5" />
              <span className="font-semibold text-sm">AURA Design System</span>
            </div>
            <p className="text-xs text-[var(--color-aura-muted)] mb-3">
              Tailwind CSS v4 with custom theme tokens (#4B2E9E, #7355CF, #EAE3FF).
            </p>
            <div className="flex space-x-2">
              <span className="w-6 h-6 rounded-md bg-[var(--color-aura-primary)] border border-black/10 inline-block" title="Primary (#4B2E9E)"></span>
              <span className="w-6 h-6 rounded-md bg-[var(--color-aura-accent)] border border-black/10 inline-block" title="Accent (#7355CF)"></span>
              <span className="w-6 h-6 rounded-md bg-[var(--color-aura-lavender)] border border-black/10 inline-block" title="Lavender (#EAE3FF)"></span>
              <span className="w-6 h-6 rounded-md bg-[var(--color-aura-page)] border border-black/10 inline-block" title="Page (#F7F5FC)"></span>
              <span className="w-6 h-6 rounded-md bg-[var(--color-aura-text)] border border-black/10 inline-block" title="Text (#211B2D)"></span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[var(--color-aura-surface)] border border-[var(--color-aura-border)] shadow-xs">
            <div className="flex items-center space-x-2 text-[var(--color-aura-primary)] mb-2">
              <ShieldCheck className="w-5 h-5" />
              <span className="font-semibold text-sm">CORS & Security</span>
            </div>
            <p className="text-xs text-[var(--color-aura-muted)]">
              FastAPI configured with CORS allowed origin for Vite dev server (localhost:5173).
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[var(--color-aura-surface)] border border-[var(--color-aura-border)] shadow-xs">
            <div className="flex items-center space-x-2 text-[var(--color-aura-primary)] mb-2">
              <CheckCircle2 className="w-5 h-5 text-[var(--color-aura-success)]" />
              <span className="font-semibold text-sm">M0 Ready</span>
            </div>
            <p className="text-xs text-[var(--color-aura-muted)]">
              Ready for Milestone 1 (Auth: users table, register, login, JWT).
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--color-aura-border)] py-6 text-center text-xs text-[var(--color-aura-muted)] bg-[var(--color-aura-surface)]">
        AURA Wardrobe System • React 19 + Vite + Tailwind v4 + FastAPI + SQLite
      </footer>
    </div>
  );
}
