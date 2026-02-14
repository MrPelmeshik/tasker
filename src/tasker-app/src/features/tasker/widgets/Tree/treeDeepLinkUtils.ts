import React from 'react';
import {
  fetchAreaById,
  fetchFolderById,
  fetchTaskById,
} from '../../../../services/api';
import type { FolderResponse } from '../../../../types/api';
import type { AreaShortCard, FolderSummary, TaskSummary } from '../../../../types';
import { isValidEntityId } from '../../../../utils/entity-links';
import type { EntityType } from '../../../../utils/entity-links';

export interface OpenEntityByDeepLinkParams {
  entityType: EntityType;
  entityId: string;
  areas: AreaShortCard[];
  foldersByArea: Map<string, FolderSummary[]>;
  foldersByParent: Map<string, FolderSummary[]>;
  tasksByArea: Map<string, TaskSummary[]>;
  tasksByFolder: Map<string, TaskSummary[]>;
  setExpandedAreas: React.Dispatch<React.SetStateAction<Set<string>>>;
  setExpandedFolders: React.Dispatch<React.SetStateAction<Set<string>>>;
  loadAreaContent: (areaId: string) => Promise<unknown>;
  loadFolderContent: (folderId: string, areaId: string) => Promise<unknown>;
  openAreaModal: (area: import('../../../../types/api').AreaResponse, mode: 'edit', onSave: (data: import('../../../../types/api').AreaCreateRequest | import('../../../../types/api').AreaUpdateRequest) => Promise<void>, onDelete?: (id: string) => Promise<void>) => void;
  openFolderModal: (folder: import('../../../../types/api').FolderResponse, mode: 'edit', areas: Array<{ id: string; title: string; description?: string }>, onSave: (data: import('../../../../types/api').FolderCreateRequest | import('../../../../types/api').FolderUpdateRequest, folderId?: string) => Promise<void>, onDelete?: (id: string) => Promise<void>) => void;
  openTaskModal: (task: import('../../../../types/api').TaskResponse, mode: 'edit', onSave: (data: import('../../../../types/api').TaskCreateRequest | import('../../../../types/api').TaskUpdateRequest, taskId?: string) => Promise<void>, onDelete?: (id: string) => Promise<void>, defaultFolderId?: string, defaultAreaId?: string, areas?: Array<{ id: string; title: string }>) => void;
  showError: (error: unknown) => void;
  handleAreaSave: (data: import('../../../../types/api').AreaCreateRequest | import('../../../../types/api').AreaUpdateRequest) => Promise<void>;
  handleAreaDelete: (id: string) => Promise<void>;
  handleFolderSave: (data: import('../../../../types/api').FolderCreateRequest | import('../../../../types/api').FolderUpdateRequest, folderId?: string) => Promise<void>;
  handleFolderDelete: (id: string) => Promise<void>;
  handleTaskSave: (data: import('../../../../types/api').TaskCreateRequest | import('../../../../types/api').TaskUpdateRequest, taskId?: string) => Promise<void>;
  handleTaskDelete: (id: string) => Promise<void>;
}

export async function openEntityByDeepLink(params: OpenEntityByDeepLinkParams): Promise<void> {
  const {
    entityType,
    entityId,
    areas,
    foldersByArea,
    foldersByParent,
    tasksByArea,
    tasksByFolder,
    setExpandedAreas,
    setExpandedFolders,
    loadAreaContent,
    loadFolderContent,
    openAreaModal,
    openFolderModal,
    openTaskModal,
    showError,
    handleAreaSave,
    handleAreaDelete,
    handleFolderSave,
    handleFolderDelete,
    handleTaskSave,
    handleTaskDelete,
  } = params;

  if (!isValidEntityId(entityId)) {
    showError('Ресурс не найден');
    return;
  }

  try {
    if (entityType === 'area') {
      const area = await fetchAreaById(entityId);
      if (!area) {
        showError('Ресурс недоступен');
        return;
      }
      setExpandedAreas((prev) => new Set(prev).add(area.id));
      if (!foldersByArea.has(area.id) && !tasksByArea.has(area.id)) {
        await loadAreaContent(area.id);
      }
      openAreaModal(area, 'edit', handleAreaSave, handleAreaDelete);
    } else if (entityType === 'folder') {
      const folder = await fetchFolderById(entityId);
      if (!folder) {
        showError('Ресурс недоступен');
        return;
      }
      setExpandedAreas((prev) => new Set(prev).add(folder.areaId));
      const folderIdsToExpand: string[] = [];
      let current: FolderResponse | null = folder;
      while (current) {
        folderIdsToExpand.unshift(current.id);
        if (current.parentFolderId) {
          const parent: FolderResponse | null = await fetchFolderById(current.parentFolderId);
          current = parent;
        } else {
          current = null;
        }
      }
      if (!foldersByArea.has(folder.areaId) && !tasksByArea.has(folder.areaId)) {
        await loadAreaContent(folder.areaId);
      }
      for (let i = 0; i < folderIdsToExpand.length - 1; i++) {
        const fid = folderIdsToExpand[i];
        setExpandedFolders((prev) => new Set(prev).add(fid));
        if (!foldersByParent.has(fid) && !tasksByFolder.has(fid)) {
          await loadFolderContent(fid, folder.areaId);
        }
      }
      setExpandedFolders((prev) => new Set(prev).add(folder.id));
      if (!foldersByParent.has(folder.id) && !tasksByFolder.has(folder.id)) {
        await loadFolderContent(folder.id, folder.areaId);
      }
      const areasForModal = areas.map((a) => ({ ...a, id: a.id, title: a.title, description: a.description }));
      openFolderModal(folder, 'edit', areasForModal, handleFolderSave, handleFolderDelete);
    } else {
      const task = await fetchTaskById(entityId);
      if (!task) {
        showError('Ресурс недоступен');
        return;
      }
      setExpandedAreas((prev) => new Set(prev).add(task.areaId));
      if (task.folderId) {
        let currentFolderId: string | null = task.folderId;
        const folderChain: { id: string; areaId: string }[] = [];
        while (currentFolderId) {
          const f: FolderResponse | null = await fetchFolderById(currentFolderId);
          if (!f) break;
          folderChain.unshift({ id: f.id, areaId: f.areaId });
          currentFolderId = f.parentFolderId ?? null;
        }
        if (!foldersByArea.has(task.areaId) && !tasksByArea.has(task.areaId)) {
          await loadAreaContent(task.areaId);
        }
        for (let i = 0; i < folderChain.length; i++) {
          const { id: fid, areaId } = folderChain[i];
          setExpandedFolders((prev) => new Set(prev).add(fid));
          if (!foldersByParent.has(fid) && !tasksByFolder.has(fid)) {
            await loadFolderContent(fid, areaId);
          }
        }
      } else if (!foldersByArea.has(task.areaId) && !tasksByArea.has(task.areaId)) {
        await loadAreaContent(task.areaId);
      }
      const areasForTaskModal = areas.map((a) => ({ id: a.id, title: a.title }));
      openTaskModal(task, 'edit', handleTaskSave, handleTaskDelete, undefined, undefined, areasForTaskModal);
    }
  } catch {
    showError('Ресурс недоступен');
  }
}
