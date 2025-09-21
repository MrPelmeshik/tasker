import { safeLocalStorage } from './index';

const USER_NAME_KEY = 'userName';

export function getStoredUserName(): string | null {
  const value = safeLocalStorage.getItem(USER_NAME_KEY);
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function setStoredUserName(userName: string): void {
  safeLocalStorage.setItem(USER_NAME_KEY, userName);
}

export function clearStoredUser(): void {
  safeLocalStorage.removeItem(USER_NAME_KEY);
}


