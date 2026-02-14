import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchAreaShortCard,
  fetchRootFoldersByArea,
  fetchChildFolders,
  fetchTaskSummaryByFolder,
  fetchTaskSummaryByAreaRoot,
} from '../../../../services/api';
import { findFolderById } from './treeUtils';
import type { AreaShortCard, FolderSummary, TaskSummary } from '../../../../types';

export interface UseTreeDataOptions {
  showError: (error: unknown) => void;
  subscribeToTaskUpdates: (callback: () => void) => () => void;
}

export function useTreeData({ showError, subscribeToTaskUpdates }: UseTreeDataOptions) {
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
  const hasInitialExpandedRef = useRef(false);
  const areaLoadPromisesRef = useRef<Map<string, Promise<FolderSummary[]>>>(new Map());
  const folderLoadPromisesRef = useRef<Map<string, Promise<FolderSummary[]>>>(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);
  expandedAreasRef.current = expandedAreas;
  expandedFoldersRef.current = expandedFolders;
  foldersByAreaRef.current = foldersByArea;
  foldersByParentRef.current = foldersByParent;

  const sortByTitle = useCallback(<T extends { title?: string }>(items: T[]): T[] => {
    return [...items].sort((a, b) =>
      (a.title ?? '').localeCompare(b.title ?? '', undefined, { sensitivity: 'base' })
    );
  }, []);

  const refreshAreas = useCallback(async (signal?: AbortSignal) => {
    try {
      const data = await fetchAreaShortCard({ signal });
      setAreas(sortByTitle(data));
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      console.error('Ошибка загрузки областей:', error);
      setAreas([]);
      showError(error);
    }
  }, [showError, sortByTitle]);

  const createLoadContentPromise = useCallback(
    (
      key: string,
      fetchFolders: () => Promise<FolderSummary[]>,
      fetchTasks: () => Promise<TaskSummary[]>,
      onSuccess: (folders: FolderSummary[], tasks: TaskSummary[]) => void,
      onError: () => void,
      cacheRef: React.MutableRefObject<Map<string, Promise<FolderSummary[]>>>,
      errorContext: string
    ): Promise<FolderSummary[]> => {
      const existing = cacheRef.current.get(key);
      if (existing) return existing;

      const promise = (async (): Promise<FolderSummary[]> => {
        try {
          setLoadingContent((prev) => new Set(prev).add(key));
          const [folders, tasks] = await Promise.all([fetchFolders(), fetchTasks()]);
          const sorted = sortByTitle(folders);
          onSuccess(sorted, tasks);
          return sorted;
        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') return [];
          console.error(errorContext, error);
          onError();
          showError(error);
          return [];
        } finally {
          cacheRef.current.delete(key);
          setLoadingContent((prev) => {
            const next = new Set(prev);
            next.delete(key);
            return next;
          });
        }
      })();
      cacheRef.current.set(key, promise);
      return promise;
    },
    [showError, sortByTitle]
  );

  const loadAreaContent = useCallback(
    async (areaId: string): Promise<FolderSummary[]> => {
      const key = `area:${areaId}`;
      const signal = abortControllerRef.current?.signal;
      return createLoadContentPromise(
        key,
        () => fetchRootFoldersByArea(areaId, { signal }),
        () => fetchTaskSummaryByAreaRoot(areaId, { signal }),
        (sorted, tasks) => {
          setFoldersByArea((prev) => new Map(prev).set(areaId, sorted));
          setTasksByArea((prev) => new Map(prev).set(areaId, tasks));
        },
        () => {
          setFoldersByArea((prev) => new Map(prev).set(areaId, []));
          setTasksByArea((prev) => new Map(prev).set(areaId, []));
        },
        areaLoadPromisesRef,
        `Ошибка загрузки содержимого области ${areaId}:`
      );
    },
    [createLoadContentPromise]
  );

  const loadFolderContent = useCallback(
    async (folderId: string, areaId: string): Promise<FolderSummary[]> => {
      const key = `folder:${folderId}`;
      const signal = abortControllerRef.current?.signal;
      return createLoadContentPromise(
        key,
        () => fetchChildFolders(folderId, areaId, { signal }),
        () => fetchTaskSummaryByFolder(folderId, { signal }),
        (sorted, tasks) => {
          setFoldersByParent((prev) => new Map(prev).set(folderId, sorted));
          setTasksByFolder((prev) => new Map(prev).set(folderId, tasks));
        },
        () => {
          setFoldersByParent((prev) => new Map(prev).set(folderId, []));
          setTasksByFolder((prev) => new Map(prev).set(folderId, []));
        },
        folderLoadPromisesRef,
        `Ошибка загрузки содержимого папки ${folderId}:`
      );
    },
    [createLoadContentPromise]
  );

  const isRefreshingRef = useRef(false);
  const pendingRefreshRef = useRef(false);

  const refreshTree = useCallback(async () => {
    if (isRefreshingRef.current) {
      pendingRefreshRef.current = true;
      return;
    }
    isRefreshingRef.current = true;
    pendingRefreshRef.current = false;
    const signal = abortControllerRef.current?.signal;
    try {
      await refreshAreas(signal);
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
    } finally {
      isRefreshingRef.current = false;
      if (pendingRefreshRef.current) {
        pendingRefreshRef.current = false;
        void refreshTree();
      }
    }
  }, [refreshAreas, loadAreaContent, loadFolderContent]);

  useEffect(() => {
    const ctrl = new AbortController();
    abortControllerRef.current = ctrl;
    const loadAreas = async () => {
      try {
        setLoading(true);
        await refreshAreas(ctrl.signal);
      } finally {
        setLoading(false);
      }
    };
    loadAreas();
    return () => {
      ctrl.abort();
      abortControllerRef.current = null;
    };
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

  const collapseAll = useCallback(() => {
    setExpandedAreas(new Set());
    setExpandedFolders(new Set());
  }, []);

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

  useEffect(() => {
    if (loading || areas.length === 0 || hasInitialExpandedRef.current) return;
    hasInitialExpandedRef.current = true;
    expandAll();
  }, [loading, areas.length, expandAll]);

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
