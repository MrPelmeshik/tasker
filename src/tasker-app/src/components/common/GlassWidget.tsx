import React, { PropsWithChildren } from 'react';
import css from '../../styles/glass-widget.module.css';

type GlassWidgetProps = PropsWithChildren<{
  title?: string;
  className?: string;
}>;

export const GlassWidget: React.FC<GlassWidgetProps> = ({ title, className, children }) => {
  return (
    <section className={`${css.glass} ${className ?? ''}`.trim()}>
      {title && <h3 className={css.title}>{title}</h3>}
      <div className={css.content}>{children}</div>
    </section>
  );
};


