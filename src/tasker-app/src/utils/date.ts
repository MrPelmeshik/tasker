/**
 * Форматирование ISO-даты YYYY-MM-DD в DD.MM.YYYY
 */
export function formatDateOnly(isoDate: string): string {
  if (!isoDate || isoDate.length < 10) return isoDate;
  const [y, m, d] = isoDate.slice(0, 10).split('-');
  return `${d}.${m}.${y}`;
}
