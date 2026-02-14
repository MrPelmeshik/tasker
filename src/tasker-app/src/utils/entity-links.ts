/**
 * Константы путей и утилита формирования shareable-ссылок на сущности.
 * Формат: прямые UUID в URL.
 */

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Проверить, что строка — валидный UUID */
export function isValidEntityId(id: string): boolean {
  return UUID_REGEX.test(id);
}

export const PATHS = {
  AREA: '/tasker/area',
  FOLDER: '/tasker/folder',
  TASK: '/tasker/task',
} as const;

export type EntityType = 'area' | 'folder' | 'task';

/**
 * Формирует полный URL для shareable-ссылки на сущность.
 * @param type - тип сущности (area, folder, task)
 * @param id - UUID сущности
 * @returns полный URL (origin + путь)
 */
export function buildEntityUrl(type: EntityType, id: string): string {
  const base = typeof window !== 'undefined' ? window.location.origin : '';
  const path = type === 'area' ? PATHS.AREA : type === 'folder' ? PATHS.FOLDER : PATHS.TASK;
  return `${base}${path}/${id}`;
}
