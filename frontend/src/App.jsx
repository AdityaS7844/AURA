import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import WardrobePage from './pages/WardrobePage';
import AddEditItemPage from './pages/AddEditItemPage';
import ItemDetailPage from './pages/ItemDetailPage';
import StylistPage from './pages/StylistPage';
import SavedOutfitsPage from './pages/SavedOutfitsPage';
import InsightsPage from './pages/InsightsPage';
import PlannerPage from './pages/PlannerPage';
import NotFoundPage from './pages/NotFoundPage';
import { Sparkles } from 'lucide-react';

function HomeRoute() {
  const { isAuthenticated, loading } = useAuth();
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
  return isAuthenticated ? <DashboardPage /> : <LandingPage />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Dynamic Root Route: Landing Page with Login for visitors, Dashboard for logged-in users */}
            <Route path="/" element={<HomeRoute />} />

            {/* Public Landing & Authentication Routes */}
            <Route path="/welcome" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Protected Core Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <OnboardingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Wardrobe Routes (Milestones 3, 4, 5) */}
            <Route
              path="/wardrobe"
              element={
                <ProtectedRoute>
                  <WardrobePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wardrobe/add"
              element={
                <ProtectedRoute>
                  <AddEditItemPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wardrobe/edit/:id"
              element={
                <ProtectedRoute>
                  <AddEditItemPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wardrobe/:id"
              element={
                <ProtectedRoute>
                  <ItemDetailPage />
                </ProtectedRoute>
              }
            />

            {/* AI Stylist Routes (Milestone 7) */}
            <Route
              path="/stylist"
              element={
                <ProtectedRoute>
                  <StylistPage />
                </ProtectedRoute>
              }
            />

            {/* Calendar Outfit Planner Routes (Milestone 10) */}
            <Route
              path="/planner"
              element={
                <ProtectedRoute>
                  <PlannerPage />
                </ProtectedRoute>
              }
            />

            {/* Saved Outfits Routes (Milestone 8) */}
            <Route
              path="/saved"
              element={
                <ProtectedRoute>
                  <SavedOutfitsPage />
                </ProtectedRoute>
              }
            />

            {/* Insights Routes (Milestone 9) */}
            <Route
              path="/insights"
              element={
                <ProtectedRoute>
                  <InsightsPage />
                </ProtectedRoute>
              }
            />

            {/* 404 Not Found Catch-All Route (Milestone 10) */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
