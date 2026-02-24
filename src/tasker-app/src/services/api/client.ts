import { getStoredTokens, isAccessTokenExpiredOrMissing, setStoredTokens, clearStoredTokens } from '../storage/token';
import type { ApiResponse, RefreshTokenResponse } from '../../types';
import { parseApiDates } from '../../utils/api-date';
import { logger } from '../../utils/logger';
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
		let errorMessage = `HTTP ${response.status}`;
		try {
			const errorData = await response.json();
			if (errorData) {
				// Try to find a human-readable message
				errorMessage = errorData.message || errorData.title || errorData.error || JSON.stringify(errorData);
				// Handle localized messages or validation errors if any
				if (errorData.errors && typeof errorData.errors === 'object') {
					const validationErrors = Object.values(errorData.errors).flat().join(', ');
					if (validationErrors) {
						errorMessage += `: ${validationErrors}`;
					}
				}
			}
		} catch {
			// If JSON parsing fails, try text
			const textError = await response.text().catch(() => '');
			if (textError) {
				errorMessage = textError;
			}
		}
		throw new Error(errorMessage);
	}

	// Handle 204 No Content or empty body
	if (response.status === 204 || response.headers.get('content-length') === '0') {
		return null as unknown as T;
	}

	try {
		const text = await response.text();
		if (!text) return null as unknown as T;
		const raw = JSON.parse(text);
		return parseApiDates(raw) as T;
	} catch (e) {
		logger.error('Error parsing JSON response', e);
		throw new Error('Invalid JSON response from server');
	}
}
