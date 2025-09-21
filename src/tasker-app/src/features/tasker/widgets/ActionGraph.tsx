import React from 'react';
import styles from '../../../styles/home.module.css';
import { GlassWidget } from '../../../components/common/GlassWidget';
import type { WidgetSizeProps } from '../../../types/widget-size';

export const ActionGraph: React.FC<WidgetSizeProps> = ({ colSpan, rowSpan }) => {
  return (
    <GlassWidget title="ActionGraph" colSpan={colSpan} rowSpan={rowSpan}>
      <div className={styles.placeholder}>Здесь будет график активностей</div>
    </GlassWidget>
  );
};


