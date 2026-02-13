import { getStoredTokens, isAccessTokenExpiredOrMissing, setStoredTokens, clearStoredTokens } from '../storage/token';
import type { ApiResponse, RefreshTokenResponse } from '../../types';
import { parseApiDates } from '../../utils/api-date';

const API_BASE =
  (process.env.REACT_APP_API_BASE ||
    (() => {
      if (process.env.NODE_ENV === 'production') {
        console.warn('REACT_APP_API_BASE не задан, используется localhost — проверьте сборку');
      }
      return 'http://localhost:8080';
    })()) +
  '/api';

/**
 * Обновить access token через refresh (HttpOnly cookie).
 * @returns true если токен успешно обновлён
 */
export async function refreshAccessToken(): Promise<boolean> {
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
 * Убедиться, что access token актуален. При истечении вызывает refresh.
 * При неудаче refresh — clearStoredTokens().
 * @returns true если токен готов к использованию
 */
export async function ensureAccessTokenFresh(): Promise<boolean> {
	if (!isAccessTokenExpiredOrMissing()) return true;
	const ok = await refreshAccessToken();
	if (!ok) {
		clearStoredTokens();
		return false;
	}
	return true;
}

export async function apiFetch<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
	let headers = new Headers(init?.headers || {});
	headers.set('Accept', 'application/json');
	if (!headers.has('Content-Type') && init?.body) {
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
		} else {
			clearStoredTokens();
		}
	}

	if (!response.ok) {
		const text = await response.text().catch(() => '');
		throw new Error(text || `HTTP ${response.status}`);
	}

	const raw = await response.json();
	return parseApiDates(raw) as T;
}
