import { useCallback, useMemo } from 'react';
import { getTaskStatusOptions } from '../../../../types/task-status';
import { TREE_SORT_PRESET_OPTIONS, type TreeSortPreset } from './treeUtils';
import type { TaskStatus } from '../../../../types/task-status';
import { useWidgetState } from '../../../../hooks/useWidgetState';

interface StoredFilterState {
  enabledStatuses: TaskStatus[];
  sortPreset: TreeSortPreset;
}

const DEFAULT_STATUSES = getTaskStatusOptions().map((o) => o.value as TaskStatus);
const DEFAULT_PRESET: TreeSortPreset = 'statusAscAlpha';

/**
 * Хук для управления фильтрами и сортировкой дерева (состояние + persistence в localStorage).
 */
export function useTreeFilters() {
  const [storedState, setStoredState] = useWidgetState<StoredFilterState>('tree', 'filters', {
    enabledStatuses: DEFAULT_STATUSES,
    sortPreset: DEFAULT_PRESET,
  });

  const enabledStatuses = useMemo(() => new Set(storedState.enabledStatuses), [storedState.enabledStatuses]);
  const sortPreset = storedState.sortPreset;
  const hasStatusFilter = enabledStatuses.size < DEFAULT_STATUSES.length;

  const toggleStatus = useCallback((status: TaskStatus) => {
    setStoredState((prev) => {
      const currentSet = new Set(prev.enabledStatuses);
      if (currentSet.has(status)) {
        currentSet.delete(status);
      } else {
        currentSet.add(status);
      }

      // If all are unchecked (empty), usually we want to show all or none? 
      // The original logic didn't prevent empty, but usually "all checked" is default.
      // Let's keep it simple.

      return {
        ...prev,
        enabledStatuses: Array.from(currentSet),
      };
    });
  }, [setStoredState]);

  const setSortPreset = useCallback((preset: TreeSortPreset) => {
    setStoredState((prev) => ({ ...prev, sortPreset: preset }));
  }, [setStoredState]);

  return {
    enabledStatuses,
    sortPreset,
    hasStatusFilter,
    toggleStatus,
    setSortPreset,
  };
}

