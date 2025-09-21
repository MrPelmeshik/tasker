import React from 'react';
import styles from '../../../styles/home.module.css';
import { GlassWidget } from '../../../components/common/GlassWidget';
import type { WidgetSizeProps } from '../../../types/widget-size';

export const TaskTable: React.FC<WidgetSizeProps> = ({ colSpan, rowSpan }) => {
  return (
    <GlassWidget title="TaskTable" colSpan={colSpan} rowSpan={rowSpan}>
      <div className={styles.placeholder}>Здесь будет таблица задач</div>
    </GlassWidget>
  );
};


