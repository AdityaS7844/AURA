import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Shirt,
  Wand2,
  Calendar,
  BarChart3,
  CloudSun,
  ShieldCheck,
  ArrowRight,
  Check,
  Lock,
  Mail,
  User,
  Zap,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { loginApi, registerApi } from '../api/auth';

export default function LandingPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  // Tab: 'login' | 'signup'
  const [activeTab, setActiveTab] = useState('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const data = await loginApi({ email: loginEmail, password: loginPassword });
      login(data.user, data.access_token);
      navigate('/');
    } catch (err) {
      setLoginError(err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setSignupError('');

    if (signupPassword.length < 8) {
      setSignupError('Password must be at least 8 characters long');
      return;
    }

    setSignupLoading(true);
    try {
      const data = await registerApi({
        name: signupName,
        email: signupEmail,
        password: signupPassword,
      });
      login(data.user, data.access_token);
      navigate('/onboarding');
    } catch (err) {
      setSignupError(err.response?.data?.detail || 'Failed to create account');
    } finally {
      setSignupLoading(false);
    }
  };

  const handleFillDemo = async () => {
    setLoginEmail('demo@wardrobe.com');
    setLoginPassword('demo12345');
    setLoginLoading(true);
    setLoginError('');
    try {
      const data = await loginApi({ email: 'demo@wardrobe.com', password: 'demo12345' });
      login(data.user, data.access_token);
      navigate('/');
    } catch (err) {
      setLoginError('Demo login failed. Please ensure the backend is running.');
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-aura-page)] text-[var(--color-aura-text)] flex flex-col selection:bg-[var(--color-aura-lavender)] selection:text-[var(--color-aura-primary)]">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-[var(--color-aura-surface)]/90 backdrop-blur-md border-b border-[var(--color-aura-border)] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--color-aura-primary)] flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-[var(--color-aura-primary)] font-[var(--font-heading)]">
                AURA
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-bold uppercase tracking-widest text-[var(--color-aura-muted)] bg-gray-100 px-2 py-0.5 rounded-full">
                AI Smart Wardrobe
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4">
            {user ? (
              <Link
                to="/"
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[var(--color-aura-primary)] hover:bg-[var(--color-aura-accent)] transition-all shadow-xs flex items-center space-x-1.5"
              >
                <span>Enter Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <button
                onClick={handleFillDemo}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[var(--color-aura-primary)] bg-[var(--color-aura-lavender)] hover:bg-indigo-100 transition-all flex items-center space-x-1.5 cursor-pointer shadow-2xs"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>1-Click Demo Login</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section with Integrated Login */}
      <section className="relative overflow-hidden py-12 sm:py-16 md:py-20 px-6 max-w-7xl mx-auto w-full">
        {/* Subtle decorative glow */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--color-aura-lavender)]/50 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-100/40 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Pitch (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[var(--color-aura-lavender)] text-[var(--color-aura-primary)] text-xs font-bold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Gen Wardrobe Assistant • Powered by Google Gemini AI</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-[var(--font-heading)] leading-[1.12]">
              Never wonder what to wear again.
            </h1>

            <p className="text-base sm:text-lg text-[var(--color-aura-muted)] max-w-xl leading-relaxed">
              Digitize your closet, check live weather, and let Google Gemini 3 Flash build stylish outfit combinations
              strictly from clothes you already own.
            </p>

            {/* Value bullets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-center space-x-2.5 text-xs font-medium text-[var(--color-aura-text)]">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span>Zero invented clothes — real items only</span>
              </div>
              <div className="flex items-center space-x-2.5 text-xs font-medium text-[var(--color-aura-text)]">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span>Live Open-Meteo weather intelligence</span>
              </div>
              <div className="flex items-center space-x-2.5 text-xs font-medium text-[var(--color-aura-text)]">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span>Wear tracking & forgotten gems spotlight</span>
              </div>
              <div className="flex items-center space-x-2.5 text-xs font-medium text-[var(--color-aura-text)]">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span>Interactive weekly outfit calendar</span>
              </div>
            </div>

            {/* Quick Demo CTA */}
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <button
                onClick={handleFillDemo}
                className="px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-bold bg-[var(--color-aura-primary)] hover:bg-[var(--color-aura-accent)] text-white shadow-md transition-all flex items-center space-x-2 cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>Try Demo Wardrobe (Instant Access)</span>
              </button>
              <span className="text-xs text-[var(--color-aura-muted)]">No credit card or setup needed</span>
            </div>
          </div>

          {/* Right Hero Integrated Login / Sign Up Panel (5 cols) */}
          <div className="lg:col-span-5">
            <div className="bg-[var(--color-aura-surface)] rounded-3xl border border-[var(--color-aura-border)] shadow-xl p-6 sm:p-8 relative">
              {/* Tabs */}
              <div className="flex p-1 rounded-2xl bg-gray-100 mb-6">
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    activeTab === 'login'
                      ? 'bg-white text-[var(--color-aura-primary)] shadow-xs'
                      : 'text-[var(--color-aura-muted)] hover:text-[var(--color-aura-text)]'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('signup')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    activeTab === 'signup'
                      ? 'bg-white text-[var(--color-aura-primary)] shadow-xs'
                      : 'text-[var(--color-aura-muted)] hover:text-[var(--color-aura-text)]'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {activeTab === 'login' ? (
                /* Login Form */
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <h2 className="text-lg font-bold font-[var(--font-heading)]">Sign In to Your Wardrobe</h2>
                    <p className="text-xs text-[var(--color-aura-muted)] mt-0.5">
                      Enter your email and password to access your styled closet.
                    </p>
                  </div>

                  {loginError && (
                    <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
                      {loginError}
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="hero-email"
                      className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-aura-muted)] mb-1.5"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                      <input
                        id="hero-email"
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-aura-border)] bg-[var(--color-aura-page)] focus:bg-white focus:border-[var(--color-aura-primary)] text-xs outline-none transition-all focus-visible:ring-2 focus-visible:ring-[var(--color-aura-primary)]/20"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        htmlFor="hero-password"
                        className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-aura-muted)]"
                      >
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setLoginEmail('demo@wardrobe.com');
                          setLoginPassword('demo12345');
                        }}
                        className="text-[11px] font-semibold text-[var(--color-aura-primary)] hover:underline cursor-pointer"
                      >
                        Fill Demo
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                      <input
                        id="hero-password"
                        type="password"
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-aura-border)] bg-[var(--color-aura-page)] focus:bg-white focus:border-[var(--color-aura-primary)] text-xs outline-none transition-all focus-visible:ring-2 focus-visible:ring-[var(--color-aura-primary)]/20"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-[var(--color-aura-primary)] hover:bg-[var(--color-aura-accent)] transition-all shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {loginLoading ? 'Signing In...' : 'Sign In'}
                  </button>
                </form>
              ) : (
                /* Signup Form */
                <form onSubmit={handleSignupSubmit} className="space-y-4">
                  <div>
                    <h2 className="text-lg font-bold font-[var(--font-heading)]">Create Your Free Account</h2>
                    <p className="text-xs text-[var(--color-aura-muted)] mt-0.5">
                      Start styling your wardrobe with Gemini AI today.
                    </p>
                  </div>

                  {signupError && (
                    <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
                      {signupError}
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="signup-name"
                      className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-aura-muted)] mb-1.5"
                    >
                      Your Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                      <input
                        id="signup-name"
                        type="text"
                        required
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        placeholder="Alex Morgan"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-aura-border)] bg-[var(--color-aura-page)] focus:bg-white focus:border-[var(--color-aura-primary)] text-xs outline-none transition-all focus-visible:ring-2 focus-visible:ring-[var(--color-aura-primary)]/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="signup-email"
                      className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-aura-muted)] mb-1.5"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                      <input
                        id="signup-email"
                        type="email"
                        required
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-aura-border)] bg-[var(--color-aura-page)] focus:bg-white focus:border-[var(--color-aura-primary)] text-xs outline-none transition-all focus-visible:ring-2 focus-visible:ring-[var(--color-aura-primary)]/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="signup-password"
                      className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-aura-muted)] mb-1.5"
                    >
                      Password (min 8 characters)
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                      <input
                        id="signup-password"
                        type="password"
                        required
                        minLength={8}
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-aura-border)] bg-[var(--color-aura-page)] focus:bg-white focus:border-[var(--color-aura-primary)] text-xs outline-none transition-all focus-visible:ring-2 focus-visible:ring-[var(--color-aura-primary)]/20"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={signupLoading}
                    className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-[var(--color-aura-primary)] hover:bg-[var(--color-aura-accent)] transition-all shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {signupLoading ? 'Creating Account...' : 'Get Started'}
                  </button>
                </form>
              )}

              {/* Demo button inside card */}
              <div className="mt-4 pt-4 border-t border-[var(--color-aura-border)] text-center">
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="w-full py-2 rounded-xl text-xs font-semibold border border-[var(--color-aura-border)] hover:bg-gray-50 text-[var(--color-aura-muted)] hover:text-[var(--color-aura-text)] transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Explore Demo Wardrobe Directly</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-16 px-6 bg-[var(--color-aura-surface)] border-y border-[var(--color-aura-border)]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-aura-primary)]">
              Core Capabilities
            </span>
            <h2 className="text-3xl font-extrabold font-[var(--font-heading)]">
              Designed for effortless daily styling
            </h2>
            <p className="text-sm text-[var(--color-aura-muted)]">
              From individual clothing attributes to complete weather-adapted ensembles, AURA streamlines your personal style.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="p-6 rounded-3xl bg-[var(--color-aura-page)] border border-[var(--color-aura-border)] hover:border-[var(--color-aura-primary)] transition-all space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[var(--color-aura-lavender)] text-[var(--color-aura-primary)] flex items-center justify-center shadow-2xs">
                <Wand2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold font-[var(--font-heading)]">AI Stylist Engine</h3>
              <p className="text-xs text-[var(--color-aura-muted)] leading-relaxed">
                Google Gemini 3 Flash combines your tops, bottoms, and accessories for 8 occasions with strict database validation.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-3xl bg-[var(--color-aura-page)] border border-[var(--color-aura-border)] hover:border-[var(--color-aura-primary)] transition-all space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-2xs">
                <CloudSun className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold font-[var(--font-heading)]">Live Weather Adaptation</h3>
              <p className="text-xs text-[var(--color-aura-muted)] leading-relaxed">
                Real-time Open-Meteo forecasts ensure your outfits adapt to rain, humidity, summer heat, or winter chills.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-3xl bg-[var(--color-aura-page)] border border-[var(--color-aura-border)] hover:border-[var(--color-aura-primary)] transition-all space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-2xs">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold font-[var(--font-heading)]">Weekly Outfit Planner</h3>
              <p className="text-xs text-[var(--color-aura-muted)] leading-relaxed">
                Schedule your styled outfits for Monday through Sunday. Never scramble in the morning again.
              </p>
            </div>

            {/* Card 4 */}
            <div className="p-6 rounded-3xl bg-[var(--color-aura-page)] border border-[var(--color-aura-border)] hover:border-[var(--color-aura-primary)] transition-all space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-2xs">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold font-[var(--font-heading)]">Wear Analytics & Gems</h3>
              <p className="text-xs text-[var(--color-aura-muted)] leading-relaxed">
                Track wear counts and spotlight "Forgotten Gems" — items in your wardrobe that have never been worn yet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-[var(--color-aura-border)] py-8 px-6 bg-[var(--color-aura-surface)]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--color-aura-muted)]">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-[var(--color-aura-primary)]" />
            <span className="font-bold text-[var(--color-aura-text)]">AURA Smart Wardrobe</span>
            <span>• Powered by Google Gemini AI & SQLite</span>
          </div>
          <div>
            <span>Desktop-first responsive design • Milestone 10 Complete</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
