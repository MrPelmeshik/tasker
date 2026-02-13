import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { GlassButton } from '../../../../components/ui/GlassButton';
import { AreaCardLink } from '../../../../components/areas';
import { Tooltip } from '../../../../components/ui';
import { FolderIcon, CheckSquareIcon, EyeIcon } from '../../../../components/icons';
import { useCustomColorStyle } from '../../../../hooks';
import { handleExpandKeyDown } from '../../../../utils/keyboard';
import { isValidDrop } from './treeUtils';
import { TreeTaskRow } from './TreeTaskRow';
import type { AreaShortCard, FolderSummary, TaskSummary } from '../../../../types';
import glassWidgetStyles from '../../../../styles/glass-widget.module.css';
import css from '../../../../styles/tree.module.css';

export interface TreeAreaSectionProps {
  area: AreaShortCard;
  isExpanded: boolean;
  folders: FolderSummary[];
  tasks: TaskSummary[];
  isLoading: boolean;
  activeDrag: { id: string; data: { type: string; folder?: FolderSummary; task?: TaskSummary } } | null;
  foldersByArea: Map<string, FolderSummary[]>;
  foldersByParent: Map<string, FolderSummary[]>;
  onToggle: () => void;
  onViewDetails: (e: React.MouseEvent) => void;
  onCreateFolder: (e: React.MouseEvent) => void;
  onCreateTask: (e: React.MouseEvent) => void;
  onViewTaskDetails: (taskId: string, e: React.MouseEvent) => void;
  renderFolder: (folder: FolderSummary, areaId: string, depth: number) => React.ReactNode;
}

/** Область с droppable-карточкой */
export const TreeAreaSection: React.FC<TreeAreaSectionProps> = ({
  area,
  isExpanded,
  folders,
  tasks,
  isLoading,
  activeDrag,
  foldersByArea,
  foldersByParent,
  onToggle,
  onViewDetails,
  onCreateFolder,
  onCreateTask,
  onViewTaskDetails,
  renderFolder,
}) => {
  const hasChildren = area.foldersCount + area.rootTasksCount > 0;
  const { setNodeRef, isOver } = useDroppable({ id: `area-root-${area.id}`, data: {} });
  const canDrop = isValidDrop(activeDrag?.data, `area-root-${area.id}`, foldersByArea, foldersByParent);
  const customColorStyle = useCustomColorStyle(area.customColor);

  return (
    <div className={css.areaSection}>
      <div
        ref={setNodeRef}
        className={`${css.areaCard} ${isExpanded ? css.expanded : ''} ${isOver && canDrop ? css.isOverValid : ''} ${isOver && !canDrop ? css.isOverInvalid : ''}`}
        data-custom-color={area.customColor ? 'true' : undefined}
        style={customColorStyle}
        onClick={hasChildren ? onToggle : undefined}
        role={hasChildren ? 'button' : undefined}
        tabIndex={hasChildren ? 0 : undefined}
        onKeyDown={hasChildren ? (e) => handleExpandKeyDown(e, onToggle) : undefined}
      >
        <div className={css.areaContent}>
          <div className={css.treeRowActions} onClick={(e) => e.stopPropagation()}>
            <Tooltip content="Просмотреть" placement="top">
              <GlassButton variant="subtle" size="xs" className={css.treeActionButton} onClick={(e) => { e.stopPropagation(); onViewDetails(e); }} aria-label="Просмотреть">
                <EyeIcon style={{ width: 14, height: 14 }} />
              </GlassButton>
            </Tooltip>
            <Tooltip content="Создать папку" placement="top">
              <GlassButton variant="subtle" size="xs" className={css.treeActionButton} onClick={(e) => { e.stopPropagation(); onCreateFolder(e); }} aria-label="Создать папку">
                <FolderIcon style={{ width: 14, height: 14 }} />
              </GlassButton>
            </Tooltip>
            <Tooltip content="Создать задачу" placement="top">
              <GlassButton variant="subtle" size="xs" className={css.treeActionButton} onClick={(e) => { e.stopPropagation(); onCreateTask(e); }} aria-label="Создать задачу">
                <CheckSquareIcon style={{ width: 14, height: 14 }} />
              </GlassButton>
            </Tooltip>
          </div>
          <div className={css.treeRowMain}>
            <AreaCardLink
              area={area}
              style={customColorStyle}
              dataCustomColor={!!area.customColor}
            />
          </div>
        </div>
      </div>
      {hasChildren && isExpanded && (
        <div className={css.foldersSection}>
          {isLoading ? (
            <div className={glassWidgetStyles.placeholder}>Загрузка...</div>
          ) : (
            <>
              {folders.map((f) => renderFolder(f, area.id, 1))}
              {tasks.map((task) => (
                <TreeTaskRow key={task.id} task={task} onViewDetails={(e) => onViewTaskDetails(task.id, e)} />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};
