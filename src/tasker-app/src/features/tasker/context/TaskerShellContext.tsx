import React, { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import { getTaskStatusOptions, type TaskStatus } from '../../../types/task-status';
import type { TreeSortPreset } from '../widgets/Tree/treeUtils';
import { useWidgetState } from '../../../hooks/useWidgetState';
import { safeLocalStorage } from '../../../services/storage';

type StoredTreeFilters = {
  enabledStatuses?: TaskStatus[];
  sortPreset?: TreeSortPreset;
};

type StoredTaskTableFilters = {
  enabledStatuses?: TaskStatus[];
  sortPreset?: TreeSortPreset;
  enabledEventTypes?: number[];
};

const DEFAULT_STATUSES = getTaskStatusOptions().map((o) => o.value as TaskStatus);
const DEFAULT_PRESET: TreeSortPreset = 'statusAscAlpha';
const DEFAULT_EVENT_TYPES = [4, 5];
const MIGRATION_KEY = 'tasker-shell-filters-migrated';
const LEGACY_TREE_FILTERS_KEY = 'tasker-widget-tree-filters';
const LEGACY_TABLE_FILTERS_KEY = 'tasker-widget-task-table-filters';

interface TaskerShellContextValue {
  enabledStatuses: Set<TaskStatus>;
  sortPreset: TreeSortPreset;
  searchQuery: string;
  enabledEventTypes: Set<number>;
  hasStatusFilter: boolean;
  toggleStatus: (status: TaskStatus) => void;
  setSortPreset: (preset: TreeSortPreset) => void;
  setSearchQuery: (value: string) => void;
  toggleEventType: (type: number) => void;
}

const TaskerShellContext = createContext<TaskerShellContextValue | null>(null);

/**
 * <summary>
 * Единый контекст фильтров shell-уровня для дерева и таблицы.
 * Содержит миграцию старых ключей localStorage из tree/task-table.
 * </summary>
 */
export const TaskerShellProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [enabledStatusesRaw, setEnabledStatusesRaw] = useWidgetState<TaskStatus[]>(
    'tasker-shell',
    'statuses',
    DEFAULT_STATUSES
  );
  const [sortPreset, setSortPresetRaw] = useWidgetState<TreeSortPreset>(
    'tasker-shell',
    'sort',
    DEFAULT_PRESET
  );
  const [searchQuery, setSearchQuery] = useWidgetState<string>('tasker-shell', 'search', '');
  const [enabledEventTypesRaw, setEnabledEventTypesRaw] = useWidgetState<number[]>(
    'tasker-shell',
    'event-types',
    DEFAULT_EVENT_TYPES
  );
  const [migrated, setMigrated] = useWidgetState<boolean>('tasker-shell', MIGRATION_KEY, false);

  useEffect(() => {
    if (migrated) return;

    const parseJson = <T,>(key: string): T | null => {
      const raw = safeLocalStorage.getItem(key);
      if (!raw) return null;
      try {
        return JSON.parse(raw) as T;
      } catch {
        return null;
      }
    };

    const legacyTree = parseJson<StoredTreeFilters>(LEGACY_TREE_FILTERS_KEY);
    const legacyTable = parseJson<StoredTaskTableFilters>(LEGACY_TABLE_FILTERS_KEY);

    const statuses = legacyTable?.enabledStatuses ?? legacyTree?.enabledStatuses;
    if (Array.isArray(statuses) && statuses.length > 0) {
      setEnabledStatusesRaw(statuses);
    }

    const sort = legacyTable?.sortPreset ?? legacyTree?.sortPreset;
    if (sort) {
      setSortPresetRaw(sort);
    }

    const legacyEventTypes = legacyTable?.enabledEventTypes;
    if (Array.isArray(legacyEventTypes) && legacyEventTypes.length > 0) {
      setEnabledEventTypesRaw(legacyEventTypes);
    }

    setMigrated(true);
  }, [migrated, setEnabledStatusesRaw, setSortPresetRaw, setEnabledEventTypesRaw, setMigrated]);

  const enabledStatuses = useMemo(() => new Set(enabledStatusesRaw), [enabledStatusesRaw]);
  const enabledEventTypes = useMemo(() => new Set(enabledEventTypesRaw), [enabledEventTypesRaw]);
  const hasStatusFilter = enabledStatuses.size < DEFAULT_STATUSES.length;

  const toggleStatus = useCallback(
    (status: TaskStatus) => {
      setEnabledStatusesRaw((prev) => {
        const next = new Set(prev);
        if (next.has(status)) next.delete(status);
        else next.add(status);
        return Array.from(next);
      });
    },
    [setEnabledStatusesRaw]
  );

  const setSortPreset = useCallback(
    (preset: TreeSortPreset) => {
      setSortPresetRaw(preset);
    },
    [setSortPresetRaw]
  );

  const toggleEventType = useCallback(
    (type: number) => {
      setEnabledEventTypesRaw((prev) => {
        const next = new Set(prev);
        if (next.has(type)) next.delete(type);
        else next.add(type);
        return Array.from(next);
      });
    },
    [setEnabledEventTypesRaw]
  );

  const value = useMemo<TaskerShellContextValue>(
    () => ({
      enabledStatuses,
      sortPreset,
      searchQuery,
      enabledEventTypes,
      hasStatusFilter,
      toggleStatus,
      setSortPreset,
      setSearchQuery,
      toggleEventType,
    }),
    [
      enabledStatuses,
      sortPreset,
      searchQuery,
      enabledEventTypes,
      hasStatusFilter,
      toggleStatus,
      setSortPreset,
      setSearchQuery,
      toggleEventType,
    ]
  );

  return <TaskerShellContext.Provider value={value}>{children}</TaskerShellContext.Provider>;
};

/**
 * <summary>
 * Хук доступа к фильтрам shell-контекста.
 * </summary>
 */
export function useTaskerShellFilters(): TaskerShellContextValue {
  const ctx = useContext(TaskerShellContext);
  if (!ctx) {
    throw new Error('useTaskerShellFilters must be used within TaskerShellProvider');
  }
  return ctx;
}
