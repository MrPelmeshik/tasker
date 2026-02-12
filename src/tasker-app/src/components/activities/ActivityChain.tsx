import React, { useState, useEffect } from 'react';
import {
  fetchEventsByTask,
  fetchEventsByGroup,
  fetchEventsByArea,
} from '../../services/api';
import type { EventResponse } from '../../types/api';
import activityChainCss from '../../styles/activity-chain.module.css';

/** Форматирование ISO-даты в формат дд.мм.гг чч:мм */
function formatDateTime(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = String(d.getFullYear()).slice(-2);
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}.${mm}.${yy} ${hh}:${min}`;
}

/** Человекочитаемое название типа события */
function getEventTypeLabel(eventType: string): string {
  const labels: Record<string, string> = {
    UNKNOWN: 'Неизвестно',
    CREATE: 'Создание',
    UPDATE: 'Обновление',
    DELETE: 'Удаление',
    NOTE: 'Заметка',
    ACTIVITY: 'Активность',
  };
  return labels[eventType] ?? eventType;
}

/** Форматирование ISO-даты YYYY-MM-DD в DD.MM.YYYY */
function formatDateOnly(isoDate: string): string {
  if (!isoDate || isoDate.length < 10) return isoDate;
  const [y, m, d] = isoDate.slice(0, 10).split('-');
  return `${d}.${m}.${y}`;
}

export interface ActivityChainProps {
  /** Тип сущности: задача, группа или область */
  entityType: 'task' | 'group' | 'area';
  /** Идентификатор сущности */
  entityId: string;
  /** Опциональная дата (ISO YYYY-MM-DD): показывать только активности за этот день */
  date?: string;
}

export const ActivityChain: React.FC<ActivityChainProps> = ({
  entityType,
  entityId,
  date,
}) => {
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);

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
          const filtered = date ? raw.filter((ev) => ev.createdAt.slice(0, 10) === date) : raw;
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

  const toggleExpanded = () => setExpanded((prev) => !prev);

  return (
    <div className={activityChainCss.chain}>
      <button
        type="button"
        className={activityChainCss.header}
        onClick={toggleExpanded}
        aria-expanded={expanded}
      >
        <span className={activityChainCss.headerTitle}>
          {date ? `Активности за ${formatDateOnly(date)}` : 'История активностей'}
        </span>
        <span className={activityChainCss.chevron} data-expanded={expanded}>
          ▼
        </span>
      </button>
      {expanded && (
        <div className={activityChainCss.body}>
          {loading && (
            <div className={activityChainCss.message}>Загрузка...</div>
          )}
          {!loading && error && (
            <div className={activityChainCss.messageError}>{error}</div>
          )}
          {!loading && !error && events.length === 0 && (
            <div className={activityChainCss.message}>Нет активностей</div>
          )}
          {!loading && !error && events.length > 0 && (
            <ul className={activityChainCss.eventList}>
              {events.map((ev) => (
                <li key={ev.id} className={activityChainCss.eventItem}>
                  <div className={activityChainCss.eventMain}>
                    <span className={activityChainCss.eventTitle}>
                      {ev.title || '—'}
                    </span>
                    <span className={activityChainCss.eventType}>
                      {getEventTypeLabel(ev.eventType)}
                    </span>
                    <span className={activityChainCss.eventDate}>
                      {formatDateTime(ev.createdAt)}
                    </span>
                  </div>
                  {ev.description && (
                    <div className={activityChainCss.eventDesc}>
                      {ev.description.length > 120
                        ? `${ev.description.slice(0, 120)}…`
                        : ev.description}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
