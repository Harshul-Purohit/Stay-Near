import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loader from '../ui/Loader';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader fullPage={true} />;
  }

  if (!user) {
    // Redirect to the correct login page based on the route being accessed
    const loginPath = location.pathname.startsWith('/admin') ? '/admin/login' : '/login';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // User is logged in but doesn't have the right role
    // Redirect to their respective dashboard
    let redirectPath = '/';
    if (user.role === 'student') redirectPath = '/student/dashboard';
    if (user.role === 'owner') redirectPath = '/owner/dashboard';
    if (user.role === 'admin') redirectPath = '/admin/dashboard';
    
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
