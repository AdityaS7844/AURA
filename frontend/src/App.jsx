import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
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

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected Application Routes */}
          <Route
            path="/"
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

          {/* Wardrobe Routes (Milestone 4) */}
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

          {/* Stylist Routes (Milestone 7) */}
          <Route
            path="/stylist"
            element={
              <ProtectedRoute>
                <StylistPage />
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

          {/* Fallback Catch-all Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
