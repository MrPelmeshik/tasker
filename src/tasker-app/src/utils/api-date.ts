/**
 * Утилиты для работы с датами API.
 * Бэкенд отдаёт DateTimeOffset как ISO 8601 строки — парсим их в Date.
 */

/** Поля с датой/временем в ответах API (соответствуют DateTimeOffset на бэкенде) */
const API_DATE_FIELDS = ['createdAt', 'updatedAt', 'eventDate', 'deactivatedAt'] as const;

/**
 * Парсит ISO 8601 строку в Date.
 * @param value Строка или значение
 * @returns Date или null при невалидном значении
 */
export function parseIsoDate(value: unknown): Date | null {
  if (value == null) return null;
  if (typeof value !== 'string') return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Рекурсивно преобразует строковые даты в объектах API в Date.
 * @param obj Сырой объект из JSON
 * @returns Объект с преобразованными датами
 */
export function parseApiDates<T>(obj: T): T {
  if (obj == null) return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => parseApiDates(item)) as T;
  }

  if (typeof obj === 'object') {
    const result = {} as Record<string, unknown>;
    for (const [key, val] of Object.entries(obj)) {
      if (API_DATE_FIELDS.includes(key as (typeof API_DATE_FIELDS)[number])) {
        const parsed = parseIsoDate(val);
        result[key] = parsed ?? val;
      } else {
        result[key] = parseApiDates(val);
      }
    }
    return result as T;
  }

  return obj;
}

/**
 * Формирует строку YYYY-MM-DD из Date (для сравнения с датами ячеек).
 */
export function toIsoDateString(d: Date): string {
  return d.toISOString().slice(0, 10);
}
