import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-aura-page)] flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-2xl bg-[var(--color-aura-lavender)] flex items-center justify-center text-[var(--color-aura-primary)] animate-pulse mb-4">
          <Sparkles className="w-6 h-6 animate-spin" />
        </div>
        <p className="text-sm font-medium text-[var(--color-aura-muted)]">Loading AURA...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
