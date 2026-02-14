import React from 'react';
import { LayoutGridIcon } from '../icons';
import css from '../../styles/tree-item-link.module.css';

/** Минимальные данные области для карточки-ссылки в дереве */
export interface AreaCardLinkArea {
  id: string;
  title: string;
  foldersCount: number;
  rootTasksCount: number;
  customColor?: string;
}

export interface AreaCardLinkProps {
  /** Область для отображения */
  area: AreaCardLinkArea;
  /** Дополнительные inline-стили */
  style?: React.CSSProperties;
  /** Использовать кастомный цвет */
  dataCustomColor?: boolean;
  /** Отображаемое количество (при активном фильтре) */
  displayCount?: number;
  /** Полное количество (при активном фильтре, для формата displayed/total) */
  totalCount?: number;
}

/**
 * Карточка области в дереве: счётчик + иконка + название (отображение без клика).
 * Стиль как TaskCardLink variant="text".
 * При displayCount и totalCount — показывает (displayed/total) вместо обычного счётчика.
 */
export const AreaCardLink: React.FC<AreaCardLinkProps> = ({
  area,
  style,
  dataCustomColor,
  displayCount,
  totalCount,
}) => {
  const defaultCount = area.foldersCount + area.rootTasksCount;
  const countText =
    displayCount != null && totalCount != null ? `${displayCount}/${totalCount}` : String(defaultCount);
  return (
    <div
      className={`${css.root} ${css.plain}`}
      style={style}
      data-custom-color={dataCustomColor ? 'true' : undefined}
    >
      <LayoutGridIcon className={css.typeIcon} style={{ width: 14, height: 14 }} />
      <span className={css.title}>{area.title}</span>
      <span className={css.count}>({countText})</span>
    </div>
  );
};
