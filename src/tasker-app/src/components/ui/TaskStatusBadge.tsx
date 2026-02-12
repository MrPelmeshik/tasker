import React from 'react';
import { TaskStatus, getTaskStatusText, getTaskStatusColor } from '../../types/task-status';
import { Tooltip } from './Tooltip';
import css from '../../styles/task-status-badge.module.css';

interface TaskStatusBadgeProps {
  /** Статус задачи */
  status: TaskStatus;
  /** Размер бейджа (в компактном режиме — размер кружка) */
  size?: 'xs' | 's' | 'm' | 'l';
  /** Вариант отображения: default — текстовая плашка, compact — цветной кружок с подсказкой */
  variant?: 'default' | 'compact';
  className?: string;
}

export const TaskStatusBadge: React.FC<TaskStatusBadgeProps> = ({
  status,
  size = 's',
  variant = 'default',
  className
}) => {
  const text = getTaskStatusText(status);
  const color = getTaskStatusColor(status);

  const badgeClass = [
    css.badge,
    css[size],
    variant === 'compact' && css.compact,
    className
  ].filter(Boolean).join(' ');

  const badge = (
    <span
      className={badgeClass}
      data-status={String(status)}
      style={{ '--status-color': color } as React.CSSProperties}
    >
      {variant === 'default' ? text : null}
    </span>
  );

  if (variant === 'compact') {
    return (
      <Tooltip content={text} placement="top" size="s">
        {badge}
      </Tooltip>
    );
  }

  return badge;
};
