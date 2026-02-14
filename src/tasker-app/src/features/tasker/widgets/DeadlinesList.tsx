import React from 'react';
import glassWidgetStyles from '../../../styles/glass-widget.module.css';
import { GlassWidget } from '../../../components';
import type { WidgetSizeProps } from '../../../types';

export interface DeadlinesListProps extends WidgetSizeProps {
  /** Режим встраивания: без обёртки GlassWidget (используется внутри SidebarTabsWidget) */
  embedded?: boolean;
}

export const DeadlinesList: React.FC<DeadlinesListProps> = ({ colSpan, rowSpan, embedded }) => {
  const content = (
    <div className={glassWidgetStyles.placeholder}>Здесь будут дедлайны</div>
  );

  if (embedded) {
    return content;
  }

  return (
    <GlassWidget title="Дедлайны" colSpan={colSpan} rowSpan={rowSpan}>
      {content}
    </GlassWidget>
  );
};


