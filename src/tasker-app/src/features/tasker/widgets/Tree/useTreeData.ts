/**
 * Состояние и загрузка данных для виджета дерева.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchAreaShortCard,
  fetchRootFoldersByArea,
  fetchChildFolders,
  fetchTaskSummaryByFolder,
  fetchTaskSummaryByAreaRoot,
} from '../../../../services/api';
import { parseApiErrorMessage } from '../../../../utils/parse-api-error';
import { findFolderById } from './treeUtils';
import type { AreaShortCard, FolderSummary, TaskSummary } from '../../../../types';

export interface UseTreeDataOptions {
  addError: (message: string) => void;
  subscribeToTaskUpdates: (callback: () => void) => () => void;
}

export function useTreeData({ addError, subscribeToTaskUpdates }: UseTreeDataOptions) {
  const [areas, setAreas] = useState<AreaShortCard[]>([]);
  const [foldersByArea, setFoldersByArea] = useState<Map<string, FolderSummary[]>>(new Map());
  const [foldersByParent, setFoldersByParent] = useState<Map<string, FolderSummary[]>>(new Map());
  const [tasksByArea, setTasksByArea] = useState<Map<string, TaskSummary[]>>(new Map());
  const [tasksByFolder, setTasksByFolder] = useState<Map<string, TaskSummary[]>>(new Map());
  const [expandedAreas, setExpandedAreas] = useState<Set<string>>(new Set());
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [loadingContent, setLoadingContent] = useState<Set<string>>(new Set());

  const expandedAreasRef = useRef(expandedAreas);
  const expandedFoldersRef = useRef(expandedFolders);
  const foldersByAreaRef = useRef(foldersByArea);
  const foldersByParentRef = useRef(foldersByParent);
  expandedAreasRef.current = expandedAreas;
  expandedFoldersRef.current = expandedFolders;
  foldersByAreaRef.current = foldersByArea;
  foldersByParentRef.current = foldersByParent;

  /** Сортировка по title A→Z (области и папки всегда в алфавитном порядке) */
  const sortByTitle = useCallback(<T extends { title?: string }>(items: T[]): T[] => {
    return [...items].sort((a, b) =>
      (a.title ?? '').localeCompare(b.title ?? '', undefined, { sensitivity: 'base' })
    );
  }, []);

  const refreshAreas = useCallback(async () => {
    try {
      const data = await fetchAreaShortCard();
      setAreas(sortByTitle(data));
    } catch (error) {
      console.error('Ошибка загрузки областей:', error);
      setAreas([]);
      addError(parseApiErrorMessage(error));
    }
  }, [addError, sortByTitle]);

  const loadAreaContent = useCallback(async (areaId: string): Promise<FolderSummary[]> => {
    try {
      setLoadingContent((prev) => new Set(prev).add(`area:${areaId}`));
      const [folders, tasks] = await Promise.all([
        fetchRootFoldersByArea(areaId),
        fetchTaskSummaryByAreaRoot(areaId),
      ]);
      const sorted = sortByTitle(folders);
      setFoldersByArea((prev) => new Map(prev).set(areaId, sorted));
      setTasksByArea((prev) => new Map(prev).set(areaId, tasks));
      return sorted;
    } catch (error) {
      console.error(`Ошибка загрузки содержимого области ${areaId}:`, error);
      setFoldersByArea((prev) => new Map(prev).set(areaId, []));
      setTasksByArea((prev) => new Map(prev).set(areaId, []));
      addError(parseApiErrorMessage(error));
      return [];
    } finally {
      setLoadingContent((prev) => {
        const next = new Set(prev);
        next.delete(`area:${areaId}`);
        return next;
      });
    }
  }, [addError, sortByTitle]);

  const loadFolderContent = useCallback(async (folderId: string, areaId: string): Promise<FolderSummary[]> => {
    try {
      setLoadingContent((prev) => new Set(prev).add(`folder:${folderId}`));
      const [subfolders, tasks] = await Promise.all([
        fetchChildFolders(folderId, areaId),
        fetchTaskSummaryByFolder(folderId),
      ]);
      const sorted = sortByTitle(subfolders);
      setFoldersByParent((prev) => new Map(prev).set(folderId, sorted));
      setTasksByFolder((prev) => new Map(prev).set(folderId, tasks));
      return sorted;
    } catch (error) {
      console.error(`Ошибка загрузки содержимого папки ${folderId}:`, error);
      setFoldersByParent((prev) => new Map(prev).set(folderId, []));
      setTasksByFolder((prev) => new Map(prev).set(folderId, []));
      addError(parseApiErrorMessage(error));
      return [];
    } finally {
      setLoadingContent((prev) => {
        const next = new Set(prev);
        next.delete(`folder:${folderId}`);
        return next;
      });
    }
  }, [addError, sortByTitle]);

  const refreshTree = useCallback(async () => {
    try {
      await refreshAreas();
      const areasToRefresh = Array.from(expandedAreasRef.current);
      for (const areaId of areasToRefresh) {
        await loadAreaContent(areaId);
      }
      const foldersToRefresh = Array.from(expandedFoldersRef.current);
      for (const folderId of foldersToRefresh) {
        const folder = findFolderById(folderId, foldersByAreaRef.current, foldersByParentRef.current);
        if (folder) await loadFolderContent(folderId, folder.areaId);
      }
    } catch {
      /* ошибки уже обработаны в loadAreaContent/loadFolderContent */
    }
  }, [refreshAreas, loadAreaContent, loadFolderContent]);

  useEffect(() => {
    const loadAreas = async () => {
      try {
        setLoading(true);
        await refreshAreas();
      } finally {
        setLoading(false);
      }
    };
    loadAreas();
  }, [refreshAreas]);

  useEffect(() => {
    const unsubscribe = subscribeToTaskUpdates(() => refreshTree());
    return unsubscribe;
  }, [subscribeToTaskUpdates, refreshTree]);

  const toggleArea = useCallback(
    (areaId: string) => {
      setExpandedAreas((prev) => {
        const next = new Set(prev);
        if (next.has(areaId)) next.delete(areaId);
        else {
          next.add(areaId);
          if (!foldersByArea.has(areaId) && !tasksByArea.has(areaId)) loadAreaContent(areaId);
        }
        return next;
      });
    },
    [foldersByArea, tasksByArea, loadAreaContent]
  );

  const toggleFolder = useCallback(
    (folderId: string, areaId: string) => {
      setExpandedFolders((prev) => {
        const next = new Set(prev);
        if (next.has(folderId)) next.delete(folderId);
        else {
          next.add(folderId);
          if (!foldersByParent.has(folderId) && !tasksByFolder.has(folderId)) loadFolderContent(folderId, areaId);
        }
        return next;
      });
    },
    [foldersByParent, tasksByFolder, loadFolderContent]
  );

  /** Полностью свернуть дерево (все области и папки) */
  const collapseAll = useCallback(() => {
    setExpandedAreas(new Set());
    setExpandedFolders(new Set());
  }, []);

  /** Полностью развернуть дерево: все области и папки, с рекурсивной загрузкой контента */
  const expandAll = useCallback(async () => {
    const areaIds = areas.map((a) => a.id);
    setExpandedAreas(new Set(areaIds));

    const queue: { id: string; areaId: string }[] = [];
    const allFolderIds = new Set<string>();

    for (const areaId of areaIds) {
      const folders = foldersByArea.has(areaId) && tasksByArea.has(areaId)
        ? foldersByArea.get(areaId)!
        : await loadAreaContent(areaId);
      for (const f of folders) {
        allFolderIds.add(f.id);
        queue.push({ id: f.id, areaId });
      }
    }

    while (queue.length > 0) {
      const { id: folderId, areaId } = queue.shift()!;
      const subfolders = foldersByParent.has(folderId) && tasksByFolder.has(folderId)
        ? foldersByParent.get(folderId)!
        : await loadFolderContent(folderId, areaId);
      for (const f of subfolders) {
        allFolderIds.add(f.id);
        queue.push({ id: f.id, areaId });
      }
    }

    setExpandedFolders(allFolderIds);
  }, [areas, foldersByArea, foldersByParent, tasksByArea, tasksByFolder, loadAreaContent, loadFolderContent]);

  /** Все области развёрнуты (упрощённо: сверху дерева всё открыто) */
  const isAllExpanded =
    areas.length > 0 &&
    expandedAreas.size === areas.length;

  return {
    areas,
    setAreas,
    foldersByArea,
    setFoldersByArea,
    foldersByParent,
    setFoldersByParent,
    tasksByArea,
    setTasksByArea,
    tasksByFolder,
    setTasksByFolder,
    expandedAreas,
    expandedFolders,
    setExpandedAreas,
    setExpandedFolders,
    loading,
    loadingContent,
    refreshAreas,
    loadAreaContent,
    loadFolderContent,
    refreshTree,
    toggleArea,
    toggleFolder,
    expandAll,
    collapseAll,
    isAllExpanded,
  };
}
