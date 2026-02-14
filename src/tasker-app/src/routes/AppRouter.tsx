import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import styles from '../styles/app-router.module.css';
import { ROUTES } from '../config/routes';
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
  const showHeader = location.pathname !== ROUTES.LOGIN;
  return (
    <div className={styles.layout}>
      {showHeader && <Header />}
      <div className={styles.content}>
        <div className={styles.routeOutlet}>
          <Routes>
            <Route path="/" element={<Navigate to={ROUTES.HOME} replace />} />
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />
            <Route path={`${ROUTES.AREA}/:id`} element={
              <ProtectedRoute>
                <TaskerPage />
              </ProtectedRoute>
            } />
            <Route path={`${ROUTES.FOLDER}/:id`} element={
              <ProtectedRoute>
                <TaskerPage />
              </ProtectedRoute>
            } />
            <Route path={`${ROUTES.TASK}/:id`} element={
              <ProtectedRoute>
                <TaskerPage />
              </ProtectedRoute>
            } />
            <Route path={ROUTES.HOME} element={
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


