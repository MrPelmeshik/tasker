import React from 'react';
import { TaskStatus, getTaskStatusText, getTaskStatusColor } from '../../types/task-status';
import css from '../../styles/task-status-badge.module.css';

interface TaskStatusBadgeProps {
  status: TaskStatus;
  size?: 'xs' | 's' | 'm' | 'l';
  className?: string;
}

export const TaskStatusBadge: React.FC<TaskStatusBadgeProps> = ({
  status,
  size = 's',
  className
}) => {
  const text = getTaskStatusText(status);
  const color = getTaskStatusColor(status);
  
  const badgeClass = [
    css.badge,
    css[size],
    className
  ].filter(Boolean).join(' ');

  return (
    <span
      className={badgeClass}
      data-status={String(status)}
      style={{ '--status-color': color } as React.CSSProperties}
    >
      {text}
    </span>
  );
};
