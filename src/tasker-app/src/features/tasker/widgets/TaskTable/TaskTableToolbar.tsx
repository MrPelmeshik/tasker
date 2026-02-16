import React from 'react';
import { FilterIcon, SearchIcon, SortIcon } from '../../../../components/icons';
import { GlassInput } from '../../../../components/ui/GlassInput';
import { GlassSelect } from '../../../../components/ui/GlassSelect';
import { TaskStatusBadge } from '../../../../components/ui/TaskStatusBadge';
import { getTaskStatusOptions, type TaskStatus } from '../../../../types/task-status';
import { TREE_SORT_PRESET_OPTIONS, type TreeSortPreset } from '../Tree/treeUtils';
import css from '../../../../styles/task-table.module.css';

export interface TaskTableToolbarProps {
    enabledStatuses: Set<TaskStatus>;
    toggleStatus: (status: TaskStatus) => void;
    sortPreset: TreeSortPreset;
    setSortPreset: (preset: TreeSortPreset) => void;
    searchQuery: string;
    onSearchChange: (value: string) => void;
}

export const TaskTableToolbar: React.FC<TaskTableToolbarProps> = ({
    enabledStatuses,
    toggleStatus,
    sortPreset,
    setSortPreset,
    searchQuery,
    onSearchChange,
}) => (
    <>
        <div className={css.searchWrap}>
            <span className={css.searchBlockIcon} aria-hidden>
                <SearchIcon className="icon-m" />
            </span>
            <GlassInput
                type="search"
                size="s"
                variant="transparent"
                placeholder="Поиск по задачам"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className={css.searchInput}
                aria-label="Поиск по задачам"
            />
        </div>
        <div className={css.statusFiltersBlock}>
            <span className={css.statusFiltersBlockIcon} aria-hidden>
                <FilterIcon className="icon-m" />
            </span>
            <div className={css.statusFilters}>
                {getTaskStatusOptions().map((opt) => (
                    <button
                        key={opt.value}
                        type="button"
                        className={`${css.statusFilterBtn} ${enabledStatuses.has(opt.value as TaskStatus) ? '' : css.statusFilterBtnDisabled}`}
                        onClick={() => toggleStatus(opt.value as TaskStatus)}
                        aria-label={opt.label}
                        aria-pressed={enabledStatuses.has(opt.value as TaskStatus)}
                    >
                        <TaskStatusBadge status={opt.value as TaskStatus} size="xs" variant="compact" />
                    </button>
                ))}
            </div>
        </div>
        <GlassSelect
            value={sortPreset}
            onChange={(v) => setSortPreset(v as TreeSortPreset)}
            options={TREE_SORT_PRESET_OPTIONS}
            size="s"
            placeholder="Сортировка"
            className={css.sortSelect}
            renderValue={() => <SortIcon className="icon-m" />}
            showArrow={false}
            variant="subtle"
            dropdownClassName={css.sortDropdown}
        />
    </>
);
