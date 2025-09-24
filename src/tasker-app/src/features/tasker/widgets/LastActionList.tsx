import React from 'react';
import glassWidgetStyles from '../../../styles/glass-widget.module.css';
import { GlassWidget } from '../../../components/common/GlassWidget';
import type { WidgetSizeProps } from '../../../types/widget-size';

export const LastActionList: React.FC<WidgetSizeProps> = ({ colSpan, rowSpan }) => {
  return (
    <GlassWidget title="LastActionList" colSpan={colSpan} rowSpan={rowSpan}>
      <div className={glassWidgetStyles.placeholder}>Здесь будет список последних действий</div>
    </GlassWidget>
  );
};


