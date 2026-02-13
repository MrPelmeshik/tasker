/**
 * Обработчики модалок и CRUD-операций для виджета дерева.
 */

import { useCallback } from 'react';
import {
  fetchAreaShortCard,
  fetchAreaById,
  fetchFolderById,
  fetchTaskById,
  createArea,
  updateArea,
  deleteArea,
  createFolder,
  updateFolder,
  deleteFolder,
  createTask,
  updateTask,
  deleteTask,
  fetchRootFoldersByArea,
  fetchChildFolders,
  fetchTaskSummaryByFolder,
  fetchTaskSummaryByAreaRoot,
} from '../../../../services/api';
import { parseApiErrorMessage } from '../../../../utils/parse-api-error';
import type {
  AreaShortCard,
  FolderSummary,
  TaskSummary,
  AreaCreateRequest,
  AreaUpdateRequest,
  FolderCreateRequest,
  FolderUpdateRequest,
  TaskCreateRequest,
  TaskUpdateRequest,
} from '../../../../types';
import type { ModalContextType } from '../../../../context/ModalContext';

export interface UseTreeHandlersOptions
  extends Pick<ModalContextType, 'openAreaModal' | 'openFolderModal' | 'openTaskModal'> {
  areas: AreaShortCard[];
  setAreas: React.Dispatch<React.SetStateAction<AreaShortCard[]>>;
  setFoldersByArea: React.Dispatch<React.SetStateAction<Map<string, FolderSummary[]>>>;
  setFoldersByParent: React.Dispatch<React.SetStateAction<Map<string, FolderSummary[]>>>;
  setTasksByArea: React.Dispatch<React.SetStateAction<Map<string, TaskSummary[]>>>;
  setTasksByFolder: React.Dispatch<React.SetStateAction<Map<string, TaskSummary[]>>>;
  loadFolderContent: (folderId: string, areaId: string) => Promise<void>;
  foldersByParent: Map<string, FolderSummary[]>;
  addError: (message: string) => void;
  addSuccess: (message: string) => void;
  notifyTaskUpdate: (taskId?: string, folderId?: string) => void;
}

