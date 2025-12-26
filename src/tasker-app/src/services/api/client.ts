import { getStoredTokens, isAccessTokenExpiredOrMissing, setStoredTokens, clearStoredTokens } from '../storage/token';
import type { ApiResponse, AuthResponse, RefreshTokenResponse, RegisterRequest, RegisterResponse } from '../../types';

const API_BASE = process.env.REACT_APP_API_BASE + '/api';

async function refreshAccessToken(): Promise<boolean> {
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
		return fetch(typeof input === 'string' ? `${API_BASE}${input}` : input, { ...init, headers });
	};

	let response = await doFetch();
	if (response.status === 401) {
		const refreshed = await refreshAccessToken();
		if (refreshed) {
			const newHeaders = new Headers(headers);
			const newToken = getStoredTokens()?.accessToken;
			if (newToken) newHeaders.set('Authorization', `Bearer ${newToken}`);
			response = await fetch(typeof input === 'string' ? `${API_BASE}${input}` : input, { ...init, headers: newHeaders });
		} else {
			clearStoredTokens();
		}
	}

	if (!response.ok) {
		const text = await response.text().catch(() => '');
		throw new Error(text || `HTTP ${response.status}`);
	}

	return (await response.json()) as T;
}

export async function loginRequest(username: string, password: string): Promise<ApiResponse<AuthResponse>> {
	const res = await fetch(`${API_BASE}/auth/login`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ username, password }),
		credentials: 'include',
	});
	return res.json();
}

export async function registerRequest(payload: RegisterRequest): Promise<ApiResponse<RegisterResponse>> {
	const res = await fetch(`${API_BASE}/auth/register`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload),
		credentials: 'include',
	});
	return res.json();
}

export async function logoutRequest(): Promise<void> {
	try {
		await fetch(`${API_BASE}/auth/logout`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({}),
			credentials: 'include',
		});
	} catch {
		// ignore
	}
}
