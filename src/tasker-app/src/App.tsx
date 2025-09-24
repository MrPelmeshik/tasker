import React from 'react';
import css from './styles/App.module.css';
import { AppRouter } from './routes/AppRouter';
import { AnimatedBackground } from './components/common/AnimatedBackground';
import { ModalProvider } from './context/ModalContext';

export const App = () => {
  return (
    <ModalProvider>
      <div className={css.main}>
        <AnimatedBackground />
        <AppRouter />
      </div>
    </ModalProvider>
  );
}
