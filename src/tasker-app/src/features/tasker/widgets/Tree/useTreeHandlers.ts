import { useMemo } from 'react';
import type { UseTreeHandlersOptions } from './useTreeHandlers.types';
import { useTreeAreaHandlers } from './useTreeAreaHandlers';
import { useTreeFolderHandlers } from './useTreeFolderHandlers';
import { useTreeTaskHandlers } from './useTreeTaskHandlers';

export type { UseTreeHandlersOptions } from './useTreeHandlers.types';

export function useTreeHandlers(options: UseTreeHandlersOptions) {
  const areaHandlers = useTreeAreaHandlers({
    areas: options.areas,
    setAreas: options.setAreas,
    setFoldersByArea: options.setFoldersByArea,
    setTasksByArea: options.setTasksByArea,
    openAreaModal: options.openAreaModal,
    showError: options.showError,
  });

  const folderHandlers = useTreeFolderHandlers({
    areas: options.areas,
    setAreas: options.setAreas,
    setFoldersByArea: options.setFoldersByArea,
    setFoldersByParent: options.setFoldersByParent,
    setTasksByFolder: options.setTasksByFolder,
    setExpandedAreas: options.setExpandedAreas,
    setExpandedFolders: options.setExpandedFolders,
    openFolderModal: options.openFolderModal,
    showError: options.showError,
  });

  const taskHandlers = useTreeTaskHandlers({
    areas: options.areas,
    setAreas: options.setAreas,
    setTasksByArea: options.setTasksByArea,
    setTasksByFolder: options.setTasksByFolder,
    setExpandedAreas: options.setExpandedAreas,
    setExpandedFolders: options.setExpandedFolders,
    openTaskModal: options.openTaskModal,
    notifyTaskUpdate: options.notifyTaskUpdate,
    showError: options.showError,
  });

  return useMemo(() => ({
    ...areaHandlers,
    ...folderHandlers,
    ...taskHandlers,
  }), [areaHandlers, folderHandlers, taskHandlers]);
}
