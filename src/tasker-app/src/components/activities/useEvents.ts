import { useState, useEffect, useCallback } from 'react';
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
): { events: EventResponse[]; loading: boolean; error: string | null; refetch: () => void } {
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  const refetch = useCallback(() => setTrigger((t) => t + 1), []);

  useEffect(() => {
    if (!entityId) return;
    const ctrl = new AbortController();
    let cancelled = false;
    setLoading(true);
    setError(null);
    const fetch = async () => {
      try {
        const data =
          entityType === 'task'
            ? await fetchEventsByTask(entityId, { signal: ctrl.signal })
            : await fetchEventsByArea(entityId, { signal: ctrl.signal });
        if (!cancelled) {
          const raw = data ?? [];
          const filtered = date
            ? raw.filter((ev) => toIsoDateString(ev.eventDate) === date)
            : raw;
          setEvents(filtered);
        }
      } catch (e) {
        if (e instanceof Error && e.name === 'AbortError') return;
        if (!cancelled) {
          setError('Ошибка загрузки активностей');
          setEvents([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetch();
    return () => {
      cancelled = true;
      ctrl.abort();
    };
  }, [entityType, entityId, date, trigger]);

  return { events, loading, error, refetch };
}
