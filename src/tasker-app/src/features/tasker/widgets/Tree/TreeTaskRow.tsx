import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { TaskCardLink } from '../../../../components/tasks';
import { GripVerticalIcon } from '../../../../components/icons';
import { useCustomColorStyle } from '../../../../hooks';
import type { TaskSummary } from '../../../../types';
import css from '../../../../styles/tree.module.css';

export interface TreeTaskRowProps {
  task: TaskSummary;
  onViewDetails: (e: React.MouseEvent) => void;
}

/** Строка задачи с drag handle */
export const TreeTaskRow: React.FC<TreeTaskRowProps> = ({ task, onViewDetails }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `task-${task.id}`,
    data: { type: 'task', task },
  });
  const taskStyle = useCustomColorStyle(task.customColor);

  return (
    <div className={`${css.taskItem} ${isDragging ? css.isDragging : ''}`}>
      <div ref={setNodeRef} className={css.taskCard} style={taskStyle} data-custom-color={task.customColor ? 'true' : undefined}>
        <div className={css.taskContent}>
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
