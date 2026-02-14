import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuth } = useAuth();
  const location = useLocation();
  if (!isAuth) {
    const returnUrl = location.pathname + location.search;
    return <Navigate to={returnUrl ? `/login?returnUrl=${encodeURIComponent(returnUrl)}` : '/login'} replace />;
  }
  return <>{children}</>;
};


