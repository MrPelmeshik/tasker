/**
 * Утилиты для виджета дерева (DnD, поиск папок, парсинг drop-целей, фильтрация и сортировка).
 */

import { pointerWithin, rectIntersection } from '@dnd-kit/core';
import type { FolderSummary, TaskSummary } from '../../../../types';
import type { TaskStatus } from '../../../../types/task-status';

/** Собирает все ID потомков папки из загруженных данных */
export function getDescendantFolderIds(
  folderId: string,
  foldersByParent: Map<string, FolderSummary[]>
): Set<string> {
  const result = new Set<string>();
  const queue = [folderId];
  while (queue.length > 0) {
    const id = queue.shift()!;
    const children = foldersByParent.get(id) ?? [];
    for (const c of children) {
      result.add(c.id);
      queue.push(c.id);
    }
  }
  return result;
}

/** Коллизия: pointerWithin для точности, rectIntersection как fallback (без closestCenter — он «примагничивает» к соседним элементам) */
export function collisionDetection(args: Parameters<typeof pointerWithin>[0]) {
  const pointerCollisions = pointerWithin(args);
  if (pointerCollisions.length > 0) return pointerCollisions;
  return rectIntersection(args);
}

/** Полезная нагрузка для перетаскиваемого элемента */
export type DragPayload = { type: string; folder?: FolderSummary; task?: TaskSummary };

/** Проверяет, можно ли переместить перетаскиваемый элемент в целевой droppable */
export function isValidDrop(
  payload: DragPayload | null | undefined,
  overId: string,
  foldersByArea: Map<string, FolderSummary[]>,
  foldersByParent: Map<string, FolderSummary[]>
): boolean {
  if (!payload) return false;
  const { type, folder } = payload;

  if (type === 'task') return true;

  if (type === 'folder' && folder) {
    if (overId.startsWith('area-root-') || overId.startsWith('area-empty-')) {
      const areaId = overId.replace('area-root-', '').replace('area-empty-', '');
      return folder.areaId === areaId;
    }
    if (overId.startsWith('folder-') || overId.startsWith('folder-empty-')) {
      const targetFolderId = overId.replace('folder-empty-', '').replace('folder-', '');
      if (folder.id === targetFolderId) return false;
      const descendants = getDescendantFolderIds(folder.id, foldersByParent);
      if (descendants.has(targetFolderId)) return false;
      const targetFolder = findFolderById(targetFolderId, foldersByArea, foldersByParent);
      return targetFolder ? folder.areaId === targetFolder.areaId : false;
    }
  }
  return false;
}

/** Находит папку по ID среди загруженных данных */
export function findFolderById(
  folderId: string,
  foldersByArea: Map<string, FolderSummary[]>,
  foldersByParent: Map<string, FolderSummary[]>
): FolderSummary | undefined {
  for (const folders of Array.from(foldersByArea.values()).concat(Array.from(foldersByParent.values()))) {
    const found = folders.find((f: FolderSummary) => f.id === folderId);
    if (found) return found;
  }
  return undefined;
}

/** Парсит ID droppable и возвращает целевые areaId и parentFolderId */
export function parseDropTarget(
  overId: string,
  foldersByArea: Map<string, FolderSummary[]>,
  foldersByParent: Map<string, FolderSummary[]>
): { areaId: string; parentFolderId: string | null } | null {
  if (overId.startsWith('area-root-') || overId.startsWith('area-empty-')) {
    const areaId = overId.replace('area-root-', '').replace('area-empty-', '');
    return { areaId, parentFolderId: null };
  }
  if (overId.startsWith('folder-') || overId.startsWith('folder-empty-')) {
    const folderId = overId.replace('folder-empty-', '').replace('folder-', '');
    const folder = findFolderById(folderId, foldersByArea, foldersByParent);
    return folder ? { areaId: folder.areaId, parentFolderId: folderId } : null;
  }
  return null;
}

/** Пресеты сортировки задач в дереве */
export type TreeSortPreset =
  | 'statusAscAlpha'
  | 'statusDescAlpha'
  | 'alpha'
  | 'alphaDesc'
  | 'createdAtAsc'
  | 'createdAtDesc'
  | 'updatedAtAsc'
  | 'updatedAtDesc';

