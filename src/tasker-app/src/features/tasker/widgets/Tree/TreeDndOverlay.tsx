import React from 'react';
import { GripVerticalIcon } from '../../../../components/icons';
import { GlassTag } from '../../../../components/ui/GlassTag';
import { TaskStatusBadge } from '../../../../components/ui/TaskStatusBadge';
import type { FolderSummary, TaskSummary } from '../../../../types';
import css from '../../../../styles/tree.module.css';

export interface TreeDndOverlayProps {
  type: 'folder' | 'task';
  folder?: FolderSummary;
  task?: TaskSummary;
}

/** Содержимое DragOverlay при перетаскивании папки или задачи */
export const TreeDndOverlay: React.FC<TreeDndOverlayProps> = ({ type, folder, task }) => {
  if (type === 'folder' && folder) {
    return (
      <div className={css.dragOverlayCard}>
        <GripVerticalIcon className="icon-l" />
        <GlassTag variant="subtle" size="xs">{folder.tasksCount + folder.subfoldersCount}</GlassTag>
        <span>{folder.title}</span>
      </div>
    );
  }
  if (type === 'task' && task) {
    return (
      <div className={css.dragOverlayCard}>
        <GripVerticalIcon className="icon-l" />
        <TaskStatusBadge status={task.status} size="xs" variant="compact" />
        <span>{task.title}</span>
      </div>
    );
  }
  return null;
};
