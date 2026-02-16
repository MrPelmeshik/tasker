/**
 * Утилиты для виджета таблицы задач.
 */

import type { TaskResponse, TaskDayActivity } from '../../../../types/api';
import type { TreeSortPreset } from '../Tree/treeUtils';
import type { TaskStatus } from '../../../../types/task-status';
import css from '../../../../styles/task-table.module.css';

const STATUS_PRIORITY_ORDER: number[] = [
  3 /* InProgress */,
  2 /* Pending */,
  1 /* New */,
  4 /* Closed */,
  5 /* Cancelled */,
];

function getStatusPriority(status: number): number {
  const idx = STATUS_PRIORITY_ORDER.indexOf(status);
  return idx >= 0 ? idx : STATUS_PRIORITY_ORDER.length;
}

export function sortTaskRows(rows: TaskRow[], preset: TreeSortPreset): TaskRow[] {
  const result = [...rows];

  switch (preset) {
    case 'statusAscAlpha':
      result.sort((a, b) => {
        const pa = getStatusPriority(a.task.status);
        const pb = getStatusPriority(b.task.status);
        if (pa !== pb) return pa - pb;
        return (a.taskName ?? '').localeCompare(b.taskName ?? '', undefined, { sensitivity: 'base' });
      });
      break;
    case 'statusDescAlpha':
      result.sort((a, b) => {
        const pa = getStatusPriority(a.task.status);
        const pb = getStatusPriority(b.task.status);
        if (pa !== pb) return pa - pb;
        return (b.taskName ?? '').localeCompare(a.taskName ?? '', undefined, { sensitivity: 'base' });
      });
      break;
    case 'alpha':
      result.sort((a, b) =>
        (a.taskName ?? '').localeCompare(b.taskName ?? '', undefined, { sensitivity: 'base' })
      );
      break;
    case 'alphaDesc':
      result.sort((a, b) =>
        (b.taskName ?? '').localeCompare(a.taskName ?? '', undefined, { sensitivity: 'base' })
      );
      break;
    // Dates not supported in TaskTable yet (no data)
    default:
      break;
  }
  return result;
}


/** Минимальные данные задачи для строки (полная задача — через fetchTaskById) */
export type TaskRowTask = Pick<TaskResponse, 'id' | 'areaId' | 'folderId' | 'title' | 'status'>;

/** Строка таблицы: задача + активность по дням */
export type TaskRow = {
  taskId: string;
  taskName: string;
  areaId: string;
  areaTitle: string;
  carryWeeks: number;
  hasFutureActivities: boolean;
  pastEventTypes: number[];
  futureEventTypes: number[];
  days: TaskDayActivity[];
  task: TaskRowTask;
};

/** Возвращает CSS-класс интенсивности для ячейки по количеству активностей */
export function intensityClass(count: number): string {
  if (count <= 0) return css.intensity0;
  if (count <= 2) return css.intensity1;
  if (count <= 4) return css.intensity2;
  if (count <= 6) return css.intensity3;
  if (count <= 9) return css.intensity4;
  return css.intensity5;
}
