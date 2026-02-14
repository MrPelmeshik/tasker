/**
 * Централизованная конфигурация API и Hub URL.
 * Fallback localhost — только для development; в production задать REACT_APP_API_BASE.
 */

const DEFAULT_API_BASE = 'http://localhost:8080';

export function getApiBase(): string {
  const raw =
    process.env.REACT_APP_API_BASE ||
    (() => {
      if (process.env.NODE_ENV === 'production') {
        console.warn('REACT_APP_API_BASE не задан — проверьте сборку');
      }
      return DEFAULT_API_BASE;
    })();
  return raw.replace(/\/api\/?$/, '') + '/api';
}

export function getHubBase(): string {
  const raw = process.env.REACT_APP_API_BASE || DEFAULT_API_BASE;
  return raw.replace(/\/api\/?$/, '');
}

const HUB_PATH = process.env.REACT_APP_HUB_PATH || '/hubs/tasker';

/** Полный URL SignalR Hub */
export function getHubUrl(): string {
  return `${getHubBase()}${HUB_PATH}`;
}
