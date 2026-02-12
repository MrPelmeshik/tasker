/**
 * Данные для заголовков дней недели
 */
export interface WeekDayInfo {
  label: string;
  weekdayLong: string;
  date: string;
}

/**
 * Данные для заголовков дней недели (label — краткое, weekdayLong — полное для подсказки)
 */
export function buildWeekDays(isoMonday: string): WeekDayInfo[] {
  const base = new Date(isoMonday + 'T00:00:00Z');
  const weekdayFmt = new Intl.DateTimeFormat('ru-RU', { weekday: 'short' });
  const weekdayLongFmt = new Intl.DateTimeFormat('ru-RU', { weekday: 'long' });
  const dateFmt = new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base);
    d.setUTCDate(d.getUTCDate() + i);
    return {
      label: weekdayFmt.format(d),
      weekdayLong: weekdayLongFmt.format(d),
      date: dateFmt.format(d),
    };
  });
}

/**
 * ISO-дата конца недели (понедельник + 6 дней)
 */
export function getWeekEndIso(isoMonday: string): string {
  const base = new Date(isoMonday + 'T00:00:00Z');
  base.setUTCDate(base.getUTCDate() + 6);
  return base.toISOString().slice(0, 10);
}

/**
 * 7 ISO-дат для выбранной недели
 */
export function buildWeekDates(isoMonday: string): string[] {
  const base = new Date(isoMonday + 'T00:00:00Z');
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base);
    d.setUTCDate(d.getUTCDate() + i);
    return d.toISOString().slice(0, 10);
  });
}
