import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DiaryProvider } from './context/DiaryContext';
import LandingPage from './pages/public/LandingPage';
import DieterDashboard from './pages/user/Dashboard';
import NutritionistDashboard from './pages/nutritionist/NutritionistDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import Login from './pages/public/Login';
import Onboarding from './pages/public/Onboarding';
import ProtectedRoute from './components/common/ProtectedRoute';

// Helper component to scroll to top and update document title based on route
function PageHandler() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);

    switch (pathname) {
      case '/':
        document.title = 'NutriTrack — Mindful Nutrition & Editorial Wellness';
        break;
      case '/dashboard':
        document.title = 'Dieter Dashboard | NutriTrack';
        break;
      case '/onboarding':
        document.title = 'Personalized Onboarding | NutriTrack';
        break;
      case '/nutritionist':
        document.title = 'Nutritionist Suite | NutriTrack';
        break;
      case '/admin':
        document.title = 'Platform Governance | NutriTrack';
        break;
      case '/login':
        document.title = 'Sign In | NutriTrack';
        break;
      default:
        document.title = 'NutriTrack';
    }
  }, [pathname]);

  return null;
}

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <DiaryProvider>
        <BrowserRouter>
          <PageHandler />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            
            {/* Protected Dieter Routes */}
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute allowedRoles={['dieter']}>
                  <Onboarding />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['dieter']}>
                  <DieterDashboard />
                </ProtectedRoute>
              }
            />

            {/* Protected Nutritionist Routes */}
            <Route
              path="/nutritionist"
              element={
                <ProtectedRoute allowedRoles={['nutritionist']}>
                  <NutritionistDashboard />
                </ProtectedRoute>
              }
            />

            {/* Protected Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<LandingPage />} />
          </Routes>
        </BrowserRouter>
      </DiaryProvider>
    </AuthProvider>
  );
};

export default App;
