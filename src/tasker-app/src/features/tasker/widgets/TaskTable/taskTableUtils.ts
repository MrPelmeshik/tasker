/**
 * Утилиты для виджета таблицы задач.
 */

import type { TaskResponse, TaskDayActivity } from '../../../../types/api';
import css from '../../../../styles/task-table.module.css';

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
