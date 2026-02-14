import { safeSessionStorage } from './index';

const ACCESS_KEY = 'auth.accessToken';
const EXPIRES_AT_KEY = 'auth.expiresAt'; // epoch ms when access token expires

export type StoredTokens = {
	accessToken: string;
	expiresAt: number; // epoch ms
};

export function getStoredTokens(): StoredTokens | null {
	const accessToken = safeSessionStorage.getItem(ACCESS_KEY);
	const expiresAtStr = safeSessionStorage.getItem(EXPIRES_AT_KEY);
	if (!accessToken || !expiresAtStr) return null;
	const expiresAt = Number(expiresAtStr);
	if (!Number.isFinite(expiresAt)) return null;
	return { accessToken, expiresAt };
}

export function setStoredTokens(tokens: { accessToken: string; expiresInSeconds: number }): void {
	const now = Date.now();
	const expiresAt = now + tokens.expiresInSeconds * 1000 - 5000; // small skew
	safeSessionStorage.setItem(ACCESS_KEY, tokens.accessToken);
	safeSessionStorage.setItem(EXPIRES_AT_KEY, String(expiresAt));
}

export function clearStoredTokens(): void {
	safeSessionStorage.removeItem(ACCESS_KEY);
	safeSessionStorage.removeItem(EXPIRES_AT_KEY);
}

export function isAccessTokenExpiredOrMissing(): boolean {
	const t = getStoredTokens();
	if (!t) return true;
	return Date.now() >= t.expiresAt;
}

/** Оставшееся время до истечения в мс, или null если нет токена */
export function getMillisUntilExpiry(): number | null {
	const t = getStoredTokens();
	if (!t) return null;
	const remaining = t.expiresAt - Date.now();
	return remaining > 0 ? remaining : 0;
}

const REFRESH_BUFFER_MIN = 2;
const REFRESH_BUFFER_MAX = 15;
const REFRESH_BUFFER_DEFAULT = 5;

/** Буфер в минутах для proactive refresh (2–15, по умолчанию 5) */
export function getRefreshBufferMinutes(): number {
	const env = process.env.REACT_APP_TOKEN_REFRESH_BUFFER_MINUTES;
	if (!env) return REFRESH_BUFFER_DEFAULT;
	const parsed = Number.parseInt(env, 10);
	if (!Number.isFinite(parsed)) return REFRESH_BUFFER_DEFAULT;
	return Math.max(REFRESH_BUFFER_MIN, Math.min(REFRESH_BUFFER_MAX, parsed));
}

/** true если токен истечёт в течение minutes минут */
export function isTokenExpiringWithin(minutes: number): boolean {
	const t = getStoredTokens();
	if (!t) return true;
	const bufferMs = minutes * 60 * 1000;
	return Date.now() >= t.expiresAt - bufferMs;
}
