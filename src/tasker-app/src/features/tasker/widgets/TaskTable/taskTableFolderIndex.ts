import type { FolderResponse } from '../../../../types/api';

/**
 * <summary>
 * Индексация плоского списка папок (fetchFolders) для обхода дерева внутри области в таблице активностей.
 * </summary>
 */

/** Метаданные папки для таблицы и иерархии */
export type FolderTableMeta = {
  id: string;
  title: string;
  areaId: string;
  parentFolderId: string | null;
  customColor?: string | null;
};

/** Индексы по списку папок с API */
export type FolderIndex = {
  /** id → метаданные */
  folderById: Map<string, FolderTableMeta>;
  /** id дочерних папок для данного родителя (null = корень области) */
  childFolderIdsByParent: Map<string | null, Map<string, string[]>>;
};

/**
 * Строит индексы по ответу fetchFolders для обхода дерева внутри области.
 */
export function buildFolderIndex(folders: FolderResponse[]): FolderIndex {
  const folderById = new Map<string, FolderTableMeta>();
  const childFolderIdsByParent = new Map<string | null, Map<string, string[]>>();

  for (const f of folders) {
    if (!f.isActive) continue;
    folderById.set(f.id, {
      id: f.id,
      title: f.title,
      areaId: f.areaId,
      parentFolderId: f.parentFolderId ?? null,
      customColor: f.customColor ?? null,
    });
  }

  for (const meta of Array.from(folderById.values())) {
    const pid = meta.parentFolderId;
    const aid = meta.areaId;
    if (!childFolderIdsByParent.has(pid)) {
      childFolderIdsByParent.set(pid, new Map());
    }
    const byArea = childFolderIdsByParent.get(pid)!;
    if (!byArea.has(aid)) {
      byArea.set(aid, []);
    }
    byArea.get(aid)!.push(meta.id);
  }

  for (const m of Array.from(childFolderIdsByParent.values())) {
    for (const [, ids] of Array.from(m.entries())) {
      ids.sort((a: string, b: string) => {
        const ta = folderById.get(a)?.title ?? '';
        const tb = folderById.get(b)?.title ?? '';
        return ta.localeCompare(tb, undefined, { sensitivity: 'base' });
      });
    }
  }

  return { folderById, childFolderIdsByParent };
}

/** Дочерние папки у родителя внутри области (корень: parentId = null). */
export function getChildFolderIdsFromIndex(
  parentId: string | null,
  areaId: string,
  idx: FolderIndex
): string[] {
  return idx.childFolderIdsByParent.get(parentId)?.get(areaId) ?? [];
}

/** Все id папок в поддереве (включая корень), только в рамках одной области. */
export function collectDescendantFolderIdsIncludingSelf(
  folderId: string,
  areaId: string,
  idx: FolderIndex
): Set<string> {
  const out = new Set<string>();
  const stack = [folderId];
  while (stack.length) {
    const id = stack.pop()!;
    if (out.has(id)) continue;
    out.add(id);
    for (const k of getChildFolderIdsFromIndex(id, areaId, idx)) {
      stack.push(k);
    }
  }
  return out;
}

/**
 * Возвращает множество id папок — предков для каждого folderId задачи (включая саму папку).
 */
export function collectAncestorFolderIds(
  folderId: string | null | undefined,
  folderById: Map<string, FolderTableMeta>
): Set<string> {
  const out = new Set<string>();
  let cur: string | null | undefined = folderId ?? null;
  const guard = new Set<string>();
  while (cur) {
    if (guard.has(cur)) break;
    guard.add(cur);
    out.add(cur);
    const meta = folderById.get(cur);
    cur = meta?.parentFolderId ?? null;
  }
  return out;
}

/**
 * Все id папок, релевантных для набора задач (предки + сами папки из folderId).
 */
export function relevantFolderIdsForTasks(
  taskFolderIds: Iterable<string | null | undefined>,
  folderById: Map<string, FolderTableMeta>
): Set<string> {
  const all = new Set<string>();
  for (const fid of Array.from(taskFolderIds)) {
    for (const a of Array.from(collectAncestorFolderIds(fid, folderById))) {
      all.add(a);
    }
  }
  return all;
}
