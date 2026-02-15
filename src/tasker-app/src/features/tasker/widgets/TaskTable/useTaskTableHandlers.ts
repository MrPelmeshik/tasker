/**
 * Обработчики для виджета таблицы задач.
 */

import { useCallback } from 'react';
import {
  fetchTaskById,
  fetchAreaShortCard,
  updateTask,
  deleteTask,
} from '../../../../services/api';
import type { TaskResponse, TaskUpdateRequest } from '../../../../types/api';
import type { TaskRowTask } from './taskTableUtils';
import type { ActivityFormData } from '../../../../components/activities/ActivityModal';

export interface UseTaskTableHandlersOptions {
  loadData: () => Promise<void>;
  showError: (error: unknown) => void;
  notifyTaskUpdate: (taskId?: string, folderId?: string) => void;
  openTaskModal: (task: TaskResponse | null, mode: 'create' | 'edit', onSave: (data: TaskUpdateRequest, taskId?: string) => Promise<void>, onDelete?: (id: string) => Promise<void>, defaultFolderId?: string, defaultAreaId?: string, areas?: Array<{ id: string; title: string }>) => void;
  openActivityModal: (task: TaskResponse, date: string, onSave: (data: ActivityFormData) => Promise<void>, onOpenTaskDetails: () => void) => void;
  closeActivityModal: () => void;
  handleActivitySaveForTask: (task: TaskResponse) => (data: ActivityFormData) => Promise<void>;
}

export function useTaskTableHandlers({
  loadData,
  showError,
  notifyTaskUpdate,
  openTaskModal,
  openActivityModal,
  closeActivityModal,
  handleActivitySaveForTask,
}: UseTaskTableHandlersOptions) {
  const handleTaskSave = useCallback(async (data: TaskUpdateRequest, taskId?: string) => {
    if (!taskId) return;
    try {
      await updateTask(taskId, data);
      await loadData();
      notifyTaskUpdate(taskId, data.folderId ?? undefined);
    } catch (error) {
      console.error('Ошибка сохранения задачи:', error);
      throw error;
    }
  }, [loadData, notifyTaskUpdate]);

  const handleTaskDelete = useCallback(async (id: string) => {
    try {
      await deleteTask(id);
      await loadData();
      notifyTaskUpdate(id, undefined);
    } catch (error) {
      console.error('Ошибка удаления задачи:', error);
      throw error;
    }
  }, [loadData, notifyTaskUpdate]);

  const handleDayCellClick = useCallback(
    (task: TaskRowTask, date: string, event: React.MouseEvent) => {
      event.stopPropagation();
      const onOpenTaskDetails = async () => {
        closeActivityModal();
        try {
          const fullTask = await fetchTaskById(task.id);
          if (!fullTask) return;
          const areasData = await fetchAreaShortCard();
          const areasForTaskModal = areasData.map(a => ({ id: a.id, title: a.title }));
          openTaskModal(fullTask, 'edit', (data, id) => handleTaskSave(data, id), handleTaskDelete, undefined, undefined, areasForTaskModal);
        } catch (error) {
          console.error('Ошибка загрузки задачи:', error);
          showError(error);
        }
      };
      openActivityModal(task as TaskResponse, date, handleActivitySaveForTask(task as TaskResponse), onOpenTaskDetails);
    },
    [openActivityModal, closeActivityModal, openTaskModal, handleTaskSave, handleTaskDelete, handleActivitySaveForTask, showError]
  );

  const handleViewTaskDetails = useCallback(async (taskId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      const task = await fetchTaskById(taskId);
      if (!task) return;
      const areasData = await fetchAreaShortCard();
      const areasForTaskModal = areasData.map(a => ({ id: a.id, title: a.title }));
      openTaskModal(task, 'edit', (data, id) => handleTaskSave(data, id), handleTaskDelete, undefined, undefined, areasForTaskModal);
    } catch (error) {
      console.error('Ошибка загрузки задачи:', error);
      showError(error);
    }
  }, [openTaskModal, handleTaskSave, handleTaskDelete, showError]);

  return {
    handleTaskSave,
    handleTaskDelete,
    handleDayCellClick,
    handleViewTaskDetails,
  };
}
