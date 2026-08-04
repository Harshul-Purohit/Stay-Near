import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { CompareProvider } from './context/CompareContext';
import { WishlistProvider } from './context/WishlistContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import LandingPage from './pages/LandingPage';
import SearchPage from './pages/SearchPage';
import HostelDetailsPage from './pages/HostelDetailsPage';
import ComparePage from './pages/ComparePage';
import StudentDashboard from './pages/StudentDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminLoginPage from './pages/AdminLoginPage';

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
