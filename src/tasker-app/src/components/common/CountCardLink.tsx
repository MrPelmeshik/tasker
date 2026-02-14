import React from 'react';
import css from '../../styles/tree-item-link.module.css';

export interface CountCardLinkProps {
  icon: React.ReactNode;
  title: string;
  defaultCount: number;
  displayCount?: number;
  totalCount?: number;
  style?: React.CSSProperties;
  dataCustomColor?: boolean;
}

export const CountCardLink: React.FC<CountCardLinkProps> = ({
  icon,
  title,
  defaultCount,
  displayCount,
  totalCount,
  style,
  dataCustomColor,
}) => {
  const countText =
    displayCount != null && totalCount != null ? `${displayCount}/${totalCount}` : String(defaultCount);
  return (
    <div
      className={`${css.root} ${css.plain}`}
      style={style}
      data-custom-color={dataCustomColor ? 'true' : undefined}
    >
      {icon}
      <span className={css.title}>{title}</span>
      <span className={css.count}>({countText})</span>
    </div>
  );
};
