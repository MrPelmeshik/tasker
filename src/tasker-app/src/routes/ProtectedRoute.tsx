import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../config/routes';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuth } = useAuth();
  const location = useLocation();
  if (!isAuth) {
    const returnUrl = location.pathname + location.search;
    return <Navigate to={returnUrl ? `${ROUTES.LOGIN}?returnUrl=${encodeURIComponent(returnUrl)}` : ROUTES.LOGIN} replace />;
  }
  return <>{children}</>;
};


