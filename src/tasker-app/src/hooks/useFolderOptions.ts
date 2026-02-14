import { useState, useEffect } from 'react';
import { fetchChildFolders } from '../services/api';

const EMPTY_OPTION = { value: '', label: 'Без папки (корень области)' };

export interface FolderOption {
  value: string;
  label: string;
}

export interface UseFolderOptionsOptions {
  /** Загружать опции только когда модалка открыта */
  enabled?: boolean;
  /** Исключить папку из списка (например, при редактировании — нельзя выбрать саму себя как родителя) */
  excludeFolderId?: string | null;
}

/**
 * Хук для загрузки иерархического списка опций папок области.
 * Возвращает опции для GlassSelect с префиксом пути (Parent / Child).
 *
 * @param areaId - ID области, null/пусто — вернёт только пустую опцию
 */
export function useFolderOptions(
  areaId: string | null | undefined,
  options: UseFolderOptionsOptions = {}
): { options: FolderOption[]; loading: boolean } {
  const { enabled = true, excludeFolderId = null } = options;
  const excludeId = excludeFolderId ?? undefined;
  const [optionsList, setOptionsList] = useState<FolderOption[]>([EMPTY_OPTION]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled || !areaId) {
      setOptionsList([EMPTY_OPTION]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const load = async () => {
      try {
        const opts: FolderOption[] = [EMPTY_OPTION];

        const addNested = async (parentId: string | null, prefix: string) => {
          const children = await fetchChildFolders(parentId, areaId);
          for (const f of children) {
            if (excludeId && f.id === excludeId) continue;
            opts.push({ value: f.id, label: `${prefix}${f.title}` });
            await addNested(f.id, `${prefix}${f.title} / `);
          }
        };

        await addNested(null, '');

        if (!cancelled) setOptionsList(opts);
      } catch {
        if (!cancelled) setOptionsList([EMPTY_OPTION]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [enabled, areaId, excludeId]);

  return { options: optionsList, loading };
}
