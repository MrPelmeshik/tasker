import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { TaskCardLink } from '../../../../components/tasks';
import { GlassButton } from '../../../../components/ui/GlassButton';
import { Tooltip } from '../../../../components/ui';
import { LinkIcon } from '../../../../components/icons';
import { useCopyEntityLink, useCustomColorStyle } from '../../../../hooks';
import type { TaskSummary } from '../../../../types';
import css from '../../../../styles/tree.module.css';

export interface TreeTaskRowProps {
  /** Уровень вложенности: n=1 область, n=2 задачи в корне и т.д. Отступ = x*(level-1) */
  level: number;
  task: TaskSummary;
  onViewDetails: (e: React.MouseEvent) => void;
}

/** Строка задачи, drag за весь блок. Memoized. */
export const TreeTaskRow: React.FC<TreeTaskRowProps> = React.memo(({ level, task, onViewDetails }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `task-${task.id}`,
    data: { type: 'task', task },
  });
  const taskStyle = useCustomColorStyle(task.customColor);
  const { copyLink: handleCopyLink } = useCopyEntityLink('task', task.id);

  return (
    <div
      className={`${css.taskItem} ${isDragging ? css.isDragging : ''} ${css.animatedRow}`}
      style={{ paddingLeft: `calc(var(--tree-indent) * ${level - 1})` }}
    >
      <div
        ref={setNodeRef}
        className={css.taskCard}
        style={taskStyle}
        data-custom-color={task.customColor ? 'true' : undefined}
        {...attributes}
        {...listeners}
      >
        <div className={css.treeRowActions} onClick={(e) => e.stopPropagation()}>
          <Tooltip content="Копировать ссылку" placement="top">
            <GlassButton variant="subtle" size="xs" className={css.treeActionButton} onClick={handleCopyLink} aria-label="Копировать ссылку">
              <LinkIcon className="icon-m" />
            </GlassButton>
          </Tooltip>
        </div>
        <div className={css.treeRowMain}>
          <TaskCardLink
            task={task}
            variant="text"
            showTypeIcon
            onClick={onViewDetails}
            style={taskStyle}
            dataCustomColor={!!task.customColor}
          />
        </div>
      </div>
    </div>
  );
});
