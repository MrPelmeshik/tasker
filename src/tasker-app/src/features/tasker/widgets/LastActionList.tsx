import React from 'react';
import styles from '../../../styles/home.module.css';
import { GlassWidget } from '../../../components/common/GlassWidget';

export const LastActionList: React.FC = () => {
  return (
    <GlassWidget title="LastActionList">
      <div className={styles.placeholder}>Здесь будет список последних действий</div>
    </GlassWidget>
  );
};


