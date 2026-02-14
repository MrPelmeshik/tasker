import React from 'react';
import { TaskStatusBadge } from '../ui/TaskStatusBadge';
import { CheckSquareIcon } from '../icons';
import { TaskStatus } from '../../types/task-status';
import css from '../../styles/task-card-link.module.css';

/** Минимальные данные задачи для карточки-ссылки */
export interface TaskCardLinkTask {
  id: string;
  title: string;
  status?: number;
}

export interface TaskCardLinkProps {
  /** Задача для отображения */
  task: TaskCardLinkTask;
  /** Обработчик клика по всему блоку (опционально — в дереве используется кнопка «Просмотреть») */
  onClick?: (e: React.MouseEvent) => void;
  /** Дополнительные CSS-классы */
  className?: string;
  /** Дополнительные inline-стили (например, для кастомного цвета в дереве) */
  style?: React.CSSProperties;
  /** Использовать кастомный цвет (для дерева) */
  dataCustomColor?: boolean;
  /** Вариант отображения: card — с фоном и бордером, text — только текст, подсветка при hover */
  variant?: 'card' | 'text';
  /** Показывать иконку типа (CheckSquareIcon) — для дерева */
  showTypeIcon?: boolean;
}

/**
 * Кликабельная карточка задачи: статус (компактно) + название.
 * Весь блок реагирует на hover и клик.
 */
export const TaskCardLink: React.FC<TaskCardLinkProps> = ({
  task,
  onClick,
  className,
  style,
  dataCustomColor,
  variant = 'card',
  showTypeIcon = false,
}) => (
  <div
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
    className={[css.root, variant === 'text' && css.textVariant, className].filter(Boolean).join(' ')}
    style={style}
    data-custom-color={dataCustomColor ? 'true' : undefined}
    onClick={onClick}
    onKeyDown={onClick ? (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick(e as unknown as React.MouseEvent);
      }
    } : undefined}
  >
    {showTypeIcon && (
      <CheckSquareIcon className={`${css.typeIcon} icon-m`} />
    )}
    <TaskStatusBadge
      status={(task.status ?? TaskStatus.InProgress) as TaskStatus}
      size="xs"
      variant="compact"
    />
    <span className={css.title}>{task.title}</span>
  </div>
);
