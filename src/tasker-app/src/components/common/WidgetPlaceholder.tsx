import React, { PropsWithChildren } from 'react';
import { GlassWidget } from './GlassWidget';
import type { WidgetSizeProps } from '../../types';
import css from '../../styles/glass-widget.module.css';

type WidgetPlaceholderProps = PropsWithChildren<WidgetSizeProps & {
  title?: string;
  message?: string;
}>;

export const WidgetPlaceholder: React.FC<WidgetPlaceholderProps> = ({
  title = 'Заглушка',
  message = 'Скоро здесь появится контент',
  colSpan,
  rowSpan,
  children,
}) => {
  return (
    <GlassWidget title={title} colSpan={colSpan} rowSpan={rowSpan}>
      <div className={css.placeholder}>{children ?? message}</div>
    </GlassWidget>
  );
};


