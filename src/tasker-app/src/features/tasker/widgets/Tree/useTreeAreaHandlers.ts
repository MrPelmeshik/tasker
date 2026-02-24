/**
 * Обработчики для областей в виджете дерева.
 */

import { useCallback, useMemo } from 'react';
import { fetchAreaShortCard, fetchAreaById, createArea, updateArea, deleteArea } from '../../../../services/api';
import type { AreaShortCard, FolderSummary, TaskSummary, AreaCreateRequest, AreaUpdateRequest } from '../../../../types';
import type { ModalContextType } from '../../../../context/ModalContext';

/** Данные формы: API-поля + selectedColor для формы (отправляется как color). */
type AreaSaveData = (AreaCreateRequest | (AreaUpdateRequest & { id?: string })) & { selectedColor?: string };

/** Сортировка областей по названию (алфавит), как в useTreeData. */
function sortAreasByTitle(items: AreaShortCard[]): AreaShortCard[] {
  return [...items].sort((a, b) =>
    (a.title ?? '').localeCompare(b.title ?? '', undefined, { sensitivity: 'base' })
  );
}

export interface UseTreeAreaHandlersOptions
  extends Pick<ModalContextType, 'openAreaModal'> {
  areas: AreaShortCard[];
  setAreas: React.Dispatch<React.SetStateAction<AreaShortCard[]>>;
  setFoldersByArea: React.Dispatch<React.SetStateAction<Map<string, FolderSummary[]>>>;
  setTasksByArea: React.Dispatch<React.SetStateAction<Map<string, TaskSummary[]>>>;
  showError: (error: unknown) => void;
  notifyTaskUpdate?: (taskId?: string, folderId?: string, payload?: { entityType?: string; entityId?: string }) => void;
}

export function useTreeAreaHandlers({
  areas,
  setAreas,
  setFoldersByArea,
  setTasksByArea,
  openAreaModal,
  showError,
  notifyTaskUpdate,
}: UseTreeAreaHandlersOptions) {
  const handleAreaSave = useCallback(
    async (data: AreaSaveData) => {
      try {
        const color = data.selectedColor ?? (data as AreaCreateRequest).color ?? '#808080';
        const apiData = {
          title: data.title,
          description: data.description,
          color,
        };
        const d = data as { id?: string };
        if (!d.id) {
          await createArea(apiData as AreaCreateRequest);
        } else {
          await updateArea(d.id, apiData as AreaUpdateRequest);
        }
        const updated = await fetchAreaShortCard();
        if (d.id) {
          setAreas((prev) => {
            const byId = new Map(updated.map((a) => [a.id, a]));
            return prev.map((a) => byId.get(a.id) ?? a);
          });
        } else {
          setAreas(sortAreasByTitle(updated));
        }
      } catch (error) {
        throw error;
      }
    },
    [setAreas]
  );

  /** Установить цвет области (обновление области через API). Без перезапроса списка — только локальное обновление, чтобы не сбивать сортировку. */
  const handleSetAreaColor = useCallback(
    async (areaId: string, hex: string) => {
      const area = areas.find((a) => a.id === areaId);
      if (!area) return;
      try {
        await updateArea(areaId, {
          title: area.title,
          description: area.description ?? '',
          color: hex,
        });
        setAreas((prev) => prev.map((a) => (a.id === areaId ? { ...a, customColor: hex } : a)));
        notifyTaskUpdate?.(undefined, undefined, { entityType: 'AREA', entityId: areaId });
      } catch (error) {
        showError(error);
      }
    },
    [areas, setAreas, showError, notifyTaskUpdate]
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
        showError(error);
      }
    },
    [openAreaModal, handleAreaSave, handleAreaDelete, showError]
  );

  return useMemo(() => ({
    handleAreaSave,
    handleAreaDelete,
    handleCreateArea,
    handleViewAreaDetails,
    handleSetAreaColor,
  }), [handleAreaSave, handleAreaDelete, handleCreateArea, handleViewAreaDetails, handleSetAreaColor]);
}
