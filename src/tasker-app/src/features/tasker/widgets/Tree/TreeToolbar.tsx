import React from 'react';
import { LayoutGridIcon, UnfoldVerticalIcon, FoldVerticalIcon, FilterIcon, SortIcon } from '../../../../components/icons';
import { Tooltip } from '../../../../components/ui/Tooltip';
import { GlassButton } from '../../../../components/ui/GlassButton';
import { GlassSelect } from '../../../../components/ui/GlassSelect';
import { TaskStatusBadge } from '../../../../components/ui/TaskStatusBadge';
import type { TaskStatus } from '../../../../types/task-status';
import { getTaskStatusOptions } from '../../../../types/task-status';
import { TREE_SORT_PRESET_OPTIONS, type TreeSortPreset } from './treeUtils';
import css from '../../../../styles/tree.module.css';

export interface TreeToolbarProps {
  onCreateArea: () => void;
  isAllExpanded: boolean;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  enabledStatuses: Set<TaskStatus>;
  toggleStatus: (status: TaskStatus) => void;
  sortPreset: TreeSortPreset;
  setSortPreset: (preset: TreeSortPreset) => void;
}

export const TreeToolbar: React.FC<TreeToolbarProps> = ({
  onCreateArea,
  isAllExpanded,
  onExpandAll,
  onCollapseAll,
  enabledStatuses,
  toggleStatus,
  sortPreset,
  setSortPreset,
}) => (
  <div className={css.treeTopActions}>
    <Tooltip content="Создать область" placement="top">
      <GlassButton
        variant="subtle"
        size="xs"
        className={`${css.treeActionButton} ${css.treeTopActionButton}`}
        onClick={onCreateArea}
        aria-label="Создать область"
      >
        <LayoutGridIcon className="icon-m" />
      </GlassButton>
    </Tooltip>
    <Tooltip content={isAllExpanded ? 'Свернуть дерево' : 'Развернуть дерево'} placement="top">
      <GlassButton
        variant="subtle"
        size="xs"
        className={`${css.treeActionButton} ${css.treeTopActionButton}`}
        onClick={() => (isAllExpanded ? onCollapseAll() : onExpandAll())}
        aria-label={isAllExpanded ? 'Свернуть дерево' : 'Развернуть дерево'}
      >
        {isAllExpanded ? (
          <FoldVerticalIcon className="icon-m" />
        ) : (
          <UnfoldVerticalIcon className="icon-m" />
        )}
      </GlassButton>
    </Tooltip>
    <div className={css.treeStatusFiltersBlock}>
      <span className={css.treeStatusFiltersBlockIcon} aria-hidden>
        <FilterIcon className="icon-m" />
      </span>
      <div className={css.treeStatusFilters}>
        {getTaskStatusOptions().map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={`${css.treeStatusFilterBtn} ${enabledStatuses.has(opt.value as TaskStatus) ? '' : css.treeStatusFilterBtnDisabled}`}
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
      className={css.treeSortSelect}
      renderValue={() => <SortIcon className="icon-m" />}
      showArrow={false}
      variant="subtle"
      dropdownClassName={css.treeSortDropdown}
    />
  </div>
);
