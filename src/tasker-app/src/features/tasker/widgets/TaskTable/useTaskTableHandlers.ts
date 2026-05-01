/**
 * Обработчики для виджета таблицы задач.
 */

import { useCallback } from 'react';
import {
  fetchTaskById,
  fetchAreaById,
  fetchFolderById,
  fetchAreaShortCard,
  createArea,
  updateArea,
  deleteArea,
  createFolder,
  updateFolder,
  deleteFolder,
  updateTask,
  deleteTask,
} from '../../../../services/api';
import type {
  TaskResponse,
  TaskCreateRequest,
  TaskUpdateRequest,
  AreaCreateRequest,
  AreaUpdateRequest,
  FolderCreateRequest,
  FolderUpdateRequest,
  AreaResponse,
  FolderResponse,
  EventUpdateRequest,
  EventResponse,
} from '../../../../types/api';
import type { ModalSize } from '../../../../types';
import type { TaskRowTask } from './taskTableUtils';
import type { ActivityFormData } from '../../../../components/activities/ActivityDetailEditor';

export interface UseTaskTableHandlersOptions {
  loadData: () => Promise<void>;
  showError: (error: unknown) => void;
  notifyTaskUpdate: (taskId?: string, folderId?: string) => void;
  openAreaDetail: (
    area: AreaResponse | null,
    mode: 'create' | 'edit',
    onSave: (data: AreaCreateRequest | AreaUpdateRequest) => Promise<void>,
    onDelete?: (id: string) => Promise<void>,
    size?: ModalSize
  ) => void;
  openFolderDetail: (
    folder: FolderResponse | null,
    mode: 'create' | 'edit',
    areas: Array<{ id: string; title: string; description?: string }>,
    onSave: (data: FolderCreateRequest | FolderUpdateRequest, folderId?: string) => Promise<void>,
    onDelete?: (id: string) => Promise<void>,
    areaId?: string,
    parentFolderId?: string | null,
    size?: ModalSize
  ) => void;
  openTaskDetail: (task: TaskResponse | null, mode: 'create' | 'edit', onSave: (data: TaskCreateRequest | TaskUpdateRequest, taskId?: string) => Promise<void>, onDelete?: (id: string) => Promise<void>, defaultFolderId?: string, defaultAreaId?: string, areas?: Array<{ id: string; title: string }>) => void;
  openActivityDetail: (
    task: TaskResponse,
    date: string,
    onSave: (data: ActivityFormData) => Promise<void>,
    onOpenTaskDetail: () => void,
    onSaveEdit?: (eventId: string, data: EventUpdateRequest) => Promise<void>,
    onDeleteEvent?: (event: EventResponse) => Promise<void>
  ) => void;
  closeActivityDetail: () => void;
  handleActivitySaveForTask: (task: TaskResponse) => (data: ActivityFormData) => Promise<void>;
  handleActivityUpdateForTask: (task: TaskResponse) => (eventId: string, data: EventUpdateRequest) => Promise<void>;
  handleActivityDeleteForTask: (task: TaskResponse) => (event: { id: string }) => Promise<void>;
}

