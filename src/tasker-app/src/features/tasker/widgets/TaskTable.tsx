import React from 'react';
import styles from '../../../styles/home.module.css';
import { GlassWidget } from '../../../components/common/GlassWidget';

export const TaskTable: React.FC = () => {
  return (
    <GlassWidget title="TaskTable">
      <div className={styles.placeholder}>Здесь будет таблица задач</div>
    </GlassWidget>
  );
};


