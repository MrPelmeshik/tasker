import { useState, useCallback, useMemo } from 'react';
import { getTaskStatusOptions } from '../../../../types/task-status';
import { TREE_SORT_PRESET_OPTIONS, type TreeSortPreset } from '../Tree/treeUtils';
import type { TaskStatus } from '../../../../types/task-status';
import { AllEventTypes } from '../../../../services/api/events';
import { useWidgetState } from '../../../../hooks/useWidgetState';

interface StoredTaskTableFilterState {
    enabledStatuses: TaskStatus[];
    sortPreset: TreeSortPreset;
    enabledEventTypes: number[];
}

const DEFAULT_STATUSES = getTaskStatusOptions().map((o) => o.value as TaskStatus);
const DEFAULT_PRESET: TreeSortPreset = 'statusAscAlpha';
const DEFAULT_EVENT_TYPES = [4, 5]; // Activity, Note

/**
 * Хук для управления фильтрами и сортировкой таблицы задач (состояние + persistence в localStorage).
 */
export function useTaskTableFilters() {
    const [storedState, setStoredState] = useWidgetState<StoredTaskTableFilterState>('task-table', 'filters', {
        enabledStatuses: DEFAULT_STATUSES,
        sortPreset: DEFAULT_PRESET,
        enabledEventTypes: DEFAULT_EVENT_TYPES,
    });

    const [searchQuery, setSearchQuery] = useState('');

    const enabledStatuses = useMemo(() => new Set(storedState.enabledStatuses), [storedState.enabledStatuses]);
    const sortPreset = storedState.sortPreset;
    const enabledEventTypes = useMemo(() => new Set(storedState.enabledEventTypes), [storedState.enabledEventTypes]);

    const toggleStatus = useCallback((status: TaskStatus) => {
        setStoredState((prev) => {
            const currentSet = new Set(prev.enabledStatuses);
            if (currentSet.has(status)) {
                currentSet.delete(status);
            } else {
                currentSet.add(status);
            }
            return {
                ...prev,
                enabledStatuses: Array.from(currentSet),
            };
        });
    }, [setStoredState]);

    const toggleEventType = useCallback((type: number) => {
        setStoredState((prev) => {
            const currentSet = new Set(prev.enabledEventTypes);
            if (currentSet.has(type)) {
                currentSet.delete(type);
            } else {
                currentSet.add(type);
            }
            return {
                ...prev,
                enabledEventTypes: Array.from(currentSet),
            };
        });
    }, [setStoredState]);

    const setSortPreset = useCallback((preset: TreeSortPreset) => {
        setStoredState((prev) => ({ ...prev, sortPreset: preset }));
    }, [setStoredState]);

    return {
        enabledStatuses,
        sortPreset,
        enabledEventTypes,
        searchQuery,
        setSearchQuery,
        toggleStatus,
        toggleEventType,
        setSortPreset,
    };
}

