/**
 * Форматирование даты (Date или ISO-строка YYYY-MM-DD) в DD.MM.YYYY
 */
export function formatDateOnly(value: string | Date): string {
  const iso = typeof value === 'string' ? value : value.toISOString().slice(0, 10);
  if (!iso || iso.length < 10) return iso;
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${d}.${m}.${y}`;
}

/**
 * Форматирование даты/времени (Date или ISO-строка) в DD.MM.YY HH:mm
 */
export function formatDateTime(value: string | Date): string {
  const d = typeof value === 'string' ? new Date(value) : value;
  if (!(d instanceof Date) || isNaN(d.getTime())) return '';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = String(d.getFullYear()).slice(-2);
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}.${mm}.${yy} ${hh}:${min}`;
}

/**
 * Значение для input[type="datetime-local"] в локальной таймзоне (YYYY-MM-DDTHH:mm).
 */
export function toDateTimeLocalValue(value: string | Date): string {
  const d = typeof value === 'string' ? new Date(value) : value;
  if (!(d instanceof Date) || isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${day}T${hh}:${min}`;
}
