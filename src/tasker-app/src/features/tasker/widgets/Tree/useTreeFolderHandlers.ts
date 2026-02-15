/**
 * Обработчики для папок в виджете дерева.
 */

import { useCallback, useMemo } from 'react';
import {
  fetchFolderById,
  createFolder,
  updateFolder,
  deleteFolder,
  fetchRootFoldersByArea,
  fetchChildFolders,
} from '../../../../services/api';
import type {
  AreaShortCard,
  FolderSummary,
  TaskSummary,
  FolderCreateRequest,
  FolderUpdateRequest,
} from '../../../../types';
import type { ModalContextType } from '../../../../context/ModalContext';

export interface UseTreeFolderHandlersOptions
  extends Pick<ModalContextType, 'openFolderModal'> {
  areas: AreaShortCard[];
  setAreas: React.Dispatch<React.SetStateAction<AreaShortCard[]>>;
  setFoldersByArea: React.Dispatch<React.SetStateAction<Map<string, FolderSummary[]>>>;
  setFoldersByParent: React.Dispatch<React.SetStateAction<Map<string, FolderSummary[]>>>;
  setTasksByFolder: React.Dispatch<React.SetStateAction<Map<string, TaskSummary[]>>>;
  setExpandedAreas: React.Dispatch<React.SetStateAction<Set<string>>>;
  setExpandedFolders: React.Dispatch<React.SetStateAction<Set<string>>>;
  showError: (error: unknown) => void;
}

export function useTreeFolderHandlers({
  areas,
  setAreas,
  setFoldersByArea,
  setFoldersByParent,
  setTasksByFolder,
  setExpandedAreas,
  setExpandedFolders,
  openFolderModal,
  showError,
}: UseTreeFolderHandlersOptions) {
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
          setExpandedFolders((prev) => new Set(prev).add(data.parentFolderId!));
        }
        setAreas((prev) => prev.map((a) => (a.id === areaId ? { ...a, foldersCount: rootFolders.length } : a)));
        setExpandedAreas((prev) => new Set(prev).add(areaId));
      } catch (error) {
        console.error('Ошибка сохранения папки:', error);
        throw error;
      }
    },
    [setAreas, setFoldersByArea, setFoldersByParent, setExpandedAreas, setExpandedFolders]
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
        showError(error);
      }
    },
    [areas, openFolderModal, handleFolderSave, handleFolderDelete, showError]
  );

  return useMemo(() => ({
    handleFolderSave,
    handleFolderDelete,
    handleCreateFolderForArea,
    handleCreateFolderForFolder,
    handleViewFolderDetails,
  }), [handleFolderSave, handleFolderDelete, handleCreateFolderForArea, handleCreateFolderForFolder, handleViewFolderDetails]);
}
