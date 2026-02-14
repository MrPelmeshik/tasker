import React from 'react';
import css from './styles/App.module.css';
import { AppRouter } from './routes/AppRouter';
import { AnimatedBackground } from './components/common/AnimatedBackground';
import { ToastViewer } from './components/common/ToastViewer';
import { AuthToastListener } from './components/common/AuthToastListener';
import { RealtimeToastListener } from './components/common/RealtimeToastListener';
import { ModalProvider, TaskUpdateProvider, ThemeProvider, ToastProvider } from './context';

export const App = () => {
  return (
    <ThemeProvider>
      <TaskUpdateProvider>
        <ToastProvider>
          <AuthToastListener />
          <RealtimeToastListener />
          <ModalProvider>
            <div className={css.appLayout}>
              <div className={css.main}>
                <AnimatedBackground />
                <AppRouter />
              </div>
              <ToastViewer />
            </div>
          </ModalProvider>
        </ToastProvider>
      </TaskUpdateProvider>
    </ThemeProvider>
  );
}
