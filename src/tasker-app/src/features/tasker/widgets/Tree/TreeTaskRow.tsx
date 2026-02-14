import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { TaskCardLink } from '../../../../components/tasks';
import { GlassButton } from '../../../../components/ui/GlassButton';
import { Tooltip } from '../../../../components/ui';
import { GripVerticalIcon, LinkIcon } from '../../../../components/icons';
import { useCustomColorStyle } from '../../../../hooks';
import { buildEntityUrl } from '../../../../utils/entity-links';
import { useToast } from '../../../../context';
import type { TaskSummary } from '../../../../types';
import css from '../../../../styles/tree.module.css';

export interface TreeTaskRowProps {
  /** Уровень вложенности: n=1 область, n=2 задачи в корне и т.д. Отступ = x*(level-1) */
  level: number;
  task: TaskSummary;
  onViewDetails: (e: React.MouseEvent) => void;
}

/** Строка задачи с drag handle */
export const TreeTaskRow: React.FC<TreeTaskRowProps> = ({ level, task, onViewDetails }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `task-${task.id}`,
    data: { type: 'task', task },
  });
  const taskStyle = useCustomColorStyle(task.customColor);
  const { addSuccess } = useToast();

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(buildEntityUrl('task', task.id)).then(
      () => addSuccess('Ссылка скопирована'),
      () => {}
    );
  };

  return (
    <div
      className={`${css.taskItem} ${isDragging ? css.isDragging : ''}`}
      style={{ paddingLeft: `calc(var(--tree-indent) * ${level - 1})` }}
    >
      <div ref={setNodeRef} className={css.taskCard} style={taskStyle} data-custom-color={task.customColor ? 'true' : undefined}>
        <div className={css.taskContent}>
          <div className={css.treeRowActions} onClick={(e) => e.stopPropagation()}>
            <Tooltip content="Копировать ссылку" placement="top">
              <GlassButton variant="subtle" size="xs" className={css.treeActionButton} onClick={handleCopyLink} aria-label="Копировать ссылку">
                <LinkIcon style={{ width: 14, height: 14 }} />
              </GlassButton>
            </Tooltip>
          </div>
          <div className={css.treeRowMain}>
            <div className={css.dragHandle} {...attributes} {...listeners}>
              <GripVerticalIcon style={{ width: 12, height: 12 }} />
            </div>
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
    </div>
  );
};
