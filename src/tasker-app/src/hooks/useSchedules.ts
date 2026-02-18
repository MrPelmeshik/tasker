import { useState, useEffect, useCallback, useMemo } from 'react';
import { useToast } from '../context/ToastContext';
import { fetchSchedulesByWeek, fetchSchedulesByTask, createSchedule, deleteSchedule } from '../services/api';
import type { TaskScheduleResponse } from '../types/api';

/**
 * Хук загрузки расписаний за неделю.
 */
export function useWeekSchedules(weekStartIso: string) {
  const { showError } = useToast();
  const [schedules, setSchedules] = useState<TaskScheduleResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const doFetch = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchSchedulesByWeek(weekStartIso, { signal });
        setSchedules(data ?? []);
      } catch (e) {
        if (e instanceof Error && e.name === 'AbortError') return;
        setError('Ошибка загрузки расписаний');
        setSchedules([]);
        showError(e);
      } finally {
        setLoading(false);
      }
    },
    [weekStartIso, showError],
  );

  useEffect(() => {
    const ctrl = new AbortController();
    doFetch(ctrl.signal);
    return () => ctrl.abort();
  }, [doFetch]);

  const refetch = useCallback(async () => {
    await doFetch();
  }, [doFetch]);

  return { schedules, loading, error, refetch };
}

// ---------- Transactional task schedules ----------

export interface PendingScheduleAdd {
  tempId: string;
  taskId: string;
  startAt: string;
  endAt: string;
}

export interface DisplaySchedule extends TaskScheduleResponse {
  isPending?: boolean;
  isPendingDelete?: boolean;
}

/**
 * Хук загрузки расписаний по задаче с поддержкой транзакционного сохранения.
 * Добавления и удаления накапливаются локально и применяются только при вызове saveChanges().
 */
export function useTaskSchedules(taskId: string | undefined, onPendingChange?: (hasPending: boolean) => void) {
  const { showError } = useToast();
  const [schedules, setSchedules] = useState<TaskScheduleResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [pendingAdds, setPendingAdds] = useState<PendingScheduleAdd[]>([]);
  const [pendingDeletes, setPendingDeletes] = useState<Set<string>>(new Set());

  // Notify parent when pending state changes
  useEffect(() => {
    const hasPending = pendingAdds.length > 0 || pendingDeletes.size > 0;
    onPendingChange?.(hasPending);
  }, [pendingAdds.length, pendingDeletes.size, onPendingChange]);

  const doFetch = useCallback(
    async (signal?: AbortSignal) => {
      if (!taskId) return;
      setLoading(true);
      try {
        const data = await fetchSchedulesByTask(taskId, { signal });
        setSchedules(data ?? []);
      } catch (e) {
        if (e instanceof Error && e.name === 'AbortError') return;
        setSchedules([]);
        showError(e);
      } finally {
        setLoading(false);
      }
    },
    [taskId, showError],
  );

  useEffect(() => {
    if (!taskId) return;
    const ctrl = new AbortController();
    doFetch(ctrl.signal);
    return () => ctrl.abort();
  }, [taskId, doFetch]);

  const refetch = useCallback(async () => {
    await doFetch();
  }, [doFetch]);

  const addSchedule = useCallback((startAt: string, endAt: string) => {
    if (!taskId) return;
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setPendingAdds(prev => [...prev, { tempId, taskId, startAt, endAt }]);
  }, [taskId]);

  const markForDelete = useCallback((id: string) => {
    if (id.startsWith('temp-')) {
      setPendingAdds(prev => prev.filter(p => p.tempId !== id));
    } else {
      setPendingDeletes(prev => {
        const s = new Set(prev);
        s.add(id);
        return s;
      });
    }
  }, []);

  const undoDelete = useCallback((id: string) => {
    setPendingDeletes(prev => {
      const s = new Set(prev);
      s.delete(id);
      return s;
    });
  }, []);

  const saveChanges = useCallback(async () => {
    try {
      // Process deletes
      if (pendingDeletes.size > 0) {
        await Promise.all(Array.from(pendingDeletes).map(id => deleteSchedule(id)));
      }
      // Process adds
      if (pendingAdds.length > 0) {
        await Promise.all(pendingAdds.map(p => createSchedule({ taskId: p.taskId, startAt: p.startAt, endAt: p.endAt })));
      }
      setPendingDeletes(new Set());
      setPendingAdds([]);
      await refetch();
    } catch (err) {
      showError(err);
      throw err;
    }
  }, [pendingDeletes, pendingAdds, refetch, showError]);

  const cancelChanges = useCallback(() => {
    setPendingDeletes(new Set());
    setPendingAdds([]);
  }, []);

  const hasPendingChanges = pendingAdds.length > 0 || pendingDeletes.size > 0;

  // Computed display list
  const displaySchedules: DisplaySchedule[] = useMemo(() => {
    const existing = schedules.map(s => ({
      ...s,
      isPendingDelete: pendingDeletes.has(s.id),
    }));
    const pending: DisplaySchedule[] = pendingAdds.map(p => ({
      id: p.tempId,
      taskId: p.taskId,
      taskTitle: '',
      areaId: '',
      areaColor: null,
      taskStatus: 0,
      startAt: new Date(p.startAt),
      endAt: new Date(p.endAt),
      createdAt: new Date(),
      isPending: true,
      isPendingDelete: false,
    }));
    return [...existing, ...pending];
  }, [schedules, pendingDeletes, pendingAdds]);

  return {
    schedules: displaySchedules,
    loading,
    refetch,
    addSchedule,
    markForDelete,
    undoDelete,
    saveChanges,
    cancelChanges,
    hasPendingChanges,
  };
}
