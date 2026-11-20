import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, User, Mail, Lock, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please provide your name.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
      // Successfully registered, navigate to Dashboard or Onboarding
      navigate('/');
    } catch (err) {
      console.error('Registration error:', err);
      let message = 'Failed to create account. Please try again.';
      if (err.response?.data?.detail) {
        if (typeof err.response.data.detail === 'string') {
          message = err.response.data.detail;
        } else if (Array.isArray(err.response.data.detail)) {
          message = err.response.data.detail.map((d) => d.msg || JSON.stringify(d)).join(', ');
        }
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-aura-page)] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--color-aura-primary)] text-white shadow-lg mb-4">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-[var(--color-aura-text)] font-[var(--font-heading)]">
          Join <span className="text-[var(--color-aura-primary)]">AURA</span>
        </h2>
        <p className="mt-2 text-sm text-[var(--color-aura-muted)]">
          Organize your wardrobe and unlock personalized AI outfit recommendations.
        </p>
      </div>

      {/* Form Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-[var(--color-aura-surface)] py-8 px-6 sm:px-10 shadow-sm rounded-2xl border border-[var(--color-aura-border)]">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start space-x-3 text-red-700 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-aura-muted)] mb-1.5">
                Full Name
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--color-aura-muted)]">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Rutuja Shinde"
                  required
                  className="block w-full pl-11 pr-4 py-2.5 rounded-xl border border-[var(--color-aura-border)] bg-[var(--color-aura-page)] focus:bg-[var(--color-aura-surface)] focus:border-[var(--color-aura-primary)] focus:ring-2 focus:ring-[var(--color-aura-primary)]/20 text-sm transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-aura-muted)] mb-1.5">
                Email address
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--color-aura-muted)]">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="block w-full pl-11 pr-4 py-2.5 rounded-xl border border-[var(--color-aura-border)] bg-[var(--color-aura-page)] focus:bg-[var(--color-aura-surface)] focus:border-[var(--color-aura-primary)] focus:ring-2 focus:ring-[var(--color-aura-primary)]/20 text-sm transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-aura-muted)] mb-1.5">
                Password (min 8 characters)
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--color-aura-muted)]">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  className="block w-full pl-11 pr-4 py-2.5 rounded-xl border border-[var(--color-aura-border)] bg-[var(--color-aura-page)] focus:bg-[var(--color-aura-surface)] focus:border-[var(--color-aura-primary)] focus:ring-2 focus:ring-[var(--color-aura-primary)]/20 text-sm transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-aura-muted)] mb-1.5">
                Confirm Password
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--color-aura-muted)]">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  className="block w-full pl-11 pr-4 py-2.5 rounded-xl border border-[var(--color-aura-border)] bg-[var(--color-aura-page)] focus:bg-[var(--color-aura-surface)] focus:border-[var(--color-aura-primary)] focus:ring-2 focus:ring-[var(--color-aura-primary)]/20 text-sm transition-all outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-[var(--color-aura-primary)] hover:bg-[var(--color-aura-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-aura-primary)]/40 disabled:opacity-50 transition-all cursor-pointer shadow-sm"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[var(--color-aura-border)] text-center text-sm text-[var(--color-aura-muted)]">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-[var(--color-aura-primary)] hover:text-[var(--color-aura-accent)] transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
