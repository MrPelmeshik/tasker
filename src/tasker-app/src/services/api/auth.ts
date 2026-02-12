import { apiFetch } from './client';
import type {
  ApiResponse,
  AuthResponse,
  ProfileUpdateRequest,
  RegisterRequest,
  RegisterResponse,
  UserInfo,
} from '../../types';

const API_BASE = process.env.REACT_APP_API_BASE + '/api';

/**
 * Запрос входа
 */
export async function loginRequest(
  username: string,
  password: string
): Promise<ApiResponse<AuthResponse>> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
    credentials: 'include',
  });
  return res.json();
}

/**
 * Запрос регистрации
 */
export async function registerRequest(
  payload: RegisterRequest
): Promise<ApiResponse<RegisterResponse>> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'include',
  });
  return res.json();
}

/**
 * Получить текущего пользователя
 */
export async function getCurrentUser(): Promise<ApiResponse<UserInfo>> {
  return apiFetch<ApiResponse<UserInfo>>('/auth/me');
}

/**
 * Обновить профиль пользователя
 */
export async function updateProfile(
  data: ProfileUpdateRequest
): Promise<ApiResponse<UserInfo>> {
  return apiFetch<ApiResponse<UserInfo>>('/auth/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/**
 * Запрос выхода
 */
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
