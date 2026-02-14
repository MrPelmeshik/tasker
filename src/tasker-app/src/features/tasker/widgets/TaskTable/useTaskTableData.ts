/**
 * Состояние и загрузка данных для виджета таблицы задач.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
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

/** Группа строк по области */
export type GroupedTaskRows = Array<{ areaId: string; areaTitle: string; rows: TaskRow[] }>;

function groupRowsByArea(rows: TaskRow[]): GroupedTaskRows {
  const order: string[] = [];
  const byArea = new Map<string, TaskRow[]>();
  for (const row of rows) {
    const id = row.areaId ?? '';
    if (!byArea.has(id)) {
      order.push(id);
      byArea.set(id, []);
    }
    byArea.get(id)!.push(row);
  }
  return order.map(areaId => {
    const rowsInGroup = byArea.get(areaId) ?? [];
    const areaTitle = rowsInGroup[0]?.areaTitle ?? (areaId || '—');
    return { areaId, areaTitle, rows: rowsInGroup };
  });
}

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
  const [groupedRows, setGroupedRows] = useState<GroupedTaskRows>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  const loadData = useCallback(async (signal?: AbortSignal): Promise<void> => {
    let alive = true;
    setLoading(true);
    try {
      const filter = buildTaskWithActivitiesFilter({
        ...dateRangeFromWeek(weekStartIso),
        statuses: [TaskStatus.InProgress, TaskStatus.Pending],
        includeTasksWithActivitiesInRange: true,
      });
      const res = await fetchTasksWithActivities(filter, { signal });
      if (!alive) return;

      const merged: TaskRow[] = res.items.map(item => ({
        taskId: item.taskId,
        taskName: item.taskName,
        areaId: item.areaId,
        areaTitle: item.areaTitle ?? item.areaId ?? '—',
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

      const grouped = groupRowsByArea(merged);
      setGroupedRows(grouped);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      console.error('Ошибка загрузки задач:', error);
      if (alive) {
        setGroupedRows([]);
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
    const ctrl = new AbortController();
    abortControllerRef.current = ctrl;
    loadData(ctrl.signal);
    return () => {
      ctrl.abort();
      abortControllerRef.current = null;
    };
  }, [loadData]);

  useEffect(() => {
    const unsubscribe = subscribeToTaskUpdates(() => loadData(abortControllerRef.current?.signal));
    return unsubscribe;
  }, [subscribeToTaskUpdates, loadData]);

  return { loading, groupedRows, loadData, handleActivitySaveForTask };
}
