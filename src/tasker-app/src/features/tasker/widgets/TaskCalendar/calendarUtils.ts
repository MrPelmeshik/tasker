import type { TaskScheduleResponse } from '../../../../types/api';

/**
 * Начало дня календаря (часы)
 */
export const DAY_START_HOUR = 0;

/**
 * Конец дня календаря (часы)
 */
export const DAY_END_HOUR = 24;

/**
 * Общее количество отображаемых часов
 */
export const TOTAL_HOURS = DAY_END_HOUR - DAY_START_HOUR;

/**
 * Дефолтная высота одного часового слота (fallback)
 */
export const HOUR_HEIGHT = 60;

/**
 * Шаг привязки (snap) в минутах
 */
export const SNAP_MINUTES = 15;

/**
 * Размер snap-шага в пикселях для заданного hourHeight
 */
export function snapStep(hourHeight: number): number {
  return (SNAP_MINUTES / 60) * hourHeight;
}

/**
 * Перевод минут (от начала видимого дня) в пиксели
 */
export function timeToPixel(minutes: number, hourHeight: number): number {
  return (minutes / 60) * hourHeight;
}

/**
 * Перевод пикселей в минуты (от начала видимого дня), с привязкой к SNAP_MINUTES
 */
export function pixelToTime(px: number, hourHeight: number): number {
  const raw = (px / hourHeight) * 60;
  return Math.round(raw / SNAP_MINUTES) * SNAP_MINUTES;
}

/**
 * Привязка пиксельной позиции к ближайшему шагу SNAP_MINUTES
 */
export function snapPixel(px: number, hourHeight: number): number {
  const step = snapStep(hourHeight);
  return Math.round(px / step) * step;
}

/**
 * Получить top и height для расписания внутри дня-столбца (с snap).
 */
export function getEntryPosition(
  startAt: Date,
  endAt: Date,
  dayDate: Date,
  hourHeight: number,
): { top: number; height: number } {
  const dayStart = new Date(dayDate);
  dayStart.setHours(DAY_START_HOUR, 0, 0, 0);
  const dayEnd = new Date(dayDate);
  dayEnd.setHours(DAY_END_HOUR, 0, 0, 0);

  const effectiveStart = startAt < dayStart ? dayStart : startAt;
  const effectiveEnd = endAt > dayEnd ? dayEnd : endAt;

  const startMinutes = (effectiveStart.getTime() - dayStart.getTime()) / 60000;
  const endMinutes = (effectiveEnd.getTime() - dayStart.getTime()) / 60000;

  const step = snapStep(hourHeight);
  const rawTop = timeToPixel(startMinutes, hourHeight);
  const rawHeight = timeToPixel(endMinutes - startMinutes, hourHeight);

  return {
    top: snapPixel(rawTop, hourHeight),
    height: Math.max(snapPixel(rawHeight, hourHeight), step),
  };
}

/**
 * Получить массив дат (Date) за неделю, начиная с ISO-даты понедельника.
 */
export function getWeekDays(weekStartIso: string): Date[] {
  const days: Date[] = [];
  const base = new Date(weekStartIso + 'T12:00:00');
  for (let i = 0; i < 7; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    d.setHours(0, 0, 0, 0);
    days.push(d);
  }
  return days;
}

/**
 * Формат даты для заголовка: «Пн 17»
 */
export function formatDayHeader(date: Date): string {
  const weekday = date.toLocaleDateString('ru-RU', { weekday: 'short' });
  const day = date.getDate();
  return `${weekday} ${day}`;
}

/**
 * Формат времени: «09:00»
 */
export function formatHour(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00`;
}

/**
 * ISO-строка даты (YYYY-MM-DD) из Date
 */
export function toDateIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// ---------- Overlap layout ----------

export interface OverlapInfo {
  column: number;
  totalColumns: number;
}

/**
 * Рассчитывает раскладку перекрывающихся записей.
 * Возвращает Map: id записи → { column, totalColumns }.
 */
export function computeOverlapLayout(
  entries: TaskScheduleResponse[],
  dayDate: Date,
  hourHeight: number,
): Map<string, OverlapInfo> {
  if (entries.length === 0) return new Map();

  // Получаем позиции и сортируем по top, затем по высоте (desc)
  const items = entries.map((e) => {
    const pos = getEntryPosition(new Date(e.startAt), new Date(e.endAt), dayDate, hourHeight);
    return { id: e.id, top: pos.top, bottom: pos.top + pos.height };
  });
  items.sort((a, b) => a.top - b.top || (b.bottom - b.top) - (a.bottom - a.top));

  // Жадное назначение колонок
  const columns: { id: string; bottom: number }[][] = [];
  const colMap = new Map<string, number>();

  for (const item of items) {
    let placed = false;
    for (let c = 0; c < columns.length; c++) {
      const last = columns[c][columns[c].length - 1];
      if (last.bottom <= item.top) {
        columns[c].push({ id: item.id, bottom: item.bottom });
        colMap.set(item.id, c);
        placed = true;
        break;
      }
    }
    if (!placed) {
      columns.push([{ id: item.id, bottom: item.bottom }]);
      colMap.set(item.id, columns.length - 1);
    }
  }

  // Для каждой группы перекрывающихся записей определяем totalColumns
  const groups = findOverlapGroups(items);
  const result = new Map<string, OverlapInfo>();

  for (const group of groups) {
    const usedCols = new Set(group.map((i) => colMap.get(i.id)!));
    const totalColumns = usedCols.size;
    for (const item of group) {
      result.set(item.id, { column: colMap.get(item.id)!, totalColumns });
    }
  }

  return result;
}

function findOverlapGroups(items: { id: string; top: number; bottom: number }[]): { id: string; top: number; bottom: number }[][] {
  if (items.length === 0) return [];
  const groups: { id: string; top: number; bottom: number }[][] = [];
  let currentGroup = [items[0]];
  let groupBottom = items[0].bottom;

  for (let i = 1; i < items.length; i++) {
    if (items[i].top < groupBottom) {
      currentGroup.push(items[i]);
      groupBottom = Math.max(groupBottom, items[i].bottom);
    } else {
      groups.push(currentGroup);
      currentGroup = [items[i]];
      groupBottom = items[i].bottom;
    }
  }
  groups.push(currentGroup);
  return groups;
}
