/**
 * Парсит сообщение об ошибке из API или неизвестного исключения.
 * API может возвращать JSON с полями message или errors[].
 *
 * @param error - Ошибка из catch (Error с message = raw JSON, или другой объект)
 * @returns Человекочитаемое сообщение для отображения
 */
export function parseApiErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    try {
      const parsed = JSON.parse(error.message) as { message?: string; errors?: string[] };
      if (typeof parsed.message === 'string' && parsed.message.trim()) {
        return parsed.message.trim();
      }
      if (Array.isArray(parsed.errors) && parsed.errors.length > 0) {
        const first = parsed.errors[0];
        return typeof first === 'string' ? first : 'Произошла ошибка';
      }
    } catch {
      // message не JSON — использовать как есть
    }
    return error.message;
  }
  if (typeof error === 'string') return error;
  return 'Произошла ошибка';
}
