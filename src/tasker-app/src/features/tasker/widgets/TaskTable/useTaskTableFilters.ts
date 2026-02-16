import { useState, useEffect, useCallback } from 'react';
import { getTaskStatusOptions } from '../../../../types/task-status';
import { TREE_SORT_PRESET_OPTIONS, type TreeSortPreset } from '../Tree/treeUtils';
import type { TaskStatus } from '../../../../types/task-status';
import { AllEventTypes } from '../../../../services/api/events';

const TASK_TABLE_FILTERS_STORAGE_KEY = 'tasker-task-table-filters';

interface FilterState {
    enabledStatuses: Set<TaskStatus>;
    sortPreset: TreeSortPreset;
    enabledEventTypes: Set<number>;
}

function loadTaskTableFilters(): FilterState {
    const validStatuses = new Set(getTaskStatusOptions().map((o) => o.value as TaskStatus));
    const validPresets = new Set(TREE_SORT_PRESET_OPTIONS.map((o) => o.value));
    const validEventTypes = new Set(AllEventTypes);

    try {
        const raw = localStorage.getItem(TASK_TABLE_FILTERS_STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw) as { enabledStatuses?: number[]; sortPreset?: string; enabledEventTypes?: number[] };

            const enabledStatuses =
                Array.isArray(parsed.enabledStatuses) && parsed.enabledStatuses.length > 0
                    ? new Set((parsed.enabledStatuses as TaskStatus[]).filter((v) => validStatuses.has(v)))
                    : new Set(validStatuses);

            const sortPreset =
                typeof parsed.sortPreset === 'string' && validPresets.has(parsed.sortPreset as TreeSortPreset)
                    ? (parsed.sortPreset as TreeSortPreset)
                    : 'statusAscAlpha';

            const enabledEventTypes =
                Array.isArray(parsed.enabledEventTypes) && parsed.enabledEventTypes.length > 0
                    ? new Set(parsed.enabledEventTypes.filter((v) => validEventTypes.has(v)))
                    : new Set([4, 5]); // Default to Note & Activity if not set

            return {
                enabledStatuses: enabledStatuses.size > 0 ? enabledStatuses : new Set(validStatuses),
                sortPreset,
                enabledEventTypes: enabledEventTypes.size > 0 ? enabledEventTypes : new Set([4, 5]),
            };
        }
    } catch {
        /* ignore */
    }
    return {
        enabledStatuses: new Set(validStatuses),
        sortPreset: 'statusAscAlpha',
        enabledEventTypes: new Set([4, 5]), // Default: Note, Activity
    };
}

function saveTaskTableFilters(state: FilterState): void {
    try {
        localStorage.setItem(
            TASK_TABLE_FILTERS_STORAGE_KEY,
            JSON.stringify({
                enabledStatuses: Array.from(state.enabledStatuses),
                sortPreset: state.sortPreset,
                enabledEventTypes: Array.from(state.enabledEventTypes),
            })
        );
    } catch {
        /* ignore */
    }
}

/**
 * Хук для управления фильтрами и сортировкой таблицы задач (состояние + persistence в localStorage).
 */
export function useTaskTableFilters() {
    const [filterState, setFilterState] = useState<FilterState>(loadTaskTableFilters);
    const [searchQuery, setSearchQuery] = useState('');
    const { enabledStatuses, sortPreset, enabledEventTypes } = filterState;

    useEffect(() => {
        saveTaskTableFilters(filterState);
    }, [filterState]);

    const toggleStatus = useCallback((status: TaskStatus) => {
        setFilterState((prev) => {
            const next = new Set(prev.enabledStatuses);
            if (next.has(status)) {
                next.delete(status);
            } else {
                next.add(status);
            }
            return { ...prev, enabledStatuses: next };
        });
    }, []);

    const toggleEventType = useCallback((type: number) => {
        setFilterState((prev) => {
            const next = new Set(prev.enabledEventTypes);
            if (next.has(type)) {
                next.delete(type);
            } else {
                next.add(type);
            }
            return { ...prev, enabledEventTypes: next };
        });
    }, []);

    const setSortPreset = useCallback((preset: TreeSortPreset) => {
        setFilterState((prev) => ({ ...prev, sortPreset: preset }));
    }, []);

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
