import React from 'react';
import { useTaskUpdate } from '../../context';
import { GlassButton } from '../ui/GlassButton';
import styles from '../../styles/realtime-banner.module.css';

/**
 * Баннер при недоступности real-time обновлений (WebSocket).
 * Показывает сообщение и кнопку принудительного обновления.
 */
export const RealtimeBanner: React.FC = React.memo(() => {
  const { realtimeUnavailable, forceRefresh } = useTaskUpdate();
  if (!realtimeUnavailable) return null;

  return (
    <div className={styles.banner} role="status">
      <span className={styles.text}>
        Обновления в реальном времени недоступны. Используйте кнопку обновления для актуализации данных.
      </span>
      <GlassButton size="s" onClick={forceRefresh}>
        Обновить
      </GlassButton>
    </div>
  );
});
