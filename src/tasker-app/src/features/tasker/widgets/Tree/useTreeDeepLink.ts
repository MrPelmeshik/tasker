import { useEffect, useRef, type MutableRefObject } from 'react';
import type { EntityType } from '../../../../utils/entity-links';
import { openEntityByDeepLink, type OpenEntityByDeepLinkParams } from './treeDeepLinkUtils';

export interface UseTreeDeepLinkParams extends Omit<OpenEntityByDeepLinkParams, 'entityType' | 'entityId'> {
  loading: boolean;
  initialDeepLink: { entityType: EntityType; entityId: string } | undefined;
  /**
   * Общий ref ключа уже обработанного deep link (`entityType:entityId`).
   * Если задан, повторный вызов openEntityByDeepLink с тем же ключом пропускается (например при смене режима Активности/Календарь).
   */
  processedDeepLinkKeyRef?: MutableRefObject<string | null>;
}

export function useTreeDeepLink(params: UseTreeDeepLinkParams): void {
  const {
    loading,
    initialDeepLink,
    processedDeepLinkKeyRef: sharedProcessedKeyRef,
    areas,
    foldersByArea,
    foldersByParent,
    tasksByArea,
    tasksByFolder,
    setExpandedAreas,
    setExpandedFolders,
    loadAreaContent,
    loadFolderContent,
    openAreaDetail,
    openFolderDetail,
    openTaskDetail,
    showError,
    handleAreaSave,
    handleAreaDelete,
    handleFolderSave,
    handleFolderDelete,
    handleTaskSave,
    handleTaskDelete,
  } = params;

  const internalProcessedKeyRef = useRef<string | null>(null);
  const processedKeyRef = sharedProcessedKeyRef ?? internalProcessedKeyRef;

  useEffect(() => {
    if (loading || !initialDeepLink) return;
    const key = `${initialDeepLink.entityType}:${initialDeepLink.entityId}`;
    if (processedKeyRef.current === key) return;
    processedKeyRef.current = key;

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
      openAreaDetail,
      openFolderDetail,
      openTaskDetail,
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
    openAreaDetail,
    openFolderDetail,
    openTaskDetail,
    showError,
    handleAreaSave,
    handleAreaDelete,
    handleFolderSave,
    handleFolderDelete,
    handleTaskSave,
    handleTaskDelete,
    processedKeyRef,
  ]);
}
