const MAX_ERROR_MESSAGE_LENGTH = 500;

function truncateForDisplay(s: string, maxLen: number = MAX_ERROR_MESSAGE_LENGTH): string {
  const trimmed = s.trim();
  return trimmed.length <= maxLen ? trimmed : trimmed.slice(0, maxLen) + '…';
}

/**
 * Парсит сообщение об ошибке из API или неизвестного исключения.
 * API может возвращать JSON с полями message или errors[].
 * Результат ограничен 500 символами для защиты UI от переполнения.
 *
 * @param error - Ошибка из catch (Error с message = raw JSON, или другой объект)
 * @returns Человекочитаемое сообщение для отображения
 */
export function parseApiErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    try {
      const parsed = JSON.parse(error.message) as { message?: string; errors?: string[] };
      if (typeof parsed.message === 'string' && parsed.message.trim()) {
        return truncateForDisplay(parsed.message.trim());
      }
      if (Array.isArray(parsed.errors) && parsed.errors.length > 0) {
        const first = parsed.errors[0];
        return truncateForDisplay(typeof first === 'string' ? first : 'Произошла ошибка');
      }
    } catch {
      // message не JSON — использовать как есть
    }
    return truncateForDisplay(error.message);
  }
  if (typeof error === 'string') return truncateForDisplay(error);
  return 'Произошла ошибка';
}
