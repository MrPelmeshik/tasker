import { getStoredTokens, isAccessTokenExpiredOrMissing, setStoredTokens, clearStoredTokens } from '../storage/token';
import type { ApiResponse, RefreshTokenResponse } from '../../types';
import { parseApiDates } from '../../utils/api-date';
import {
	AUTH_TOKENS_CLEARED_EVENT,
	createAuthTokensClearedDetail,
} from './auth-events';
import { getApiBase } from '../../config/api';

const API_BASE = getApiBase();

let refreshPromise: Promise<boolean> | null = null;

async function doRefreshAccessToken(): Promise<boolean> {
	try {
		const res = await fetch(`${API_BASE}/auth/refresh`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({}),
			credentials: 'include',
		});
		if (!res.ok) return false;
		const json = (await res.json()) as ApiResponse<RefreshTokenResponse>;
		if (!json.success || !json.data) return false;
		setStoredTokens({
			accessToken: json.data.accessToken,
			expiresInSeconds: json.data.expiresIn,
		});
		return true;
	} catch {
		return false;
	}
}

/**
 * Обновить access token через refresh (HttpOnly cookie).
 * Дедупликация: параллельные вызовы используют один и тот же Promise —
 * при одновременном refresh от нескольких apiFetch выполняется только один запрос.
 * @returns true если токен успешно обновлён
 */
export async function refreshAccessToken(): Promise<boolean> {
	if (refreshPromise) return refreshPromise;
	refreshPromise = doRefreshAccessToken();
	try {
		const ok = await refreshPromise;
		if (!ok) {
			clearStoredTokens();
			window.dispatchEvent(
				new CustomEvent(AUTH_TOKENS_CLEARED_EVENT, { detail: createAuthTokensClearedDetail() }),
			);
		}
		return ok;
	} finally {
		refreshPromise = null;
	}
}

/**
 * Убедиться, что access token актуален. При истечении вызывает refresh.
 * При неудаче refresh — clearStoredTokens() и auth:tokens-cleared (в refreshAccessToken).
 * @returns true если токен готов к использованию
 */
export async function ensureAccessTokenFresh(): Promise<boolean> {
	if (!isAccessTokenExpiredOrMissing()) return true;
	return refreshAccessToken();
}

/**
 * Выполняет fetch к API с автоматическим refresh при 401 (только для GET/HEAD).
 * Поддерживает AbortSignal из init для отмены при размонтировании компонента.
 */
export async function apiFetch<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
	let headers = new Headers(init?.headers || {});
	headers.set('Accept', 'application/json');
	if (!headers.has('Content-Type') && init?.body && !(init.body instanceof FormData)) {
		headers.set('Content-Type', 'application/json');
	}
	let token = getStoredTokens()?.accessToken || null;
	if (!token || isAccessTokenExpiredOrMissing()) {
		await refreshAccessToken();
		token = getStoredTokens()?.accessToken || null;
	}
	if (token) headers.set('Authorization', `Bearer ${token}`);

	const doFetch = async (): Promise<Response> => {
		const url = typeof input === 'string' ? `${API_BASE}${input}` : input;
		return fetch(url, {
			...init,
			headers,
			credentials: init?.credentials ?? 'include',
		});
	};

	let response = await doFetch();
	if (response.status === 401) {
		const method = (init?.method || 'GET').toUpperCase();
		const isSafeToRetry = method === 'GET' || method === 'HEAD';
		if (isSafeToRetry) {
			const refreshed = await refreshAccessToken();
			if (refreshed) {
				const newHeaders = new Headers(headers);
				const newToken = getStoredTokens()?.accessToken;
				if (newToken) newHeaders.set('Authorization', `Bearer ${newToken}`);
				response = await fetch(typeof input === 'string' ? `${API_BASE}${input}` : input, {
					...init,
					headers: newHeaders,
					credentials: init?.credentials ?? 'include',
				});
			}
		}
	}

	if (!response.ok) {
		const text = await response.text().catch(() => '');
		throw new Error(text || `HTTP ${response.status}`);
	}

	const raw = await response.json();
	return parseApiDates(raw) as T;
}
