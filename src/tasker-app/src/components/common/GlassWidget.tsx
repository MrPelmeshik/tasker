import React, { PropsWithChildren, useEffect, useState } from 'react';
import css from '../../styles/glass-widget.module.css';
import type { ColumnSpan, RowSpan } from '../../types';

type GlassWidgetProps = PropsWithChildren<{
  title?: string;
  colSpan?: ColumnSpan;
  rowSpan?: RowSpan;
  className?: string;
}>;

function usePanelColumns(): number {
  const [columns, setColumns] = useState(1);

  useEffect(() => {
    const compute = () => {
      const width = window.innerWidth;
      if (width >= 1600) return setColumns(8);
      if (width >= 1280) return setColumns(6);
      if (width >= 1000) return setColumns(4);
      if (width >= 700) return setColumns(2);
      return setColumns(1);
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);

  return columns;
}

export const GlassWidget: React.FC<GlassWidgetProps> = ({ title, colSpan = 1, rowSpan = 1, className, children }) => {
  const columns = usePanelColumns();
  const effectiveColSpan = colSpan === 'full' ? 'full' : Math.max(1, Math.min(colSpan, columns));
  const gridColumn = effectiveColSpan === 'full' ? '1 / -1' : `span ${effectiveColSpan}`;
  const gridRow = rowSpan === 'full' ? '1 / -1' : `span ${rowSpan}`;
  const style: React.CSSProperties = { gridColumn, gridRow };
  const hasTitle = !!(typeof title === 'string' ? title.trim() : title);

  const classes = [css.glass, className].filter(Boolean).join(' ');
  return (
    <section className={classes} style={style}>
      {hasTitle && <h3 className={css.title}>{title}</h3>}
      <div className={css.content}>{children}</div>
    </section>
  );
};


