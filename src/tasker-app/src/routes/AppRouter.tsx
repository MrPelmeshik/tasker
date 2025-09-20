import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TaskerPage } from '../pages/TaskerPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { Header } from '../components/common/Header';

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <div>
        <Header />
        <div>
          <Routes>
            <Route path="/" element={<NotFoundPage />} />
            <Route path="/tasker" element={<TaskerPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
};


