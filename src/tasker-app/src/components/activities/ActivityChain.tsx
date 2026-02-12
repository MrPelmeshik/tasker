import React, { useState, useEffect } from 'react';
import {
  fetchEventsByTask,
  fetchEventsByGroup,
  fetchEventsByArea,
} from '../../services/api';
import type { EventResponse, EventMessage } from '../../types/api';
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

/** Названия полей для отображения диффа */
const FIELD_LABELS: Record<string, string> = {
  Title: 'Заголовок',
  Description: 'Описание',
  Status: 'Статус',
  GroupId: 'Группа',
};

/** Статусы задач для отображения */
const STATUS_LABELS: Record<number, string> = {
  1: 'Новая',
  2: 'В ожидании',
  3: 'В работе',
  4: 'Закрыта',
  5: 'Отменена',
};

/** Форматирует значение для отображения */
function formatValue(key: string, value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (key === 'Status' && typeof value === 'number') {
    return STATUS_LABELS[value] ?? String(value);
  }
  if (key === 'GroupId' && typeof value === 'string') {
    return value.slice(0, 8) + '…';
  }
  const s = String(value);
  return s.length > 60 ? `${s.slice(0, 60)}…` : s;
}

/** Преобразует message в текст для отображения */
function formatMessageForDisplay(message: EventMessage): string | null {
  if (!message || typeof message !== 'object') return null;
  const m = message as Record<string, unknown>;
  if ('old' in m && 'new' in m) {
    const oldObj = m.old as Record<string, unknown> | undefined;
    const newObj = m.new as Record<string, unknown> | undefined;
    if (!oldObj || !newObj) return null;
    const parts: string[] = [];
    for (const key of Object.keys(oldObj)) {
      if (key in newObj) {
        const label = FIELD_LABELS[key] ?? key;
        const oldVal = formatValue(key, oldObj[key]);
        const newVal = formatValue(key, newObj[key]);
        parts.push(`${label}: «${oldVal}» → «${newVal}»`);
      }
    }
    return parts.length > 0 ? parts.join('; ') : null;
  }
  if ('text' in m && typeof m.text === 'string') {
    return m.text;
  }
  if ('description' in m && typeof m.description === 'string') {
    return m.description;
  }
  if ('title' in m && typeof m.title === 'string') {
    return m.title;
  }
  return null;
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
                  {ev.message && (() => {
                    const text = formatMessageForDisplay(ev.message);
                    if (!text) return null;
                    return (
                      <div className={activityChainCss.eventDesc}>
                        {text.length > 120 ? `${text.slice(0, 120)}…` : text}
                      </div>
                    );
                  })()}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
