/**
 * Маршруты приложения. BASE_PATH задаётся через REACT_APP_BASE_PATH.
 */

/** Fallback базового пути приложения */
export const DEFAULT_BASE_PATH = '/tasker';

const BASE = process.env.REACT_APP_BASE_PATH || DEFAULT_BASE_PATH;

export const ROUTES = {
  HOME: BASE,
  LOGIN: '/login',
  AREA: `${BASE}/area`,
  FOLDER: `${BASE}/folder`,
  TASK: `${BASE}/task`,
} as const;

/** Регулярное выражение для проверки безопасного returnUrl (защита от Open Redirect) */
export const SAFE_RETURN_URL = new RegExp(`^${BASE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(/.*)?$|^/$`);
