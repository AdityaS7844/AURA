import React, { useState, useEffect } from 'react';
import { Sparkles, LogOut, User, Server, Database, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { checkHealth } from '../api/health';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [healthStatus, setHealthStatus] = useState(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const data = await checkHealth();
        setHealthStatus(data);
      } catch (err) {
        console.error('Health check failed:', err);
      }
    };
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
              <span className="text-xs ml-2 px-2.5 py-0.5 rounded-full bg-[var(--color-aura-lavender)] text-[var(--color-aura-primary)] font-medium">Dashboard</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-[var(--color-aura-muted)] bg-[var(--color-aura-page)] px-3 py-1.5 rounded-xl border border-[var(--color-aura-border)]">
              <User className="w-4 h-4 text-[var(--color-aura-primary)]" />
              <span className="font-medium text-[var(--color-aura-text)]">{user?.name}</span>
              <span className="text-xs bg-[var(--color-aura-lavender)] text-[var(--color-aura-primary)] px-2 py-0.5 rounded-full uppercase tracking-wider">{user?.role}</span>
            </div>
            <button
              onClick={logout}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-6 py-10 flex-1 w-full">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-[var(--color-aura-primary)] to-[var(--color-aura-accent)] rounded-3xl p-8 text-white shadow-lg mb-8">
          <div className="max-w-2xl">
            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold tracking-wide uppercase">
              Milestone 1 Complete
            </span>
            <h1 className="text-3xl md:text-4xl font-bold font-[var(--font-heading)] mt-4 mb-2">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-white/80 text-sm md:text-base">
              You are securely signed in with JWT authentication. Password hashing, session storage, and route protection are fully active.
            </p>
          </div>
        </div>

        {/* Status & Next Step Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Active Session Details */}
          <div className="bg-[var(--color-aura-surface)] p-6 rounded-2xl border border-[var(--color-aura-border)] shadow-xs">
            <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-[var(--color-aura-border)]">
              <div className="p-2 rounded-lg bg-[var(--color-aura-lavender)] text-[var(--color-aura-primary)]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-base font-[var(--font-heading)]">Authenticated User Session</h3>
                <p className="text-xs text-[var(--color-aura-muted)]">Verified against backend /api/v1/auth/me</p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-[var(--color-aura-muted)]">User ID</span>
                <span className="font-mono font-medium">#{user?.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-[var(--color-aura-muted)]">Email</span>
                <span className="font-medium">{user?.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-[var(--color-aura-muted)]">Account Role</span>
                <span className="font-medium capitalize">{user?.role}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[var(--color-aura-muted)]">Created At</span>
                <span className="text-xs text-[var(--color-aura-muted)]">
                  {user?.created_at ? new Date(user.created_at).toLocaleString() : 'Just now'}
                </span>
              </div>
            </div>
          </div>

          {/* Next Milestone Readiness */}
          <div className="bg-[var(--color-aura-surface)] p-6 rounded-2xl border border-[var(--color-aura-border)] shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-[var(--color-aura-border)]">
                <div className="p-2 rounded-lg bg-[var(--color-aura-lavender)] text-[var(--color-aura-primary)]">
                  <CheckCircle2 className="w-5 h-5 text-[var(--color-aura-success)]" />
                </div>
                <div>
                  <h3 className="font-semibold text-base font-[var(--font-heading)]">Next: Milestone 2</h3>
                  <p className="text-xs text-[var(--color-aura-muted)]">Preferences & Onboarding Wizard</p>
                </div>
              </div>

              <p className="text-sm text-[var(--color-aura-muted)] mb-4">
                With user authentication established, the next milestone implements the <code className="text-xs px-1.5 py-0.5 rounded bg-gray-100">preferences</code> table (1-to-1 with User), onboarding wizard (preferred styles, colors, home city), and profile settings.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--color-aura-page)] border border-[var(--color-aura-border)] flex items-center justify-between text-xs font-medium text-[var(--color-aura-primary)]">
              <span>Ready for M2 approval</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--color-aura-border)] py-6 text-center text-xs text-[var(--color-aura-muted)] bg-[var(--color-aura-surface)]">
        AURA Wardrobe System • Authenticated Session • React 19 + FastAPI + SQLite
      </footer>
    </div>
  );
}
