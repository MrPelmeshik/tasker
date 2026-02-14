import {
  fetchAreaById,
  fetchFolderById,
  fetchTaskById,
} from '../../../../services/api';
import type { FolderResponse } from '../../../../types/api';
import type { OpenEntityByDeepLinkParams } from './TreeDeepLink.types';
import { isValidEntityId } from '../../../../utils/entity-links';

export type { OpenEntityByDeepLinkParams } from './TreeDeepLink.types';

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
