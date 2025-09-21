import React from 'react';
import styles from '../../../styles/home.module.css';
import { GlassWidget } from '../../../components/common/GlassWidget';
import type { WidgetSizeProps } from '../../../types/widget-size';

export const DeadlinesList: React.FC<WidgetSizeProps> = ({ colSpan, rowSpan }) => {
  return (
    <GlassWidget title="DeadlinesList" colSpan={colSpan} rowSpan={rowSpan}>
      <div className={styles.placeholder}>Здесь будут дедлайны</div>
    </GlassWidget>
  );
};


