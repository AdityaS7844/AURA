import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Sparkles, LayoutDashboard, Shirt, Wand2, Calendar, Bookmark, BarChart3, User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', to: '/', icon: LayoutDashboard },
    { name: 'My Wardrobe', to: '/wardrobe', icon: Shirt },
    { name: 'AI Stylist', to: '/stylist', icon: Wand2 },
    { name: 'Outfit Planner', to: '/planner', icon: Calendar },
    { name: 'Saved Outfits', to: '/saved', icon: Bookmark },
    { name: 'Insights', to: '/insights', icon: BarChart3 },
    { name: 'Profile & Settings', to: '/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-aura-page)] text-[var(--color-aura-text)] flex flex-col md:flex-row">
      {/* Desktop Sidebar (Fixed Left) */}
      <aside className="hidden md:flex flex-col w-64 bg-[var(--color-aura-surface)] border-r border-[var(--color-aura-border)] fixed inset-y-0 z-30">
        {/* Brand Header */}
        <div className="p-6 border-b border-[var(--color-aura-border)] flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-aura-primary)] flex items-center justify-center text-white shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-2xl font-bold tracking-tight text-[var(--color-aura-primary)] font-[var(--font-heading)]">AURA</span>
            <p className="text-[10px] text-[var(--color-aura-muted)] font-medium uppercase tracking-wider">Smart Wardrobe</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[var(--color-aura-lavender)] text-[var(--color-aura-primary)] shadow-2xs'
                      : 'text-[var(--color-aura-muted)] hover:text-[var(--color-aura-text)] hover:bg-gray-100'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 uppercase">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Card & Logout in Sidebar Footer */}
        <div className="p-4 border-t border-[var(--color-aura-border)]">
          <div className="flex items-center justify-between p-2 rounded-xl bg-[var(--color-aura-page)] border border-[var(--color-aura-border)] mb-2">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-[var(--color-aura-lavender)] text-[var(--color-aura-primary)] flex items-center justify-center font-bold text-xs shrink-0">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold truncate text-[var(--color-aura-text)]">{user?.name}</p>
                <p className="text-[10px] text-[var(--color-aura-muted)] truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden bg-[var(--color-aura-surface)] border-b border-[var(--color-aura-border)] px-4 py-3 sticky top-0 z-40 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-aura-primary)] text-white flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-xl font-bold text-[var(--color-aura-primary)] font-[var(--font-heading)]">AURA</span>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl text-[var(--color-aura-muted)] hover:text-[var(--color-aura-text)] hover:bg-gray-100"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Dropdown Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[var(--color-aura-surface)] border-b border-[var(--color-aura-border)] p-4 space-y-2 sticky top-[57px] z-30 shadow-lg">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                    isActive
                      ? 'bg-[var(--color-aura-lavender)] text-[var(--color-aura-primary)]'
                      : 'text-[var(--color-aura-muted)]'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
          <div className="pt-2 border-t border-[var(--color-aura-border)] flex items-center justify-between">
            <span className="text-xs text-[var(--color-aura-muted)]">{user?.email}</span>
            <button
              onClick={logout}
              className="text-xs font-medium text-red-600 flex items-center space-x-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area (Offset by desktop sidebar width 16rem / 64) */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <div className="flex-1">{children}</div>
      </main>
    </div>
  );
}
