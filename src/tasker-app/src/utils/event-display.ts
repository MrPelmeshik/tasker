import type { EventMessage } from '../types/api';
import { getTaskStatusText } from '../types/task-status';

/** Человекочитаемое название типа события */
export function getEventTypeLabel(eventType: string): string {
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

/** Названия полей для отображения диффа */
const FIELD_LABELS: Record<string, string> = {
  Title: 'Заголовок',
  Description: 'Описание',
  Status: 'Статус',
  GroupId: 'Группа',
};

/** Форматирует значение для отображения */
function formatValue(key: string, value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (key === 'Status' && typeof value === 'number') {
    return getTaskStatusText(value as import('../types/task-status').TaskStatus) ?? String(value);
  }
  if (key === 'GroupId' && typeof value === 'string') {
    return value.slice(0, 8) + '…';
  }
  const s = String(value);
  return s.length > 60 ? `${s.slice(0, 60)}…` : s;
}

/** Преобразует message в текст для отображения */
export function formatMessageForDisplay(message: EventMessage): string | null {
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

/** Типы событий для фильтра (порядок как в EventType enum) */
export const EVENT_TYPES = ['UNKNOWN', 'CREATE', 'UPDATE', 'DELETE', 'NOTE', 'ACTIVITY'] as const;
