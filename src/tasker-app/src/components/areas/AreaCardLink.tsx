import React from 'react';
import { LayoutGridIcon } from '../icons';
import { CountCardLink } from '../common/CountCardLink';
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
 */
export const AreaCardLink: React.FC<AreaCardLinkProps> = ({
  area,
  style,
  dataCustomColor,
  displayCount,
  totalCount,
}) => (
  <CountCardLink
    icon={<LayoutGridIcon className={`${css.typeIcon} icon-m`} />}
    title={area.title}
    defaultCount={area.foldersCount + area.rootTasksCount}
    displayCount={displayCount}
    totalCount={totalCount}
    style={style}
    dataCustomColor={dataCustomColor}
  />
);
