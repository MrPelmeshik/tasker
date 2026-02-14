import React from 'react';
import { FolderIcon } from '../icons';
import { CountCardLink } from '../common/CountCardLink';
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
 */
export const FolderCardLink: React.FC<FolderCardLinkProps> = ({
  folder,
  style,
  dataCustomColor,
  displayCount,
  totalCount,
}) => (
  <CountCardLink
    icon={<FolderIcon className={`${css.typeIcon} icon-m`} />}
    title={folder.title}
    defaultCount={folder.tasksCount + folder.subfoldersCount}
    displayCount={displayCount}
    totalCount={totalCount}
    style={style}
    dataCustomColor={dataCustomColor}
  />
);
