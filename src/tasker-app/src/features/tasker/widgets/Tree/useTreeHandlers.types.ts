/**
 * Типы для useTreeHandlers и его под-хуков.
 */

import type { AreaShortCard, FolderSummary, TaskSummary } from '../../../../types';
import type { ModalContextType } from '../../../../context/ModalContext';

export interface UseTreeHandlersOptions
  extends Pick<ModalContextType, 'openAreaModal' | 'openFolderModal' | 'openTaskModal'> {
  areas: AreaShortCard[];
  setAreas: React.Dispatch<React.SetStateAction<AreaShortCard[]>>;
  setFoldersByArea: React.Dispatch<React.SetStateAction<Map<string, FolderSummary[]>>>;
  setFoldersByParent: React.Dispatch<React.SetStateAction<Map<string, FolderSummary[]>>>;
  setTasksByArea: React.Dispatch<React.SetStateAction<Map<string, TaskSummary[]>>>;
  setTasksByFolder: React.Dispatch<React.SetStateAction<Map<string, TaskSummary[]>>>;
  setExpandedAreas: React.Dispatch<React.SetStateAction<Set<string>>>;
  setExpandedFolders: React.Dispatch<React.SetStateAction<Set<string>>>;
  loadFolderContent: (folderId: string, areaId: string) => Promise<FolderSummary[]>;
  foldersByParent: Map<string, FolderSummary[]>;
  showError: (error: unknown) => void;
  addSuccess: (message: string) => void;
  notifyTaskUpdate: (taskId?: string, folderId?: string, payload?: { entityType?: string; entityId?: string }) => void;
}
