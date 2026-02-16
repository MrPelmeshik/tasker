/**
 * Состояние и загрузка данных для виджета таблицы задач.
 */

import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchTasksWithActivities,
  buildTaskWithActivitiesFilter,
  dateRangeFromWeek,
  createEventForTask,
  updateEvent,
  deleteEvent,
  fetchAreaShortCard,
} from '../../../../services/api';
import type { EventUpdateRequest } from '../../../../types/api';
import { TaskStatus } from '../../../../types/task-status';
import type { TaskResponse } from '../../../../types/api';
import type { TaskRow } from './taskTableUtils';
import { sortTaskRows } from './taskTableUtils';
import { matchesSearch } from '../Tree/treeSearchUtils';
import type { TreeSortPreset } from '../Tree/treeUtils';

/** Группа строк по области (areaColor из данных области). */
export type GroupedTaskRows = Array<{ areaId: string; areaTitle: string; areaColor?: string; rows: TaskRow[] }>;

function groupRowsByArea(rows: TaskRow[], sortPreset: TreeSortPreset): GroupedTaskRows {
  const byArea = new Map<string, TaskRow[]>();
  const areaTitles = new Map<string, string>();

  for (const row of rows) {
    const id = row.areaId ?? '';
    // Store title for sorting
    if (!areaTitles.has(id)) {
      areaTitles.set(id, row.areaTitle || '—');
    }

    if (!byArea.has(id)) {
      byArea.set(id, []);
    }
    byArea.get(id)!.push(row);
  }

  // Sort areas alphabetically
  const sortedAreaIds = Array.from(byArea.keys()).sort((a, b) => {
    const titleA = areaTitles.get(a) ?? '';
    const titleB = areaTitles.get(b) ?? '';
    return titleA.localeCompare(titleB, undefined, { sensitivity: 'base' });
  });

  return sortedAreaIds.map(areaId => {
    const rowsInGroup = byArea.get(areaId) ?? [];
    // Sort tasks within area
    const sortedRows = sortTaskRows(rowsInGroup, sortPreset);
    const areaTitle = areaTitles.get(areaId) ?? '—';
    return { areaId, areaTitle, rows: sortedRows };
  });
}

export interface UseTaskTableDataOptions {
  weekStartIso: string;
  showError: (error: unknown) => void;
  notifyTaskUpdate: (taskId?: string, folderId?: string) => void;
  subscribeToTaskUpdates: (callback: (taskId?: string, folderId?: string, payload?: { entityType?: string; entityId?: string }) => void) => () => void;
  enabledStatuses: Set<TaskStatus>;
  searchQuery: string;
  sortPreset: TreeSortPreset;
  enabledEventTypes: Set<number>;
}