export function useTaskTableHandlers({
  loadData,
  showError,
  notifyTaskUpdate,
  openAreaDetail,
  openFolderDetail,
  openTaskDetail,
  openActivityDetail,
  closeActivityDetail,
  handleActivitySaveForTask,
  handleActivityUpdateForTask,
  handleActivityDeleteForTask,
}: UseTaskTableHandlersOptions) {
  const handleTaskSave = useCallback(async (data: TaskUpdateRequest, taskId?: string) => {
    if (!taskId) return;
    try {
      await updateTask(taskId, data);
      await loadData();
      notifyTaskUpdate(taskId, data.folderId ?? undefined);
    } catch (error) {
      throw error;
    }
  }, [loadData, notifyTaskUpdate]);

  const handleTaskDelete = useCallback(async (id: string) => {
    try {
      await deleteTask(id);
      await loadData();
      notifyTaskUpdate(id, undefined);
    } catch (error) {
      throw error;
    }
  }, [loadData, notifyTaskUpdate]);

  const getAreasForFolderDetail = useCallback(async () => {
    const areas = await fetchAreaShortCard();
    return areas.map((a) => ({ id: a.id, title: a.title, description: a.description }));
  }, []);

  /** <summary>Сохранение области из таблицы активностей.</summary> */
  const handleAreaSave = useCallback(async (
    data: (AreaCreateRequest | AreaUpdateRequest) & { selectedColor?: string; id?: string }
  ) => {
    const color = data.selectedColor ?? data.color ?? '#808080';
    const payload = { title: data.title, description: data.description, color };
    if (data.id) {
      await updateArea(data.id, payload);
    } else {
      await createArea(payload);
    }
    await loadData();
    notifyTaskUpdate();
  }, [loadData, notifyTaskUpdate]);

  const handleAreaDelete = useCallback(async (id: string) => {
    await deleteArea(id);
    await loadData();
    notifyTaskUpdate();
  }, [loadData, notifyTaskUpdate]);

  const handleViewAreaDetails = useCallback(async (areaId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const area = await fetchAreaById(areaId);
      if (!area) return;
      openAreaDetail(area, 'edit', handleAreaSave, handleAreaDelete);
    } catch (error) {
      showError(error);
    }
  }, [openAreaDetail, handleAreaSave, handleAreaDelete, showError]);

  /** <summary>Сохранение папки из таблицы активностей.</summary> */
  const handleFolderSave = useCallback(async (data: FolderCreateRequest | FolderUpdateRequest, folderId?: string) => {
    if (folderId) {
      await updateFolder(folderId, data as FolderUpdateRequest);
    } else {
      await createFolder(data as FolderCreateRequest);
    }
    await loadData();
    notifyTaskUpdate(undefined, data.parentFolderId ?? undefined);
  }, [loadData, notifyTaskUpdate]);

  const handleFolderDelete = useCallback(async (id: string) => {
    await deleteFolder(id);
    await loadData();
    notifyTaskUpdate();
  }, [loadData, notifyTaskUpdate]);

  const handleViewFolderDetails = useCallback(async (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const folder = await fetchFolderById(folderId);
      if (!folder) return;
      const areasForPicker = await getAreasForFolderDetail();
      openFolderDetail(
        folder,
        'edit',
        areasForPicker,
        (data, fid) => handleFolderSave(data as FolderUpdateRequest, fid),
        handleFolderDelete
      );
    } catch (error) {
      showError(error);
    }
  }, [getAreasForFolderDetail, openFolderDetail, handleFolderSave, handleFolderDelete, showError]);

  const handleDayCellClick = useCallback(
    (task: TaskRowTask, date: string, event: React.MouseEvent) => {
      event.stopPropagation();
      const onOpenTaskDetail = async () => {
        closeActivityDetail();
        try {
          const fullTask = await fetchTaskById(task.id);
          if (!fullTask) return;
          const areasData = await fetchAreaShortCard();
          const areasForTask = areasData.map(a => ({ id: a.id, title: a.title }));
          openTaskDetail(fullTask, 'edit', (data, id) => handleTaskSave(data, id), handleTaskDelete, undefined, undefined, areasForTask);
        } catch (error) {
          showError(error);
        }
      };
      openActivityDetail(
        task as TaskResponse,
        date,
        handleActivitySaveForTask(task as TaskResponse),
        onOpenTaskDetail,
        handleActivityUpdateForTask(task as TaskResponse),
        handleActivityDeleteForTask(task as TaskResponse)
      );
    },
    [openActivityDetail, closeActivityDetail, openTaskDetail, handleTaskSave, handleTaskDelete, handleActivitySaveForTask, handleActivityUpdateForTask, handleActivityDeleteForTask, showError]
  );

  const handleViewTaskDetails = useCallback(async (taskId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      const task = await fetchTaskById(taskId);
      if (!task) return;
      const areasData = await fetchAreaShortCard();
      const areasForTask = areasData.map(a => ({ id: a.id, title: a.title }));
      openTaskDetail(task, 'edit', (data, id) => handleTaskSave(data, id), handleTaskDelete, undefined, undefined, areasForTask);
    } catch (error) {
      showError(error);
    }
  }, [openTaskDetail, handleTaskSave, handleTaskDelete, showError]);

  const handleCreateFolderForArea = useCallback(async (areaId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const areasForPicker = await getAreasForFolderDetail();
      openFolderDetail(
        null,
        'create',
        areasForPicker,
        (data, folderId) => handleFolderSave(data as FolderCreateRequest, folderId),
        undefined,
        areaId,
        null
      );
    } catch (error) {
      showError(error);
    }
  }, [getAreasForFolderDetail, openFolderDetail, handleFolderSave, showError]);

  const handleCreateTaskForArea = useCallback(async (areaId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const areasData = await fetchAreaShortCard();
      const areasForTask = areasData.map((a) => ({ id: a.id, title: a.title }));
      openTaskDetail(null, 'create', (data, taskId) => handleTaskSave(data, taskId), undefined, undefined, areaId, areasForTask);
    } catch (error) {
      showError(error);
    }
  }, [openTaskDetail, handleTaskSave, showError]);

  const handleCreateFolderForFolder = useCallback(async (folderId: string, areaId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const areasForPicker = await getAreasForFolderDetail();
      openFolderDetail(
        null,
        'create',
        areasForPicker,
        (data, fid) => handleFolderSave(data as FolderCreateRequest, fid),
        undefined,
        areaId,
        folderId
      );
    } catch (error) {
      showError(error);
    }
  }, [getAreasForFolderDetail, openFolderDetail, handleFolderSave, showError]);

  const handleCreateTaskForFolder = useCallback(async (folderId: string, areaId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const areasData = await fetchAreaShortCard();
      const areasForTask = areasData.map((a) => ({ id: a.id, title: a.title }));
      openTaskDetail(null, 'create', (data, taskId) => handleTaskSave(data, taskId), undefined, folderId, areaId, areasForTask);
    } catch (error) {
      showError(error);
    }
  }, [openTaskDetail, handleTaskSave, showError]);

  return {
    handleTaskSave,
    handleTaskDelete,
    handleAreaSave,
    handleAreaDelete,
    handleViewAreaDetails,
    handleFolderSave,
    handleFolderDelete,
    handleViewFolderDetails,
    handleCreateFolderForArea,
    handleCreateTaskForArea,
    handleCreateFolderForFolder,
    handleCreateTaskForFolder,
    handleDayCellClick,
    handleViewTaskDetails,
  };
}
