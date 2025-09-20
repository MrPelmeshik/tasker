import React from 'react';
import styles from '../../../styles/home.module.css';
import { GlassWidget } from '../../../components/common/GlassWidget';

export const AreaGroupHierarchy: React.FC = () => {
  return (
    <GlassWidget title="AreaGroupHierarchy">
      <div className={styles.placeholder}>Здесь будет иерархия областей/групп</div>
    </GlassWidget>
  );
};


