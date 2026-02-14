/**
 * Обработчики для областей в виджете дерева.
 */

import { useCallback } from 'react';
import { fetchAreaShortCard, fetchAreaById, createArea, updateArea, deleteArea } from '../../../../services/api';
import type { AreaShortCard, FolderSummary, TaskSummary, AreaCreateRequest, AreaUpdateRequest } from '../../../../types';
import type { ModalContextType } from '../../../../context/ModalContext';

export interface UseTreeAreaHandlersOptions
  extends Pick<ModalContextType, 'openAreaModal'> {
  areas: AreaShortCard[];
  setAreas: React.Dispatch<React.SetStateAction<AreaShortCard[]>>;
  setFoldersByArea: React.Dispatch<React.SetStateAction<Map<string, FolderSummary[]>>>;
  setTasksByArea: React.Dispatch<React.SetStateAction<Map<string, TaskSummary[]>>>;
  showError: (error: unknown) => void;
}

export function useTreeAreaHandlers({
  areas,
  setAreas,
  setFoldersByArea,
  setTasksByArea,
  openAreaModal,
  showError,
}: UseTreeAreaHandlersOptions) {
  const handleAreaSave = useCallback(
    async (data: AreaCreateRequest | (AreaUpdateRequest & { id?: string })) => {
      try {
        const d = data as { id?: string } & AreaCreateRequest;
        if (!d.id) await createArea(data as AreaCreateRequest);
        else await updateArea(d.id, data as AreaUpdateRequest);
        const updated = await fetchAreaShortCard();
        setAreas(updated);
      } catch (error) {
        console.error('Ошибка сохранения области:', error);
        throw error;
      }
    },
    [setAreas]
  );

  const handleAreaDelete = useCallback(
    async (id: string) => {
      try {
        await deleteArea(id);
        const updated = await fetchAreaShortCard();
        setAreas(updated);
        setFoldersByArea((prev) => {
          const next = new Map(prev);
          next.delete(id);
          return next;
        });
        setTasksByArea((prev) => {
          const next = new Map(prev);
          next.delete(id);
          return next;
        });
      } catch (error) {
        console.error('Ошибка удаления области:', error);
        throw error;
      }
    },
    [setAreas, setFoldersByArea, setTasksByArea]
  );

  const handleCreateArea = useCallback(() => {
    openAreaModal(null, 'create', handleAreaSave);
  }, [openAreaModal, handleAreaSave]);

  const handleViewAreaDetails = useCallback(
    async (areaId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      try {
        const area = await fetchAreaById(areaId);
        if (area) openAreaModal(area, 'edit', handleAreaSave, handleAreaDelete);
      } catch (error) {
        console.error('Ошибка загрузки области:', error);
        showError(error);
      }
    },
    [openAreaModal, handleAreaSave, handleAreaDelete, showError]
  );

  return {
    handleAreaSave,
    handleAreaDelete,
    handleCreateArea,
    handleViewAreaDetails,
  };
}