export function useTaskTableData({
  weekStartIso,
  showError,
  notifyTaskUpdate,
  subscribeToTaskUpdates,
  enabledStatuses,
  searchQuery,
  sortPreset,
  enabledEventTypes,
}: UseTaskTableDataOptions) {
  const [loading, setLoading] = useState(false);
  const [groupedRows, setGroupedRows] = useState<GroupedTaskRows>([]);
  const [areaColors, setAreaColors] = useState<Record<string, string>>({});
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    let alive = true;
    fetchAreaShortCard()
      .then((areas) => {
        if (!alive) return;
        const map: Record<string, string> = {};
        for (const a of areas) {
          if (a.customColor) map[a.id] = a.customColor;
        }
        setAreaColors(map);
      })
      .catch(() => { });
    return () => { alive = false; };
  }, []);

  const groupedRowsWithColors = useMemo(
    () => groupedRows.map((g) => ({ ...g, areaColor: areaColors[g.areaId] })),
    [groupedRows, areaColors]
  );

  const loadData = useCallback(async (signal?: AbortSignal): Promise<void> => {
    let alive = true;
    setLoading(true);
    try {
      const filter = buildTaskWithActivitiesFilter({
        ...dateRangeFromWeek(weekStartIso),
        statuses: Array.from(enabledStatuses),
        includeTasksWithActivitiesInRange: true,
      });
      const res = await fetchTasksWithActivities(filter, { signal });
      if (!alive) return;

      const merged: TaskRow[] = res.items.map(item => {
        // Filter events and recalculate counts based on enabledEventTypes
        const days = item.days.map(d => {
          // If events are present, filter them. If not, fallback to count/logic (compatibility)
          // But since we updated backend, we expect events.
          const allEvents = d.events || [];
          const filteredEvents = allEvents.filter(e => enabledEventTypes.has(e.eventType));
          return {
            ...d,
            events: filteredEvents,
            count: filteredEvents.length
          };
        });

        const hasFutureActivities = item.hasFutureActivities; // We might want to filter this too if backend gave us details, but backend only gives boolean. 
        // Ideally backend should filter based on request, but we only filter days client side for now.
        // It's acceptable limitation that "carryWeeks" or "future" might include disabled event types unless we fetch full history.

        return {
          taskId: item.taskId,
          taskName: item.taskName,
          areaId: item.areaId,
          areaTitle: item.areaTitle ?? item.areaId ?? '—',
          carryWeeks: item.carryWeeks,
          hasFutureActivities: hasFutureActivities,
          pastEventTypes: item.pastEventTypes || [],
          futureEventTypes: item.futureEventTypes || [],
          days: days,
          task: {
            id: item.taskId,
            areaId: item.areaId,
            folderId: item.folderId,
            title: item.taskName,
            status: item.status,
          },
        };
      });

      // 1. Client-side Search and Status Filter (to ensure strict status filtering for tasks with activities too)
      let filtered = merged;

      // Filter by Status (Client-side enforcement)
      if (enabledStatuses.size > 0) {
        filtered = filtered.filter(row => enabledStatuses.has(row.task.status));
      }

      if (searchQuery.trim()) {
        filtered = filtered.filter(row => matchesSearch(row.taskName, searchQuery));
      }

      // Group by Area (Alphabetical) then Sort Tasks (by Preset)
      const grouped = groupRowsByArea(filtered, sortPreset);
      setGroupedRows(grouped);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      console.error('Ошибка загрузки задач:', error);
      if (alive) {
        setGroupedRows([]);
        showError(error);
      }
    } finally {
      if (alive) setLoading(false);
    }
  }, [weekStartIso, showError, enabledStatuses, searchQuery, sortPreset, enabledEventTypes]);

  const handleActivitySaveForTask = useCallback(
    (task: TaskResponse) => async (data: { title: string; description: string; eventDateTime: string; eventType: string }) => {
      await createEventForTask({
        entityId: task.id,
        title: data.title,
        description: data.description || undefined,
        eventType: data.eventType as any,
        eventDate: data.eventDateTime,
      });
      await loadData();
      notifyTaskUpdate(task.id, task.folderId ?? undefined);
    },
    [loadData, notifyTaskUpdate]
  );

  const handleActivityUpdateForTask = useCallback(
    (task: TaskResponse) => async (eventId: string, data: EventUpdateRequest) => {
      await updateEvent(eventId, data);
      await loadData();
      notifyTaskUpdate(task.id, task.folderId ?? undefined);
    },
    [loadData, notifyTaskUpdate]
  );

  const handleActivityDeleteForTask = useCallback(
    (task: TaskResponse) => async (ev: { id: string }) => {
      await deleteEvent(ev.id);
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
    const unsubscribe = subscribeToTaskUpdates((taskId, folderId, payload) => {
      if (payload?.entityType === 'AREA') {
        fetchAreaShortCard()
          .then((areas) => {
            const map: Record<string, string> = {};
            for (const a of areas) {
              if (a.customColor) map[a.id] = a.customColor;
            }
            setAreaColors(map);
          })
          .catch(() => { });
      } else {
        loadData(abortControllerRef.current?.signal);
      }
    });
    return unsubscribe;
  }, [subscribeToTaskUpdates, loadData]);

  return {
    loading,
    groupedRows: groupedRowsWithColors,
    loadData,
    handleActivitySaveForTask,
    handleActivityUpdateForTask,
    handleActivityDeleteForTask,
  };
}
