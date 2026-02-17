import { useCallback } from 'react';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  fetchRootFoldersByArea,
  fetchChildFolders,
  fetchTaskSummaryByFolder,
  fetchTaskSummaryByAreaRoot,
  updateFolder,
  updateTask,
} from '../../../../services/api';
import { parseDropTarget, isValidDrop } from './treeUtils';
import type { DragPayload } from './treeUtils';
import type { FolderSummary } from '../../../../types';

export interface UseTreeDragEndParams {
  foldersByArea: Map<string, FolderSummary[]>;
  foldersByParent: Map<string, FolderSummary[]>;
  setFoldersByArea: React.Dispatch<React.SetStateAction<Map<string, FolderSummary[]>>>;
  setFoldersByParent: React.Dispatch<React.SetStateAction<Map<string, FolderSummary[]>>>;
  setTasksByArea: React.Dispatch<React.SetStateAction<Map<string, import('../../../../types').TaskSummary[]>>>;
  setTasksByFolder: React.Dispatch<React.SetStateAction<Map<string, import('../../../../types').TaskSummary[]>>>;
  setExpandedFolders: React.Dispatch<React.SetStateAction<Set<string>>>;
  setAreas: React.Dispatch<React.SetStateAction<import('../../../../types').AreaShortCard[]>>;
  loadFolderContent: (folderId: string, areaId: string) => Promise<unknown>;
  showError: (error: unknown) => void;
  addSuccess: (message: string) => void;
  notifyTaskUpdate: (taskId: string, folderId?: string) => void;
}

/**
 * Хук для обработки завершения DnD (перемещение папки или задачи в дереве).
 */
export function useTreeDragEnd(params: UseTreeDragEndParams) {
  const {
    foldersByArea,
    foldersByParent,
    setFoldersByArea,
    setFoldersByParent,
    setTasksByArea,
    setTasksByFolder,
    setExpandedFolders,
    setAreas,
    loadFolderContent,
    showError,
    addSuccess,
    notifyTaskUpdate,
  } = params;

  return useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) {
        if (process.env.NODE_ENV === 'development') {
          console.debug('[Tree DnD] handleDragEnd: over=null, ранний выход');
        }
        return;
      }
      const overId = String(over.id);
      const target = parseDropTarget(overId, foldersByArea, foldersByParent);
      const payload = (active.data?.current ?? active.data) as DragPayload | undefined;
      if (process.env.NODE_ENV === 'development') {
        console.debug('[Tree DnD] handleDragEnd:', { over, overId, target, payload, isValidDrop: payload ? isValidDrop(payload, overId, foldersByArea, foldersByParent) : false });
      }
      if (!target || !payload || !isValidDrop(payload, overId, foldersByArea, foldersByParent)) {
        if (process.env.NODE_ENV === 'development') {
          console.debug('[Tree DnD] handleDragEnd: ранний выход (target/payload/isValidDrop)');
        }
        return;
      }

      if (payload.type === 'folder' && payload.folder) {
        const folder = payload.folder;
        if (target.areaId === folder.areaId && (target.parentFolderId ?? null) === (folder.parentFolderId ?? null)) {
          return;
        }
      } else if (payload.type === 'task' && payload.task) {
        const task = payload.task;
        if (target.areaId === task.areaId && (target.parentFolderId ?? null) === (task.folderId ?? null)) {
          return;
        }
      }

      try {
        if (payload.type === 'folder' && payload.folder) {
          const folder = payload.folder;
          await updateFolder(folder.id, {
            title: folder.title,
            description: folder.description ?? '',
            areaId: target.areaId,
            parentFolderId: target.parentFolderId,
          });
          const rootFolders = await fetchRootFoldersByArea(folder.areaId);
          setFoldersByArea((prev) => new Map(prev).set(folder.areaId, rootFolders));
          if (folder.parentFolderId) {
            const children = await fetchChildFolders(folder.parentFolderId, folder.areaId);
            setFoldersByParent((prev) => new Map(prev).set(folder.parentFolderId!, children));
          }
          if (target.parentFolderId) {
            const children = await fetchChildFolders(target.parentFolderId, target.areaId);
            setFoldersByParent((prev) => new Map(prev).set(target.parentFolderId!, children));
          }
          setAreas((prev) => prev.map((a) => (a.id === folder.areaId ? { ...a, foldersCount: rootFolders.length } : a)));

          if (folder.areaId !== target.areaId && !target.parentFolderId) {
            const targetRootFolders = await fetchRootFoldersByArea(target.areaId);
            setFoldersByArea((prev) => new Map(prev).set(target.areaId, targetRootFolders));
            setAreas((prev) => prev.map((a) => (a.id === target.areaId ? { ...a, foldersCount: targetRootFolders.length } : a)));
          }
          addSuccess('Папка перемещена');
        } else if (payload.type === 'task' && payload.task) {
          const task = payload.task;
          if (process.env.NODE_ENV === 'development') {
            console.debug('[Tree DnD] updateTask:', task.id, { areaId: target.areaId, folderId: target.parentFolderId });
          }
          await updateTask(task.id, {
            title: task.title,
            description: task.description ?? '',
            areaId: target.areaId,
            folderId: target.parentFolderId,
            status: task.status,
          });
          const oldFolderId = task.folderId ?? undefined;
          const oldAreaId = task.areaId;
          if (oldFolderId) {
            const tasks = await fetchTaskSummaryByFolder(oldFolderId);
            setTasksByFolder((prev) => new Map(prev).set(oldFolderId, tasks));
            const subfolders = foldersByParent.get(oldFolderId) ?? [];
            if (tasks.length === 0 && subfolders.length === 0) {
              setExpandedFolders((prev) => {
                const next = new Set(prev);
                next.delete(oldFolderId);
                return next;
              });
            }
          } else if (oldAreaId) {
            const tasks = await fetchTaskSummaryByAreaRoot(oldAreaId);
            setTasksByArea((prev) => new Map(prev).set(oldAreaId, tasks));
          }
          if (target.parentFolderId) {
            await loadFolderContent(target.parentFolderId, target.areaId);
          } else {
            const tasks = await fetchTaskSummaryByAreaRoot(target.areaId);
            setTasksByArea((prev) => new Map(prev).set(target.areaId, tasks));
          }
          notifyTaskUpdate(task.id, target.parentFolderId ?? undefined);
          addSuccess('Задача перемещена');
        }
      } catch (error) {
        console.error('Ошибка перемещения:', error);
        showError(error);
      }
    },
    [
      foldersByArea,
      foldersByParent,
      setFoldersByArea,
      setFoldersByParent,
      setTasksByArea,
      setTasksByFolder,
      setExpandedFolders,
      setAreas,
      loadFolderContent,
      showError,
      addSuccess,
      notifyTaskUpdate,
    ]
  );
}
