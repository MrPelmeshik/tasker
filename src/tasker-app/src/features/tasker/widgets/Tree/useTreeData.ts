import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  fetchAreaShortCard,
  fetchRootFoldersByArea,
  fetchChildFolders,
  fetchTaskSummaryByFolder,
  fetchTaskSummaryByAreaRoot,
} from '../../../../services/api';
import { findFolderById } from './treeUtils';
import { findParentForEntity } from './treeUpdateUtils';
import type { AreaShortCard, FolderSummary, TaskSummary } from '../../../../types';
import type { NotifyTaskUpdatePayload } from '../../../../context/TaskUpdateContext';
import { useWidgetState } from '../../../../hooks/useWidgetState';

export interface UseTreeDataOptions {
  showError: (error: unknown) => void;
  subscribeToTaskUpdates: (callback: (taskId?: string, folderId?: string, payload?: NotifyTaskUpdatePayload) => void) => () => void;
  root?: { type: 'area' | 'folder'; id: string; areaId?: string } | null;
}

// Простая проверка глубокого равенства для наших структур данных
function isDeepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;

  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!isDeepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!keysB.includes(key)) return false;
    if (!isDeepEqual(a[key], b[key])) return false;
  }

  return true;
}

export function useTreeData({ showError, subscribeToTaskUpdates, root }: UseTreeDataOptions) {
  const [areas, setAreas] = useState<AreaShortCard[]>([]);
  const [foldersByArea, setFoldersByArea] = useState<Map<string, FolderSummary[]>>(new Map());
  const [foldersByParent, setFoldersByParent] = useState<Map<string, FolderSummary[]>>(new Map());
  const [tasksByArea, setTasksByArea] = useState<Map<string, TaskSummary[]>>(new Map());
  const [tasksByFolder, setTasksByFolder] = useState<Map<string, TaskSummary[]>>(new Map());

  // Persistence for expanded state
  const [expandedAreasList, setExpandedAreasList] = useWidgetState<string[]>('tree', 'expanded-areas', []);
  const [expandedFoldersList, setExpandedFoldersList] = useWidgetState<string[]>('tree', 'expanded-folders', []);

  // Sync state to classic Set structure for usage
  const expandedAreas = useMemo(() => new Set(expandedAreasList), [expandedAreasList]);
  const expandedFolders = useMemo(() => new Set(expandedFoldersList), [expandedFoldersList]);

  // Compatibility setters
  const setExpandedAreas = useCallback((value: Set<string> | ((prev: Set<string>) => Set<string>)) => {
    setExpandedAreasList(prevList => {
      const prevSet = new Set(prevList);
      const nextSet = value instanceof Function ? value(prevSet) : value;
      return Array.from(nextSet);
    });
  }, [setExpandedAreasList]);

  const setExpandedFolders = useCallback((value: Set<string> | ((prev: Set<string>) => Set<string>)) => {
    setExpandedFoldersList(prevList => {
      const prevSet = new Set(prevList);
      const nextSet = value instanceof Function ? value(prevSet) : value;
      return Array.from(nextSet);
    });
  }, [setExpandedFoldersList]);

  const [loading, setLoading] = useState(true);
  const [loadingContent, setLoadingContent] = useState<Set<string>>(new Set());

  // Refs for stable access in callbacks
  const areasRef = useRef(areas);
  const foldersByAreaRef = useRef(foldersByArea);
  const foldersByParentRef = useRef(foldersByParent);
  const tasksByAreaRef = useRef(tasksByArea);
  const tasksByFolderRef = useRef(tasksByFolder);
  const expandedAreasRef = useRef(expandedAreas);
  const expandedFoldersRef = useRef(expandedFolders);
  const loadingContentRef = useRef(loadingContent);

  const areaLoadPromisesRef = useRef<Map<string, Promise<FolderSummary[]>>>(new Map());
  const folderLoadPromisesRef = useRef<Map<string, Promise<FolderSummary[]>>>(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);
  const hasInitialExpandedRef = useRef(false);

  // Sync refs
  useEffect(() => {
    areasRef.current = areas;
    foldersByAreaRef.current = foldersByArea;
    foldersByParentRef.current = foldersByParent;
    tasksByAreaRef.current = tasksByArea;
    tasksByFolderRef.current = tasksByFolder;
    expandedAreasRef.current = expandedAreas;
    expandedFoldersRef.current = expandedFolders;
    loadingContentRef.current = loadingContent;
  });

  const updateStateIfChanged = useCallback(<T>(
    setter: React.Dispatch<React.SetStateAction<T>>,
    newValue: T
  ) => {
    setter(prev => isDeepEqual(prev, newValue) ? prev : newValue);
  }, []);

  const updateMapStateIfChanged = useCallback(<K, V>(
    setter: React.Dispatch<React.SetStateAction<Map<K, V>>>,
    key: K,
    newValue: V
  ) => {
    setter(prev => {
      const existing = prev.get(key);
      if (isDeepEqual(existing, newValue)) return prev;
      return new Map(prev).set(key, newValue);
    });
  }, []);

  const sortByTitle = useCallback(<T extends { title?: string }>(items: T[]): T[] => {
    return [...items].sort((a, b) =>
      (a.title ?? '').localeCompare(b.title ?? '', undefined, { sensitivity: 'base' })
    );
  }, []);

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

      if (loadingContentRef.current.has(key)) {
        // Should not happen if cacheRef works, but safety net
        return Promise.resolve([]);
      }

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
            if (next.has(key)) next.delete(key);
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
          updateMapStateIfChanged(setFoldersByArea, areaId, sorted);
          updateMapStateIfChanged(setTasksByArea, areaId, tasks);
        },
        () => {
          updateMapStateIfChanged(setFoldersByArea, areaId, [] as FolderSummary[]);
          updateMapStateIfChanged(setTasksByArea, areaId, [] as TaskSummary[]);
        },
        areaLoadPromisesRef,
        `Ошибка загрузки содержимого области ${areaId}:`
      );
    },
    [createLoadContentPromise, updateMapStateIfChanged]
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
          updateMapStateIfChanged(setFoldersByParent, folderId, sorted);
          updateMapStateIfChanged(setTasksByFolder, folderId, tasks);
        },
        () => {
          updateMapStateIfChanged(setFoldersByParent, folderId, [] as FolderSummary[]);
          updateMapStateIfChanged(setTasksByFolder, folderId, [] as TaskSummary[]);
        },
        folderLoadPromisesRef,
        `Ошибка загрузки содержимого папки ${folderId}:`
      );
    },
    [createLoadContentPromise, updateMapStateIfChanged]
  );

  // Stable toggle handlers using refs
  const toggleArea = useCallback(
    (areaId: string) => {
      setExpandedAreas((prev) => {
        const next = new Set(prev);
        if (next.has(areaId)) next.delete(areaId);
        else {
          next.add(areaId);
          // Check if data loaded using refs
          if (!foldersByAreaRef.current.has(areaId) && !tasksByAreaRef.current.has(areaId)) {
            loadAreaContent(areaId);
          }
        }
        return next;
      });
    },
    [loadAreaContent]
  );

  const toggleFolder = useCallback(
    (folderId: string, areaId: string) => {
      setExpandedFolders((prev) => {
        const next = new Set(prev);
        if (next.has(folderId)) next.delete(folderId);
        else {
          next.add(folderId);
          // Check if data loaded using refs
          if (!foldersByParentRef.current.has(folderId) && !tasksByFolderRef.current.has(folderId)) {
            loadFolderContent(folderId, areaId);
          }
        }
        return next;
      });
    },
    [loadFolderContent]
  );

  // Deconstruct root to stable primitives
  const rootId = root?.id;
  const rootType = root?.type;
  const rootAreaId = root?.areaId;

  const refreshAreas = useCallback(async (signal?: AbortSignal) => {
    // If root is set, we don't load all areas
    if (rootId) return;

    try {
      const data = await fetchAreaShortCard({ signal });
      const sorted = sortByTitle(data);
      updateStateIfChanged(setAreas, sorted);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      console.error('Ошибка загрузки областей:', error);
      setAreas([]);
      showError(error);
    }
  }, [showError, sortByTitle, updateStateIfChanged, rootId]);

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
      const foldersToRefresh = Array.from(expandedFoldersRef.current);

      await Promise.all([
        ...areasToRefresh.map(areaId => loadAreaContent(areaId).catch(() => [])),
        ...foldersToRefresh.map(folderId => {
          const folder = findFolderById(folderId, foldersByAreaRef.current, foldersByParentRef.current);
          if (!folder && rootType === 'folder' && folderId !== rootId) {
            return Promise.resolve([]);
          }
          if (!folder && rootType === 'folder' && folderId === rootId && rootAreaId) {
            // Refresh root folder children
            return loadFolderContent(rootId, rootAreaId).catch(() => []);
          }
          if (!folder) return Promise.resolve([]);
          return loadFolderContent(folderId, folder.areaId).catch(() => []);
        })
      ]);

      if (rootType === 'folder' && rootId && rootAreaId) {
        await loadFolderContent(rootId, rootAreaId).catch(() => []);
      }

    } catch {
      // handled
    } finally {
      isRefreshingRef.current = false;
      if (pendingRefreshRef.current) {
        pendingRefreshRef.current = false;
        void refreshTree();
      }
    }
  }, [refreshAreas, loadAreaContent, loadFolderContent, rootId, rootType, rootAreaId]);

  const collapseAll = useCallback(() => {
    setExpandedAreas(new Set());
    setExpandedFolders(new Set());
  }, []);

  const expandAll = useCallback(async () => {
    const queue: { id: string; areaId: string }[] = [];
    const allFolderIds = new Set<string>();

    if (rootType === 'area' && rootId) {
      // Expand this area
      setExpandedAreas(new Set([rootId]));
      const hasData = foldersByAreaRef.current.has(rootId) && tasksByAreaRef.current.has(rootId);
      const folders = hasData
        ? foldersByAreaRef.current.get(rootId)!
        : await loadAreaContent(rootId);

      for (const f of folders) {
        allFolderIds.add(f.id);
        queue.push({ id: f.id, areaId: rootId });
      }
    } else if (rootType === 'folder' && rootId && rootAreaId) {
      // Expand root folder
      // Actually root folder itself is not "expanded" in terms of tree state because it is the container?
      // But its children might be folders.
      const hasData = foldersByParentRef.current.has(rootId) && tasksByFolderRef.current.has(rootId);
      const subfolders = hasData
        ? foldersByParentRef.current.get(rootId)!
        : await loadFolderContent(rootId, rootAreaId);

      setExpandedFolders(new Set([rootId])); // Ensure root is expanded if applicable

      for (const f of subfolders) {
        allFolderIds.add(f.id);
        queue.push({ id: f.id, areaId: rootAreaId });
      }
    } else if (!rootId) {
      // Full tree
      const localAreas = areasRef.current;
      const areaIds = localAreas.map((a) => a.id);
      setExpandedAreas(new Set(areaIds));

      for (const areaId of areaIds) {
        const hasData = foldersByAreaRef.current.has(areaId) && tasksByAreaRef.current.has(areaId);
        const folders = hasData
          ? foldersByAreaRef.current.get(areaId)!
          : await loadAreaContent(areaId);

        for (const f of folders) {
          allFolderIds.add(f.id);
          queue.push({ id: f.id, areaId });
        }
      }
    }

    // Process queue recursively
    while (queue.length > 0) {
      const { id: folderId, areaId } = queue.shift()!;
      const hasData = foldersByParentRef.current.has(folderId) && tasksByFolderRef.current.has(folderId);
      const subfolders = hasData
        ? foldersByParentRef.current.get(folderId)!
        : await loadFolderContent(folderId, areaId);

      for (const f of subfolders) {
        allFolderIds.add(f.id);
        queue.push({ id: f.id, areaId });
      }
    }

    setExpandedFolders(prev => {
      const next = new Set(prev);
      allFolderIds.forEach(id => next.add(id));
      return next;
    });
  }, [loadAreaContent, loadFolderContent, rootId, rootType, rootAreaId]);

  useEffect(() => {
    // If loading, wait.
    if (loading) return;

    // If already expanded once, skip.
    if (hasInitialExpandedRef.current) return;

    // If full tree mode (no root), need areas to be loaded.
    if (!rootId && areas.length === 0) return;

    // If scoped mode (root), we can expand.
    // Logic: expand all provided content.
    hasInitialExpandedRef.current = true;
    expandAll();
  }, [loading, areas.length, expandAll, rootId]);



  useEffect(() => {
    const ctrl = new AbortController();
    abortControllerRef.current = ctrl;

    const loadData = async () => {
      try {
        setLoading(true);
        if (rootId && rootType) {
          if (rootType === 'area') {
            await loadAreaContent(rootId);
            setExpandedAreas(new Set([rootId]));
          } else if (rootType === 'folder' && rootAreaId) {
            // For folder root, we also want to expand it so we can see children immediately?
            // Actually, the TreeFolderChildren renders the children of this folder.
            // We need to load 'foldersByParent' for this folderId.
            await loadFolderContent(rootId, rootAreaId);
            setExpandedFolders(new Set([rootId]));
          }
        } else {
          await refreshAreas(ctrl.signal);
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();

    return () => {
      ctrl.abort();
      abortControllerRef.current = null;
    };
  }, [refreshAreas, loadAreaContent, loadFolderContent, rootId, rootType, rootAreaId]);

  const handleTaskUpdate = useCallback((taskId?: string, folderId?: string, payload?: NotifyTaskUpdatePayload) => {
    // 1. Refresh Target Container (where the entity is NOW)
    if (folderId && expandedFoldersRef.current.has(folderId)) {
      const folder = findFolderById(folderId, foldersByAreaRef.current, foldersByParentRef.current);
      if (folder) {
        void loadFolderContent(folderId, folder.areaId);
      } else if (root?.type === 'folder' && root.id === folderId) {
        // If we are rooted at this folder, we should refresh it. 
        // We need areaId.
        if (payload?.areaId) {
          void loadFolderContent(folderId, payload.areaId);
        }
      }
    } else if (payload?.areaId && expandedAreasRef.current.has(payload.areaId)) {
      void loadAreaContent(payload.areaId);
    } else if (root?.type === 'area' && root.id === payload?.areaId) {
      void loadAreaContent(root.id);
    }

    // 2. Refresh Source Container
    const targetEntityId = taskId || payload?.entityId;
    if (targetEntityId) {
      const isFolder = payload?.entityType === 'FOLDER';

      const refreshFolderIfExpanded = (pId: string) => {
        if ((expandedFoldersRef.current.has(pId) || (root?.type === 'folder' && root.id === pId)) && pId !== folderId) {
          const parentFolder = findFolderById(pId, foldersByAreaRef.current, foldersByParentRef.current);
          if (parentFolder) void loadFolderContent(pId, parentFolder.areaId);
        }
      };
      const refreshAreaIfExpanded = (aId: string) => {
        if ((expandedAreasRef.current.has(aId) || (root?.type === 'area' && root.id === aId)) && aId !== payload?.areaId) {
          void loadAreaContent(aId);
        }
      };

      const foundParent = findParentForEntity(
        targetEntityId,
        isFolder,
        foldersByParentRef.current,
        foldersByAreaRef.current,
        tasksByFolderRef.current,
        tasksByAreaRef.current
      );

      if (foundParent) {
        if (foundParent.type === 'folder') {
          refreshFolderIfExpanded(foundParent.id);
        } else {
          refreshAreaIfExpanded(foundParent.id);
        }
      }
    }

    // 3. Fallback for structural changes
    if (payload?.entityType === 'AREA' && !payload.areaId && !root) {
      void refreshAreas();
    }
  }, [loadFolderContent, loadAreaContent, refreshAreas, root]);

  useEffect(() => {
    const unsubscribe = subscribeToTaskUpdates((taskId, folderId, payload) => handleTaskUpdate(taskId, folderId, payload));
    return unsubscribe;
  }, [subscribeToTaskUpdates, handleTaskUpdate]);

  const isAllExpanded = React.useMemo(() => {
    if (rootId && rootType === 'area') {
      const folders = foldersByArea.get(rootId) || [];
      if (folders.length === 0) return false;
      return folders.every((f) => expandedFolders.has(f.id));
    }
    if (rootId && rootType === 'folder') {
      const subfolders = foldersByParent.get(rootId) || [];
      if (subfolders.length === 0) return false;
      return subfolders.every((f) => expandedFolders.has(f.id));
    }
    return areas.length > 0 && expandedAreas.size === areas.length;
  }, [areas.length, expandedAreas, expandedFolders, foldersByArea, foldersByParent, rootId, rootType]);

  return {
    areas,
    foldersByArea,
    foldersByParent,
    tasksByArea,
    tasksByFolder,
    expandedAreas,
    expandedFolders,
    loading,
    loadingContent,

    // Actions
    setAreas,
    setFoldersByArea,
    setFoldersByParent,
    setTasksByArea,
    setTasksByFolder,
    setExpandedAreas,
    setExpandedFolders,

    refreshAreas,
    loadAreaContent,
    loadFolderContent,
    refreshTree,
    toggleArea,
    toggleFolder,
    expandAll,
    collapseAll,

    // Computed
    isAllExpanded,
  };
}
