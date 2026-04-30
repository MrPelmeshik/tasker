/**
 * <summary>
 * Построение плоского списка строк таблицы активностей: области, папки (с агрегатом при свёрнутом узле), задачи.
 * </summary>
 */

import type { TaskDayActivity } from '../../../../types/api';
import type { TaskRow } from './taskTableUtils';
import { sortTaskRows } from './taskTableUtils';
import type { TreeSortPreset } from '../Tree/treeUtils';
import type { FolderIndex } from './taskTableFolderIndex';
import {
  getChildFolderIdsFromIndex,
  collectDescendantFolderIdsIncludingSelf,
} from './taskTableFolderIndex';

/** Группа по области для построения иерархии (совместимо с GroupedTaskRows). */
export type HierarchyAreaGroup = {
  areaId: string;
  areaTitle: string;
  areaColor?: string;
  rows: TaskRow[];
};

/** Агрегированные метрики для области / свёрнутой папки */
export type AggregatedTaskRowMetrics = {
  days: TaskDayActivity[];
  carryWeeks: number;
  hasFutureActivities: boolean;
  pastEventTypes: number[];
  futureEventTypes: number[];
};

/** Строка отображения таблицы активностей */
export type TaskTableDisplayRow =
  | {
      kind: 'area_collapsed';
      areaId: string;
      areaTitle: string;
      areaColor?: string;
      metrics: AggregatedTaskRowMetrics;
    }
  | {
      kind: 'folder';
      areaId: string;
      folderId: string;
      title: string;
      depth: number;
      customColor?: string | null;
      collapsed: boolean;
      /** null если папка раскрыта — ячейки дней без теплокарты */
      metrics: AggregatedTaskRowMetrics | null;
      /** Для FolderCardLink: видимые дочерние папки и задачи в поддереве */
      subfoldersCount: number;
      tasksCount: number;
    }
  | { kind: 'task'; areaId: string; depth: number; row: TaskRow };

/**
 * Объединяет метрики нескольких строк задач (одинаковый порядок дней).
 */
export function aggregateTaskRows(rows: TaskRow[]): AggregatedTaskRowMetrics {
  if (rows.length === 0) {
    return {
      days: [],
      carryWeeks: 0,
      hasFutureActivities: false,
      pastEventTypes: [],
      futureEventTypes: [],
    };
  }
  const nDays = rows[0].days.length;
  const days: TaskDayActivity[] = [];
  for (let i = 0; i < nDays; i++) {
    const date = rows[0].days[i].date;
    let count = 0;
    const events: { id: string; eventType: number }[] = [];
    for (const r of rows) {
      const d = r.days[i];
      count += d.count;
      if (d.events?.length) events.push(...d.events);
    }
    days.push({ date, count, events: events.length ? events : undefined });
  }
  const carryWeeks = rows.some((r) => r.carryWeeks > 0) ? 1 : 0;
  const hasFutureActivities = rows.some((r) => r.hasFutureActivities);
  const past = new Set<number>();
  const fut = new Set<number>();
  for (const r of rows) {
    r.pastEventTypes.forEach((t) => past.add(t));
    r.futureEventTypes.forEach((t) => fut.add(t));
  }
  return {
    days,
    carryWeeks,
    hasFutureActivities,
    pastEventTypes: Array.from(past),
    futureEventTypes: Array.from(fut),
  };
}

function taskRowsInFolderSubtree(
  folderId: string,
  areaId: string,
  taskRowsInArea: TaskRow[],
  idx: FolderIndex
): TaskRow[] {
  const desc = collectDescendantFolderIdsIncludingSelf(folderId, areaId, idx);
  return taskRowsInArea.filter((r) => r.task.folderId && desc.has(r.task.folderId));
}

function folderHasVisibleTasks(
  folderId: string,
  areaId: string,
  taskRowsInArea: TaskRow[],
  idx: FolderIndex,
  memo: Map<string, boolean>
): boolean {
  const k = `${areaId}:${folderId}`;
  if (memo.has(k)) return memo.get(k)!;
  const direct = taskRowsInArea.some((r) => r.task.folderId === folderId);
  if (direct) {
    memo.set(k, true);
    return true;
  }
  for (const cid of getChildFolderIdsFromIndex(folderId, areaId, idx)) {
    if (folderHasVisibleTasks(cid, areaId, taskRowsInArea, idx, memo)) {
      memo.set(k, true);
      return true;
    }
  }
  memo.set(k, false);
  return false;
}

