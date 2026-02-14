import React from 'react';
import { FolderIcon } from '../icons';
import css from '../../styles/tree-item-link.module.css';

/** Минимальные данные папки для карточки-ссылки в дереве */
export interface FolderCardLinkFolder {
  id: string;
  title: string;
  tasksCount: number;
  subfoldersCount: number;
  customColor?: string;
}

export interface FolderCardLinkProps {
  /** Папка для отображения */
  folder: FolderCardLinkFolder;
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
 * Карточка папки в дереве: счётчик + иконка + название (отображение без клика).
 * Стиль как TaskCardLink variant="text".
 * При displayCount и totalCount — показывает (displayed/total) вместо обычного счётчика.
 */
export const FolderCardLink: React.FC<FolderCardLinkProps> = ({
  folder,
  style,
  dataCustomColor,
  displayCount,
  totalCount,
}) => {
  const defaultCount = folder.tasksCount + folder.subfoldersCount;
  const countText =
    displayCount != null && totalCount != null ? `${displayCount}/${totalCount}` : String(defaultCount);
  return (
    <div
      className={`${css.root} ${css.plain}`}
      style={style}
      data-custom-color={dataCustomColor ? 'true' : undefined}
    >
      <FolderIcon className={css.typeIcon} style={{ width: 14, height: 14 }} />
      <span className={css.title}>{folder.title}</span>
      <span className={css.count}>({countText})</span>
    </div>
  );
};
