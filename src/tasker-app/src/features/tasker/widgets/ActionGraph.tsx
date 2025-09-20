import React from 'react';
import styles from '../../../styles/home.module.css';
import { GlassWidget } from '../../../components/common/GlassWidget';

export const ActionGraph: React.FC = () => {
  return (
    <GlassWidget title="ActionGraph">
      <div className={styles.placeholder}>Здесь будет график активностей</div>
    </GlassWidget>
  );
};


