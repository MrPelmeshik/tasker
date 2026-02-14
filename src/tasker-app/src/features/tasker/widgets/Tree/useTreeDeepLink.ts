import { useEffect, useRef } from 'react';
import type { EntityType } from '../../../../utils/entity-links';
import { openEntityByDeepLink, type OpenEntityByDeepLinkParams } from './treeDeepLinkUtils';

export interface UseTreeDeepLinkParams extends Omit<OpenEntityByDeepLinkParams, 'entityType' | 'entityId'> {
  loading: boolean;
  initialDeepLink: { entityType: EntityType; entityId: string } | undefined;
}

export function useTreeDeepLink(params: UseTreeDeepLinkParams): void {
  const {
    loading,
    initialDeepLink,
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

  const processedDeepLinkRef = useRef<string | null>(null);

  useEffect(() => {
    if (loading || !initialDeepLink) return;
    const key = `${initialDeepLink.entityType}:${initialDeepLink.entityId}`;
    if (processedDeepLinkRef.current === key) return;
    processedDeepLinkRef.current = key;

    openEntityByDeepLink({
      entityType: initialDeepLink.entityType,
      entityId: initialDeepLink.entityId,
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
    });
  }, [
    loading,
    initialDeepLink,
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
  ]);
}
