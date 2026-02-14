import { useCallback } from 'react';
import { buildEntityUrl } from '../utils/entity-links';
import type { EntityType } from '../utils/entity-links';
import { useToast } from '../context/ToastContext';

/**
 * Хук для копирования shareable-ссылки на сущность в буфер обмена.
 * @param entityType - тип сущности (area, folder, task)
 * @param entityId - ID сущности (undefined — копирование не выполнится)
 * @returns copyLink — функцию для вызова при клике (опционально принимает event для stopPropagation)
 */
export function useCopyEntityLink(
  entityType: EntityType,
  entityId: string | undefined
): { copyLink: (e?: React.MouseEvent) => void } {
  const { addSuccess } = useToast();

  const copyLink = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (!entityId) return;
      navigator.clipboard.writeText(buildEntityUrl(entityType, entityId)).then(
        () => addSuccess('Ссылка скопирована'),
        () => {}
      );
    },
    [entityType, entityId, addSuccess]
  );

  return { copyLink };
}
