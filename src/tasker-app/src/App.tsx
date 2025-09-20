import React from 'react';
import css from './App.module.css';
import { AppRouter } from './routes/AppRouter';
import { AnimatedBackground } from './components/common/AnimatedBackground';

export const App = () => {
  return <div className={css.main}>
    <AnimatedBackground />
    <AppRouter />
  </div>;
}