/** Приоритет статусов: активные первыми (InProgress → Pending → New → Closed → Cancelled) */
const STATUS_PRIORITY_ORDER: TaskStatus[] = [
  3 /* InProgress */,
  2 /* Pending */,
  1 /* New */,
  4 /* Closed */,
  5 /* Cancelled */,
];

/** Получить индекс приоритета статуса (меньше = выше приоритет) */
function getStatusPriority(status: number): number {
  const idx = STATUS_PRIORITY_ORDER.indexOf(status as TaskStatus);
  return idx >= 0 ? idx : STATUS_PRIORITY_ORDER.length;
}

/**
 * Фильтрует задачи по включённым статусам.
 * @param tasks - исходный массив задач
 * @param enabledStatuses - множество статусов, которые нужно оставить
 */
export function filterTasksByStatus(
  tasks: TaskSummary[],
  enabledStatuses: Set<TaskStatus>
): TaskSummary[] {
  if (enabledStatuses.size === 0) return [];
  return tasks.filter((t) => enabledStatuses.has((t.status as TaskStatus) ?? 0));
}

/**
 * Сортирует задачи по заданному пресету.
 * @param tasks - исходный массив задач
 * @param preset - пресет сортировки
 */
export function sortTasks(tasks: TaskSummary[], preset: TreeSortPreset): TaskSummary[] {
  const result = [...tasks];

  switch (preset) {
    case 'statusAscAlpha':
      result.sort((a, b) => {
        const pa = getStatusPriority(a.status);
        const pb = getStatusPriority(b.status);
        if (pa !== pb) return pa - pb;
        return (a.title ?? '').localeCompare(b.title ?? '', undefined, { sensitivity: 'base' });
      });
      break;
    case 'statusDescAlpha':
      result.sort((a, b) => {
        const pa = getStatusPriority(a.status);
        const pb = getStatusPriority(b.status);
        if (pa !== pb) return pa - pb;
        return (b.title ?? '').localeCompare(a.title ?? '', undefined, { sensitivity: 'base' });
      });
      break;
    case 'alpha':
      result.sort((a, b) =>
        (a.title ?? '').localeCompare(b.title ?? '', undefined, { sensitivity: 'base' })
      );
      break;
    case 'alphaDesc':
      result.sort((a, b) =>
        (b.title ?? '').localeCompare(a.title ?? '', undefined, { sensitivity: 'base' })
      );
      break;
    case 'createdAtAsc':
      result.sort((a, b) => {
        const da = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
        const db = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
        return da - db;
      });
      break;
    case 'createdAtDesc':
      result.sort((a, b) => {
        const da = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
        const db = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
        return db - da;
      });
      break;
    case 'updatedAtAsc':
      result.sort((a, b) => {
        const da = a.updatedAt instanceof Date ? a.updatedAt.getTime() : 0;
        const db = b.updatedAt instanceof Date ? b.updatedAt.getTime() : 0;
        return da - db;
      });
      break;
    case 'updatedAtDesc':
      result.sort((a, b) => {
        const da = a.updatedAt instanceof Date ? a.updatedAt.getTime() : 0;
        const db = b.updatedAt instanceof Date ? b.updatedAt.getTime() : 0;
        return db - da;
      });
      break;
    default:
      break;
  }

  return result;
}

/** Метаданные пресетов для UI */
export const TREE_SORT_PRESET_OPTIONS: { value: TreeSortPreset; label: string }[] = [
  { value: 'statusAscAlpha', label: 'По статусу (активные первыми), A→Z' },
  { value: 'statusDescAlpha', label: 'По статусу (активные первыми), Z→A' },
  { value: 'alpha', label: 'По алфавиту A→Z' },
  { value: 'alphaDesc', label: 'По алфавиту Z→A' },
  { value: 'createdAtAsc', label: 'По дате создания ↑' },
  { value: 'createdAtDesc', label: 'По дате создания ↓' },
  { value: 'updatedAtAsc', label: 'По дате изменения ↑' },
  { value: 'updatedAtDesc', label: 'По дате изменения ↓' },
];
