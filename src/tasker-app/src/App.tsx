import React from 'react';
import css from './styles/App.module.css';
import { AppRouter } from './routes/AppRouter';
import { AnimatedBackground } from './components/common/AnimatedBackground';
import { ToastViewer } from './components/common/ToastViewer';
import { ModalProvider, TaskUpdateProvider, ThemeProvider, ToastProvider } from './context';

export const App = () => {
  return (
    <ThemeProvider>
      <TaskUpdateProvider>
        <ToastProvider>
          <ModalProvider>
            <div className={css.main}>
              <AnimatedBackground />
              <AppRouter />
            </div>
            <ToastViewer />
          </ModalProvider>
        </ToastProvider>
      </TaskUpdateProvider>
    </ThemeProvider>
  );
}
