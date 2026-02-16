import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../context/ToastContext';
import { fetchEventsByTask, fetchEventsByArea } from '../../services/api';
import type { EventResponse } from '../../types/api';
import { toIsoDateString } from '../../utils/api-date';

/**
 * Хук загрузки событий по сущности (задача или область).
 * Папки не имеют активностей.
 * @param entityType Тип сущности: 'task' | 'area'
 * @param entityId Идентификатор сущности (при undefined загрузка не выполняется)
 * @param date Опциональная дата ISO YYYY-MM-DD — фильтр по дню
 */
export function useEvents(
  entityType: 'task' | 'area',
  entityId: string | undefined,
  date?: string
): { events: EventResponse[]; loading: boolean; error: string | null; refetch: () => Promise<void> } {
  const { showError } = useToast();
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const doFetch = useCallback(
    async (signal?: AbortSignal) => {
      if (!entityId) return;
      setLoading(true);
      setError(null);
      try {
        const data =
          entityType === 'task'
            ? await fetchEventsByTask(entityId, { signal })
            : await fetchEventsByArea(entityId, { signal });
        const raw = data ?? [];
        const filtered = date
          ? raw.filter((ev) => toIsoDateString(ev.eventDate) === date)
          : raw;
        setEvents(filtered);
      } catch (e) {
        if (e instanceof Error && e.name === 'AbortError') return;
        setError('Ошибка загрузки активностей');
        setEvents([]);
        showError(e);
      } finally {
        setLoading(false);
      }
    },
    [entityType, entityId, date, showError]
  );

  useEffect(() => {
    if (!entityId) return;
    const ctrl = new AbortController();
    doFetch(ctrl.signal);
    return () => ctrl.abort();
  }, [entityId, doFetch]);

  /** Перезагружает список событий. Возвращает Promise, который резолвится по завершении загрузки. */
  const refetch = useCallback(async () => {
    await doFetch();
  }, [doFetch]);

  return { events, loading, error, refetch };
}
