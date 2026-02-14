import React from 'react';
import styles from '../styles/not-found-page.module.css';
import { GlassButton } from '../components/ui/GlassButton';
import { ROUTES } from '../config/routes';

export const NotFoundPage: React.FC = () => {
  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>Страница не найдена</h3>
      <GlassButton size="m" onClick={() => window.location.assign(ROUTES.HOME)}>
        Перейти на главную
      </GlassButton>
    </div>
  );
};


