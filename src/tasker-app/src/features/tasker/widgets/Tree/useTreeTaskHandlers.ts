/**
 * Обработчики для задач в виджете дерева.
 */

import { useCallback, useMemo } from 'react';
import {
  fetchTaskById,
  createTask,
  updateTask,
  deleteTask,
  fetchTaskSummaryByFolder,
  fetchTaskSummaryByAreaRoot,
} from '../../../../services/api';
import type {
  AreaShortCard,
  TaskSummary,
  TaskCreateRequest,
  TaskUpdateRequest,
} from '../../../../types';
import type { ModalContextType } from '../../../../context/ModalContext';

export interface UseTreeTaskHandlersOptions
  extends Pick<ModalContextType, 'openTaskModal'> {
  areas: AreaShortCard[];
  setAreas: React.Dispatch<React.SetStateAction<AreaShortCard[]>>;
  setTasksByArea: React.Dispatch<React.SetStateAction<Map<string, TaskSummary[]>>>;
  setTasksByFolder: React.Dispatch<React.SetStateAction<Map<string, TaskSummary[]>>>;
  setExpandedAreas: React.Dispatch<React.SetStateAction<Set<string>>>;
  setExpandedFolders: React.Dispatch<React.SetStateAction<Set<string>>>;
  notifyTaskUpdate: (taskId?: string, folderId?: string) => void;
  showError: (error: unknown) => void;
}

export function useTreeTaskHandlers({
  areas,
  setAreas,
  setTasksByArea,
  setTasksByFolder,
  setExpandedAreas,
  setExpandedFolders,
  openTaskModal,
  notifyTaskUpdate,
  showError,
}: UseTreeTaskHandlersOptions) {
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
          setExpandedFolders((prev) => new Set(prev).add(folderId));
        } else {
          const tasks = await fetchTaskSummaryByAreaRoot(areaId);
          setTasksByArea((prev) => new Map(prev).set(areaId, tasks));
          setAreas((prev) =>
            prev.map((a) => (a.id === areaId ? { ...a, rootTasksCount: tasks.length } : a))
          );
        }
        setExpandedAreas((prev) => new Set(prev).add(areaId));
        notifyTaskUpdate(taskId, folderId);
      } catch (error) {
        throw error;
      }
    },
    [setAreas, setTasksByArea, setTasksByFolder, setExpandedAreas, setExpandedFolders, notifyTaskUpdate]
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
          setAreas((prev) =>
            prev.map((a) => (a.id === areaId ? { ...a, rootTasksCount: tasks.length } : a))
          );
        }
        notifyTaskUpdate(id, folderId);
      } catch (error) {
        throw error;
      }
    },
    [setAreas, setTasksByArea, setTasksByFolder, notifyTaskUpdate]
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
        showError(error);
      }
    },
    [areas, openTaskModal, handleTaskSave, handleTaskDelete, showError]
  );

  return useMemo(() => ({
    handleTaskSave,
    handleTaskDelete,
    handleCreateTaskForArea,
    handleCreateTaskForFolder,
    handleViewTaskDetails,
  }), [handleTaskSave, handleTaskDelete, handleCreateTaskForArea, handleCreateTaskForFolder, handleViewTaskDetails]);
}