export function useTreeHandlers({
  areas,
  setAreas,
  setFoldersByArea,
  setFoldersByParent,
  setTasksByArea,
  setTasksByFolder,
  loadFolderContent,
  foldersByParent,
  addError,
  addSuccess,
  notifyTaskUpdate,
  openAreaModal,
  openFolderModal,
  openTaskModal,
}: UseTreeHandlersOptions) {
  const handleAreaSave = useCallback(
    async (data: AreaCreateRequest | (AreaUpdateRequest & { id?: string })) => {
      try {
        const d = data as { id?: string } & AreaCreateRequest;
        if (!d.id) await createArea(data as AreaCreateRequest);
        else await updateArea(d.id, data as AreaUpdateRequest);
        const updated = await fetchAreaShortCard();
        setAreas(updated);
      } catch (error) {
        console.error('Ошибка сохранения области:', error);
        throw error;
      }
    },
    [setAreas]
  );

  const handleAreaDelete = useCallback(
    async (id: string) => {
      try {
        await deleteArea(id);
        const updated = await fetchAreaShortCard();
        setAreas(updated);
        setFoldersByArea((prev) => {
          const next = new Map(prev);
          next.delete(id);
          return next;
        });
        setTasksByArea((prev) => {
          const next = new Map(prev);
          next.delete(id);
          return next;
        });
      } catch (error) {
        console.error('Ошибка удаления области:', error);
        throw error;
      }
    },
    [setAreas, setFoldersByArea, setTasksByArea]
  );

  const handleFolderSave = useCallback(
    async (data: FolderCreateRequest | FolderUpdateRequest, folderId?: string) => {
      try {
        const areaId = data.areaId;
        if (!folderId) {
          await createFolder(data as FolderCreateRequest);
        } else {
          await updateFolder(folderId, data as FolderUpdateRequest);
        }
        const rootFolders = await fetchRootFoldersByArea(areaId);
        setFoldersByArea((prev) => new Map(prev).set(areaId, rootFolders));
        if (data.parentFolderId) {
          const children = await fetchChildFolders(data.parentFolderId, areaId);
          setFoldersByParent((prev) => new Map(prev).set(data.parentFolderId!, children));
        }
        setAreas((prev) => prev.map((a) => (a.id === areaId ? { ...a, foldersCount: rootFolders.length } : a)));
      } catch (error) {
        console.error('Ошибка сохранения папки:', error);
        throw error;
      }
    },
    [setAreas, setFoldersByArea, setFoldersByParent]
  );

  const handleFolderDelete = useCallback(
    async (id: string) => {
      try {
        const folder = await fetchFolderById(id);
        const areaId = folder?.areaId;
        const parentId = folder?.parentFolderId;
        await deleteFolder(id);
        if (areaId) {
          const rootFolders = await fetchRootFoldersByArea(areaId);
          setFoldersByArea((prev) => new Map(prev).set(areaId, rootFolders));
          if (parentId) {
            const children = await fetchChildFolders(parentId, areaId);
            setFoldersByParent((prev) => new Map(prev).set(parentId, children));
          }
          setAreas((prev) => prev.map((a) => (a.id === areaId ? { ...a, foldersCount: rootFolders.length } : a)));
        }
        setFoldersByParent((prev) => {
          const next = new Map(prev);
          next.delete(id);
          return next;
        });
        setTasksByFolder((prev) => {
          const next = new Map(prev);
          next.delete(id);
          return next;
        });
      } catch (error) {
        console.error('Ошибка удаления папки:', error);
        throw error;
      }
    },
    [setAreas, setFoldersByArea, setFoldersByParent, setTasksByFolder]
  );

  const handleTaskSave = useCallback(
    async (data: TaskCreateRequest | TaskUpdateRequest, taskId?: string) => {
      try {
        const areaId = data.areaId;
        const folderId = data.folderId ?? undefined;
        if (!taskId) {
          await createTask(data as TaskCreateRequest);
        } else {
          await updateTask(taskId, data as TaskUpdateRequest);
        }
        if (folderId) {
          const tasks = await fetchTaskSummaryByFolder(folderId);
          setTasksByFolder((prev) => new Map(prev).set(folderId, tasks));
        } else {
          const tasks = await fetchTaskSummaryByAreaRoot(areaId);
          setTasksByArea((prev) => new Map(prev).set(areaId, tasks));
        }
        notifyTaskUpdate(taskId, folderId);
      } catch (error) {
        console.error('Ошибка сохранения задачи:', error);
        throw error;
      }
    },
    [setTasksByArea, setTasksByFolder, notifyTaskUpdate]
  );

  const handleTaskDelete = useCallback(
    async (id: string) => {
      try {
        const task = await fetchTaskById(id);
        const folderId = task?.folderId ?? undefined;
        const areaId = task?.areaId;
        await deleteTask(id);
        if (folderId && areaId) {
          const tasks = await fetchTaskSummaryByFolder(folderId);
          setTasksByFolder((prev) => new Map(prev).set(folderId, tasks));
        } else if (areaId) {
          const tasks = await fetchTaskSummaryByAreaRoot(areaId);
          setTasksByArea((prev) => new Map(prev).set(areaId, tasks));
        }
        notifyTaskUpdate(id, folderId);
      } catch (error) {
        console.error('Ошибка удаления задачи:', error);
        throw error;
      }
    },
    [setTasksByArea, setTasksByFolder, notifyTaskUpdate]
  );

  const handleCreateArea = useCallback(() => {
    openAreaModal(null, 'create', handleAreaSave);
  }, [openAreaModal, handleAreaSave]);

  const handleViewAreaDetails = useCallback(
    async (areaId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      try {
        const area = await fetchAreaById(areaId);
        if (area) openAreaModal(area, 'edit', handleAreaSave, handleAreaDelete);
      } catch (error) {
        console.error('Ошибка загрузки области:', error);
        addError(parseApiErrorMessage(error));
      }
    },
    [openAreaModal, handleAreaSave, handleAreaDelete, addError]
  );

  const handleCreateFolderForArea = useCallback(
    (areaId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      const areasForModal = areas.map((a) => ({ ...a, id: a.id, title: a.title, description: a.description }));
      openFolderModal(null, 'create', areasForModal, (data, folderId) => handleFolderSave(data as FolderCreateRequest, folderId), undefined, areaId, null);
    },
    [areas, openFolderModal, handleFolderSave]
  );

  const handleCreateFolderForFolder = useCallback(
    (folderId: string, areaId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      const areasForModal = areas.map((a) => ({ ...a, id: a.id, title: a.title, description: a.description }));
      openFolderModal(null, 'create', areasForModal, (data, fid) => handleFolderSave(data as FolderCreateRequest, fid), undefined, areaId, folderId);
    },
    [areas, openFolderModal, handleFolderSave]
  );

  const handleCreateTaskForArea = useCallback(
    (areaId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      const areasForTaskModal = areas.map((a) => ({ id: a.id, title: a.title }));
      openTaskModal(null, 'create', (data, taskId) => handleTaskSave(data as TaskCreateRequest, taskId), undefined, undefined, areaId, areasForTaskModal);
    },
    [areas, openTaskModal, handleTaskSave]
  );

  const handleCreateTaskForFolder = useCallback(
    (folderId: string, areaId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      const areasForTaskModal = areas.map((a) => ({ id: a.id, title: a.title }));
      openTaskModal(null, 'create', (data, taskId) => handleTaskSave(data as TaskCreateRequest, taskId), undefined, folderId, areaId, areasForTaskModal);
    },
    [areas, openTaskModal, handleTaskSave]
  );

  const handleViewFolderDetails = useCallback(
    async (folderId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      try {
        const folder = await fetchFolderById(folderId);
        if (folder) {
          const areasForModal = areas.map((a) => ({ ...a, id: a.id, title: a.title, description: a.description }));
          openFolderModal(folder, 'edit', areasForModal, (data, fid) => handleFolderSave(data as FolderUpdateRequest, fid), handleFolderDelete);
        }
      } catch (error) {
        console.error('Ошибка загрузки папки:', error);
        addError(parseApiErrorMessage(error));
      }
    },
    [areas, openFolderModal, handleFolderSave, handleFolderDelete, addError]
  );

  const handleViewTaskDetails = useCallback(
    async (taskId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      try {
        const task = await fetchTaskById(taskId);
        if (task) {
          const areasForTaskModal = areas.map((a) => ({ id: a.id, title: a.title }));
          openTaskModal(task, 'edit', (data, tid) => handleTaskSave(data as TaskUpdateRequest, tid), handleTaskDelete, undefined, undefined, areasForTaskModal);
        }
      } catch (error) {
        console.error('Ошибка загрузки задачи:', error);
        addError(parseApiErrorMessage(error));
      }
    },
    [areas, openTaskModal, handleTaskSave, handleTaskDelete, addError]
  );

  return {
    handleCreateArea,
    handleViewAreaDetails,
    handleCreateFolderForArea,
    handleCreateFolderForFolder,
    handleCreateTaskForArea,
    handleCreateTaskForFolder,
    handleViewFolderDetails,
    handleViewTaskDetails,
    handleAreaSave,
    handleAreaDelete,
    handleFolderSave,
    handleFolderDelete,
    handleTaskSave,
    handleTaskDelete,
  };
}
