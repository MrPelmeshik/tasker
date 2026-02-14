import React from 'react';
import glassWidgetStyles from '../../../styles/glass-widget.module.css';
import { GlassWidget } from '../../../components';
import type { WidgetSizeProps } from '../../../types';

export interface LastActionListProps extends WidgetSizeProps {
  /** Режим встраивания: без обёртки GlassWidget (используется внутри SidebarTabsWidget) */
  embedded?: boolean;
}

export const LastActionList: React.FC<LastActionListProps> = ({ colSpan, rowSpan, embedded }) => {
  const content = (
    <div className={glassWidgetStyles.placeholder}>Здесь будет список последних действий</div>
  );

  if (embedded) {
    return content;
  }

  return (
    <GlassWidget title="Активности" colSpan={colSpan} rowSpan={rowSpan}>
      {content}
    </GlassWidget>
  );
};


