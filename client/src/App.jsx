import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { CompareProvider } from './context/CompareContext';
import { WishlistProvider } from './context/WishlistContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Loader from './components/ui/Loader';

// Pages - Lazy loaded
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const HostelDetailsPage = lazy(() => import('./pages/HostelDetailsPage'));
const ComparePage = lazy(() => import('./pages/ComparePage'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const OwnerDashboard = lazy(() => import('./pages/OwnerDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'));

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <WishlistProvider>
          <CompareProvider>
            <Router>
              <div className="flex flex-col" style={{ minHeight: '100vh' }}>
                <Navbar />
                <main className="flex-1">
                  <Suspense fallback={<Loader fullPage={true} />}>
                    <Routes>
                      {/* Public Discovery Routes */}
                      <Route path="/" element={<LandingPage />} />
                      <Route path="/search" element={<SearchPage />} />
                      <Route path="/hostel/:id" element={<HostelDetailsPage />} />
                      <Route path="/compare" element={<ComparePage />} />

                      {/* Auth Routes */}
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/signup" element={<SignupPage />} />
                      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
                      <Route path="/admin/login" element={<AdminLoginPage />} />

                      {/* Dashboards */}
                      <Route element={<ProtectedRoute allowedRoles={['student']} />}>
                        <Route path="/student/dashboard" element={<StudentDashboard />} />
                      </Route>

                      <Route element={<ProtectedRoute allowedRoles={['owner']} />}>
                        <Route path="/owner/dashboard" element={<OwnerDashboard />} />
                      </Route>

                      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                        <Route path="/admin/dashboard" element={<AdminDashboard />} />
                      </Route>
                    </Routes>
                  </Suspense>
                </main>
                <Footer />
              </div>
            </Router>
          </CompareProvider>
        </WishlistProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
