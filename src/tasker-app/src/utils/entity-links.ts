/**
 * Константы путей и утилита формирования shareable-ссылок на сущности.
 * Формат: прямые UUID в URL.
 */

import { ROUTES } from '../config/routes';
import { isValidUuid } from './uuid';

export const PATHS = {
  AREA: ROUTES.AREA,
  FOLDER: ROUTES.FOLDER,
  TASK: ROUTES.TASK,
} as const;

/** Проверить, что строка — валидный UUID */
export function isValidEntityId(id: string): boolean {
  return isValidUuid(id);
}

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
