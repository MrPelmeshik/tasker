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
}

/**
 * Карточка папки в дереве: счётчик + иконка + название (отображение без клика).
 * Стиль как TaskCardLink variant="text".
 */
export const FolderCardLink: React.FC<FolderCardLinkProps> = ({
  folder,
  style,
  dataCustomColor,
}) => (
  <div
    className={css.root}
    style={style}
    data-custom-color={dataCustomColor ? 'true' : undefined}
  >
    <span className={css.count}>({folder.tasksCount + folder.subfoldersCount})</span>
    <FolderIcon className={css.typeIcon} style={{ width: 14, height: 14 }} />
    <span className={css.title}>{folder.title}</span>
  </div>
);