function emitFolderAndChildren(
  folderId: string,
  areaId: string,
  depth: number,
  taskRowsInArea: TaskRow[],
  idx: FolderIndex,
  sortPreset: TreeSortPreset,
  expandedFolders: Set<string>,
  out: TaskTableDisplayRow[],
  memoFolder: Map<string, boolean>,
  displayedTaskIds: Set<string>
): void {
  const meta = idx.folderById.get(folderId);
  const title = meta?.title ?? folderId;
  const customColor = meta?.customColor ?? null;
  const collapsed = !expandedFolders.has(folderId);
  const subtreeTasks = taskRowsInFolderSubtree(folderId, areaId, taskRowsInArea, idx);
  const childFolders = getChildFolderIdsFromIndex(folderId, areaId, idx);
  const visibleChildFolders = childFolders.filter((cf) =>
    folderHasVisibleTasks(cf, areaId, taskRowsInArea, idx, memoFolder)
  );

  if (collapsed) {
    for (const t of subtreeTasks) {
      displayedTaskIds.add(t.taskId);
    }
    out.push({
      kind: 'folder',
      areaId,
      folderId,
      title,
      depth,
      customColor,
      collapsed: true,
      metrics: aggregateTaskRows(subtreeTasks),
      subfoldersCount: visibleChildFolders.length,
      tasksCount: subtreeTasks.length,
    });
    return;
  }

  out.push({
    kind: 'folder',
    areaId,
    folderId,
    title,
    depth,
    customColor,
    collapsed: false,
    metrics: null,
    subfoldersCount: visibleChildFolders.length,
    tasksCount: subtreeTasks.length,
  });

  for (const cf of childFolders) {
    if (!folderHasVisibleTasks(cf, areaId, taskRowsInArea, idx, memoFolder)) continue;
    emitFolderAndChildren(cf, areaId, depth + 1, taskRowsInArea, idx, sortPreset, expandedFolders, out, memoFolder, displayedTaskIds);
  }

  const directTasks = taskRowsInArea.filter((r) => r.task.folderId === folderId);
  const sortedDirect = sortTaskRows(directTasks, sortPreset);
  for (const tr of sortedDirect) {
    displayedTaskIds.add(tr.taskId);
    out.push({ kind: 'task', areaId, depth: depth + 1, row: tr });
  }
}

/**
 * Строит плоский список строк для tbody с учётом раскрытия областей и папок.
 */
export function buildTaskTableDisplayRows(
  grouped: HierarchyAreaGroup[],
  folderIndex: FolderIndex,
  expandedAreas: Set<string>,
  expandedFolders: Set<string>,
  sortPreset: TreeSortPreset,
  forceExpandAll: boolean
): TaskTableDisplayRow[] {
  const allAreaIds = new Set(grouped.map((g) => g.areaId));
  const allFolderIdsInTableAreas = new Set<string>();
  for (const m of Array.from(folderIndex.folderById.values())) {
    if (allAreaIds.has(m.areaId)) allFolderIdsInTableAreas.add(m.id);
  }

  const effAreas = forceExpandAll ? allAreaIds : expandedAreas;
  const effFolders = forceExpandAll ? allFolderIdsInTableAreas : expandedFolders;

  const result: TaskTableDisplayRow[] = [];

  for (const group of grouped) {
    const { areaId, areaTitle, areaColor, rows: taskRowsInArea } = group;
    if (taskRowsInArea.length === 0) continue;

    if (!effAreas.has(areaId)) {
      result.push({
        kind: 'area_collapsed',
        areaId,
        areaTitle,
        areaColor,
        metrics: aggregateTaskRows(taskRowsInArea),
      });
      continue;
    }

    const displayedTaskIds = new Set<string>();
    const memoFolder = new Map<string, boolean>();
    const rootFolders = getChildFolderIdsFromIndex(null, areaId, folderIndex);
    for (const fid of rootFolders) {
      if (!folderHasVisibleTasks(fid, areaId, taskRowsInArea, folderIndex, memoFolder)) continue;
      emitFolderAndChildren(
        fid,
        areaId,
        0,
        taskRowsInArea,
        folderIndex,
        sortPreset,
        effFolders,
        result,
        memoFolder,
        displayedTaskIds
      );
    }

    const rootTasks = taskRowsInArea.filter((r) => !r.task.folderId);
    const sortedRoots = sortTaskRows(rootTasks, sortPreset);
    for (const tr of sortedRoots) {
      displayedTaskIds.add(tr.taskId);
      result.push({ kind: 'task', areaId, depth: 0, row: tr });
    }

    /** Задачи вне известной иерархии папок (удалённая папка и т.п.) */
    const orphans = taskRowsInArea.filter((r) => !displayedTaskIds.has(r.taskId));
    if (orphans.length > 0) {
      for (const tr of sortTaskRows(orphans, sortPreset)) {
        result.push({ kind: 'task', areaId, depth: 0, row: tr });
      }
    }
  }

  return result;
}
