import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { TaskerPage } from '../pages/TaskerPage';
import { LoginPage } from '../pages/LoginPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { Header } from '../components/common/Header';
import { ProtectedRoute } from './ProtectedRoute';

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <RouterContent />
    </BrowserRouter>
  );
};

const RouterContent: React.FC = () => {
  const location = useLocation();
  const showHeader = location.pathname !== '/login';
  return (
    <div>
      {showHeader && <Header />}
      <div>
        <Routes>
          <Route path="/" element={<Navigate to="/tasker" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/tasker" element={
            <ProtectedRoute>
              <TaskerPage />
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </div>
  );
};


