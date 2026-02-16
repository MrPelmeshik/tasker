import React from 'react';
import { FilterIcon, SearchIcon, SortIcon, EyeIcon } from '../../../../components/icons';
import { GlassInput } from '../../../../components/ui/GlassInput';
import { GlassSelect } from '../../../../components/ui/GlassSelect';
import { TaskStatusBadge } from '../../../../components/ui/TaskStatusBadge';
import { EventStatusBadge, getEventTypeText } from '../../../../components/ui/EventStatusBadge';
import { Tooltip } from '../../../../components/ui/Tooltip';
import { getTaskStatusOptions, type TaskStatus } from '../../../../types/task-status';
import { AllEventTypes } from '../../../../services/api/events';
import { TREE_SORT_PRESET_OPTIONS, type TreeSortPreset } from '../Tree/treeUtils';
import css from '../../../../styles/task-table.module.css';

export interface TaskTableToolbarProps {
    enabledStatuses: Set<TaskStatus>;
    toggleStatus: (status: TaskStatus) => void;
    sortPreset: TreeSortPreset;
    setSortPreset: (preset: TreeSortPreset) => void;
    searchQuery: string;
    onSearchChange: (value: string) => void;
    enabledEventTypes: Set<number>;
    toggleEventType: (type: number) => void;
}

export const TaskTableToolbar: React.FC<TaskTableToolbarProps> = ({
    enabledStatuses,
    toggleStatus,
    sortPreset,
    setSortPreset,
    searchQuery,
    onSearchChange,
    enabledEventTypes,
    toggleEventType,
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
        <div className={css.statusFiltersBlock} style={{ marginLeft: 0 }}>
            <span className={css.statusFiltersBlockIcon} aria-hidden>
                <EyeIcon className="icon-m" />
            </span>
            <div className={css.statusFilters}>
                {AllEventTypes.map((type) => (
                    <button
                        key={type}
                        type="button"
                        className={`${css.statusFilterBtn} ${enabledEventTypes.has(type) ? '' : css.statusFilterBtnDisabled}`}
                        onClick={() => toggleEventType(type)}
                        aria-label={getEventTypeText(type)}
                        aria-pressed={enabledEventTypes.has(type)}
                    >
                        <EventStatusBadge eventType={type} size="xs" variant="compact" />
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
