import { useState, useEffect, useCallback } from 'react';
import { getTaskStatusOptions } from '../../../../types/task-status';
import { TREE_SORT_PRESET_OPTIONS, type TreeSortPreset } from '../Tree/treeUtils';
import type { TaskStatus } from '../../../../types/task-status';

const TASK_TABLE_FILTERS_STORAGE_KEY = 'tasker-task-table-filters';

function loadTaskTableFilters(): { enabledStatuses: Set<TaskStatus>; sortPreset: TreeSortPreset } {
    const validStatuses = new Set(getTaskStatusOptions().map((o) => o.value as TaskStatus));
    const validPresets = new Set(TREE_SORT_PRESET_OPTIONS.map((o) => o.value));
    try {
        const raw = localStorage.getItem(TASK_TABLE_FILTERS_STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw) as { enabledStatuses?: number[]; sortPreset?: string };
            const enabledStatuses =
                Array.isArray(parsed.enabledStatuses) && parsed.enabledStatuses.length > 0
                    ? new Set((parsed.enabledStatuses as TaskStatus[]).filter((v) => validStatuses.has(v)))
                    : new Set(validStatuses);
            const sortPreset =
                typeof parsed.sortPreset === 'string' && validPresets.has(parsed.sortPreset as TreeSortPreset)
                    ? (parsed.sortPreset as TreeSortPreset)
                    : 'statusAscAlpha';
            return {
                enabledStatuses: enabledStatuses.size > 0 ? enabledStatuses : new Set(validStatuses),
                sortPreset,
            };
        }
    } catch {
        /* ignore */
    }
    return {
        enabledStatuses: new Set(validStatuses),
        sortPreset: 'statusAscAlpha',
    };
}

function saveTaskTableFilters(enabledStatuses: Set<TaskStatus>, sortPreset: TreeSortPreset): void {
    try {
        localStorage.setItem(
            TASK_TABLE_FILTERS_STORAGE_KEY,
            JSON.stringify({
                enabledStatuses: Array.from(enabledStatuses),
                sortPreset,
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
    const [filterState, setFilterState] = useState(loadTaskTableFilters);
    const [searchQuery, setSearchQuery] = useState('');
    const { enabledStatuses, sortPreset } = filterState;

    useEffect(() => {
        saveTaskTableFilters(enabledStatuses, sortPreset);
    }, [enabledStatuses, sortPreset]);

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

    const setSortPreset = useCallback((preset: TreeSortPreset) => {
        setFilterState((prev) => ({ ...prev, sortPreset: preset }));
    }, []);

    return {
        enabledStatuses,
        sortPreset,
        searchQuery,
        setSearchQuery,
        toggleStatus,
        setSortPreset,
    };
}
