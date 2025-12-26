import React from 'react';
import css from './styles/App.module.css';
import { AppRouter } from './routes/AppRouter';
import { AnimatedBackground } from './components/common/AnimatedBackground';
import { ModalProvider, TaskUpdateProvider } from './context';

export const App = () => {
  return (
    <TaskUpdateProvider>
      <ModalProvider>
        <div className={css.main}>
          <AnimatedBackground />
          <AppRouter />
        </div>
      </ModalProvider>
    </TaskUpdateProvider>
  );
}
