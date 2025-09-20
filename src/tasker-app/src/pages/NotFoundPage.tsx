import React from 'react';
import styles from '../styles/home.module.css';

export const NotFoundPage: React.FC = () => {
  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>Страница не найдена</h3>
      <button
        className={styles.placeholder}
        style={{ cursor: 'pointer', background: 'none', border: '1px dashed #333', borderRadius: 8, padding: 16, color: '#aaa', fontSize: 16 }}
        onClick={() => window.location.href = '/tasker'}
      >
        Перейти на /tasker
      </button>
    </div>
  );
};


