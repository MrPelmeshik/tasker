import { useState, useEffect } from 'react';
import {
  fetchEventsByTask,
  fetchEventsByGroup,
  fetchEventsByArea,
} from '../../services/api';
import type { EventResponse } from '../../types/api';
import { toIsoDateString } from '../../utils/api-date';

/**
 * Хук загрузки событий по сущности (задача, группа, область).
 * @param entityType Тип сущности
 * @param entityId Идентификатор сущности (при undefined загрузка не выполняется)
 * @param date Опциональная дата ISO YYYY-MM-DD — фильтр по дню
 */
export function useEvents(
  entityType: 'task' | 'group' | 'area',
  entityId: string | undefined,
  date?: string
): { events: EventResponse[]; loading: boolean; error: string | null } {
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!entityId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    const fetch = async () => {
      try {
        const data =
          entityType === 'task'
            ? await fetchEventsByTask(entityId)
            : entityType === 'group'
              ? await fetchEventsByGroup(entityId)
              : await fetchEventsByArea(entityId);
        if (!cancelled) {
          const raw = data ?? [];
          const filtered = date
            ? raw.filter((ev) => toIsoDateString(ev.eventDate) === date)
            : raw;
          setEvents(filtered);
        }
      } catch (e) {
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
    };
  }, [entityType, entityId, date]);

  return { events, loading, error };
}
