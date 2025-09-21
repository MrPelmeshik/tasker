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
