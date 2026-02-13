/**
 * Состояние и загрузка данных для виджета таблицы задач.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  fetchTasksWithActivities,
  buildTaskWithActivitiesFilter,
  dateRangeFromWeek,
  createEventForTask,
  EventTypeActivity,
} from '../../../../services/api';
import { parseApiErrorMessage } from '../../../../utils/parse-api-error';
import { TaskStatus } from '../../../../types/task-status';
import type { TaskResponse } from '../../../../types/api';
import type { TaskRow } from './taskTableUtils';

export interface UseTaskTableDataOptions {
  weekStartIso: string;
  addError: (message: string) => void;
  notifyTaskUpdate: (taskId?: string, folderId?: string) => void;
  subscribeToTaskUpdates: (callback: () => void) => () => void;
}

export function useTaskTableData({
  weekStartIso,
  addError,
  notifyTaskUpdate,
  subscribeToTaskUpdates,
}: UseTaskTableDataOptions) {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<TaskRow[]>([]);

  const loadData = useCallback(async (): Promise<void> => {
    let alive = true;
    setLoading(true);
    try {
      const filter = buildTaskWithActivitiesFilter({
        ...dateRangeFromWeek(weekStartIso),
        statuses: [TaskStatus.InProgress, TaskStatus.Pending],
        includeTasksWithActivitiesInRange: true,
      });
      const res = await fetchTasksWithActivities(filter);
      if (!alive) return;

      const merged: TaskRow[] = res.items.map(item => ({
        taskId: item.taskId,
        taskName: item.taskName,
        carryWeeks: item.carryWeeks,
        hasFutureActivities: item.hasFutureActivities,
        days: item.days,
        task: {
          id: item.taskId,
          areaId: item.areaId,
          folderId: item.folderId,
          title: item.taskName,
          status: item.status,
        },
      }));

      setRows(merged);
    } catch (error) {
      console.error('Ошибка загрузки задач:', error);
      if (alive) {
        setRows([]);
        addError(parseApiErrorMessage(error));
      }
    } finally {
      if (alive) setLoading(false);
    }
  }, [weekStartIso, addError]);

  const handleActivitySaveForTask = useCallback(
    (task: TaskResponse) => async (data: { title: string; description: string; date: string }) => {
      await createEventForTask({
        entityId: task.id,
        title: data.title,
        description: data.description || undefined,
        eventType: EventTypeActivity,
        eventDate: data.date,
      });
      await loadData();
      notifyTaskUpdate(task.id, task.folderId ?? undefined);
    },
    [loadData, notifyTaskUpdate]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const unsubscribe = subscribeToTaskUpdates(() => loadData());
    return unsubscribe;
  }, [subscribeToTaskUpdates, loadData]);

  return { loading, rows, loadData, handleActivitySaveForTask };
}
