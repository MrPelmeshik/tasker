/**
 * Утилиты для виджета дерева (DnD, поиск папок, парсинг drop-целей).
 */

import { pointerWithin, rectIntersection } from '@dnd-kit/core';
import type { FolderSummary, TaskSummary } from '../../../../types';

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
