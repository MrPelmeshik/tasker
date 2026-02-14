/**
 * Внутренний канал для события очистки токенов.
 * Symbol не экспортируется — внешний код не может сформировать валидный detail.
 * Защита от подделки: все подписчики на AUTH_TOKENS_CLEARED_EVENT должны вызывать
 * isAuthTokensClearedEvent(e) и обрабатывать событие только при true.
 */
const AUTH_TOKENS_CLEARED_KEY = Symbol('auth:tokens-cleared-internal');

export const AUTH_TOKENS_CLEARED_EVENT = 'auth:tokens-cleared' as const;

/** Сформировать detail для события auth:tokens-cleared */
export function createAuthTokensClearedDetail(): { [key: symbol]: true } {
	return { [AUTH_TOKENS_CLEARED_KEY]: true as const };
}

/** Проверить, что событие легитимное (от нашего кода) */
export function isAuthTokensClearedEvent(e: Event): boolean {
	const detail = (e as CustomEvent).detail;
	return detail != null && typeof detail === 'object' && AUTH_TOKENS_CLEARED_KEY in detail && detail[AUTH_TOKENS_CLEARED_KEY] === true;
}
