import React from 'react';
import glassWidgetStyles from '../../../styles/glass-widget.module.css';
import { GlassWidget } from '../../../components/common/GlassWidget';
import type { WidgetSizeProps } from '../../../types/widget-size';

export const DeadlinesList: React.FC<WidgetSizeProps> = ({ colSpan, rowSpan }) => {
  return (
    <GlassWidget title="DeadlinesList" colSpan={colSpan} rowSpan={rowSpan}>
      <div className={glassWidgetStyles.placeholder}>Здесь будут дедлайны</div>
    </GlassWidget>
  );
};


