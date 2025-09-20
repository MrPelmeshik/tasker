import React from 'react';
import styles from '../../../styles/home.module.css';
import { GlassWidget } from '../../../components/common/GlassWidget';

export const DeadlinesList: React.FC = () => {
  return (
    <GlassWidget title="DeadlinesList">
      <div className={styles.placeholder}>Здесь будут дедлайны</div>
    </GlassWidget>
  );
};


