import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import styles from '../styles/app-router.module.css';
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
    <div className={styles.layout}>
      {showHeader && <Header />}
      <div className={styles.content}>
        <div className={styles.routeOutlet}>
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
    </div>
  );
};


