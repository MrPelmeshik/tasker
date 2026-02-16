import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { AnimatePresence, motion } from 'framer-motion';
import { GlassButton } from '../../../../components/ui/GlassButton';
import { ColorPicker } from '../../../../components/ui/ColorPicker';
import { AreaCardLink } from '../../../../components/areas';
import { Tooltip } from '../../../../components/ui';
import { Loader } from '../../../../components/ui/Loader';
import { FolderIcon, CheckSquareIcon, EyeIcon, LinkIcon } from '../../../../components/icons';
import { useCopyEntityLink, useCustomColorStyle } from '../../../../hooks';
import { handleExpandKeyDown } from '../../../../utils/keyboard';
import { isValidDrop } from './treeUtils';
import { TreeAreaChildren } from './TreeAreaChildren';
import type { AreaShortCard, FolderSummary, TaskSummary } from '../../../../types';
import glassWidgetStyles from '../../../../styles/glass-widget.module.css';
import css from '../../../../styles/tree.module.css';

export interface TreeAreaSectionProps {
  area: AreaShortCard;
  isExpanded: boolean;
  folders: FolderSummary[];
  tasks: TaskSummary[];
  isLoading: boolean;
  /** При активном фильтре: отображаемое количество */
  displayCount?: number;
  /** При активном фильтре: полное количество (для формата displayed/total) */
  totalCount?: number;
  activeDrag: { id: string; data: { type: string; folder?: FolderSummary; task?: TaskSummary } } | null;
  foldersByArea: Map<string, FolderSummary[]>;
  foldersByParent: Map<string, FolderSummary[]>;
  onToggle: () => void;
  onViewDetails: (e: React.MouseEvent) => void;
  onCreateFolder: (e: React.MouseEvent) => void;
  onCreateTask: (e: React.MouseEvent) => void;
  onViewTaskDetails: (taskId: string, e: React.MouseEvent) => void;
  onSetAreaColor: (areaId: string, hex: string) => void;
}

/** Область с droppable-карточкой. Memoized. */
export const TreeAreaSection: React.FC<TreeAreaSectionProps> = React.memo(({
  area,
  isExpanded,
  folders,
  tasks,
  isLoading,
  displayCount,
  totalCount,
  activeDrag,
  foldersByArea,
  foldersByParent,
  onToggle,
  onViewDetails,
  onCreateFolder,
  onCreateTask,
  onViewTaskDetails,
  onSetAreaColor,
}) => {
  /** Показывать контент: либо по данным из бэкенда, либо по уже загруженным папкам/задачам (актуально после создания) */
  const hasChildren = folders.length + tasks.length > 0 || area.foldersCount + area.rootTasksCount > 0;
  const { setNodeRef, isOver } = useDroppable({ id: `area-root-${area.id}`, data: {} });
  const canDrop = isValidDrop(activeDrag?.data, `area-root-${area.id}`, foldersByArea, foldersByParent);
  const customColorStyle = useCustomColorStyle(area.customColor);
  const { copyLink: handleCopyLink } = useCopyEntityLink('area', area.id);

  return (
    <div className={css.areaSection}>
      <div ref={setNodeRef} className={css.areaBlock}>
        <div className={css.areaItem}>
          <div
            className={`${css.areaCard} ${isExpanded ? css.expanded : ''} ${isOver && canDrop ? css.isOverValid : ''} ${isOver && !canDrop ? css.isOverInvalid : ''}`}
            data-custom-color={area.customColor ? 'true' : undefined}
            style={customColorStyle}
            onClick={hasChildren ? onToggle : undefined}
            role={hasChildren ? 'button' : undefined}
            tabIndex={hasChildren ? 0 : undefined}
            onKeyDown={hasChildren ? (e) => handleExpandKeyDown(e, onToggle) : undefined}
          >
            <div className={css.treeRowActions} onClick={(e) => e.stopPropagation()}>
              <Tooltip content="Просмотреть" placement="top">
                <GlassButton variant="subtle" size="xs" className={css.treeActionButton} onClick={(e) => { e.stopPropagation(); onViewDetails(e); }} aria-label="Просмотреть">
                  <EyeIcon className="icon-m" />
                </GlassButton>
              </Tooltip>
              <Tooltip content="Создать папку" placement="top">
                <GlassButton variant="subtle" size="xs" className={css.treeActionButton} onClick={(e) => { e.stopPropagation(); onCreateFolder(e); }} aria-label="Создать папку">
                  <FolderIcon className="icon-m" />
                </GlassButton>
              </Tooltip>
              <Tooltip content="Создать задачу" placement="top">
                <GlassButton variant="subtle" size="xs" className={css.treeActionButton} onClick={(e) => { e.stopPropagation(); onCreateTask(e); }} aria-label="Создать задачу">
                  <CheckSquareIcon className="icon-m" />
                </GlassButton>
              </Tooltip>
              <Tooltip content="Копировать ссылку" placement="top">
                <GlassButton variant="subtle" size="xs" className={css.treeActionButton} onClick={handleCopyLink} aria-label="Копировать ссылку">
                  <LinkIcon className="icon-m" />
                </GlassButton>
              </Tooltip>
            </div>
            <div className={css.treeRowMain}>
              <AreaCardLink
                area={area}
                style={customColorStyle}
                dataCustomColor={!!area.customColor}
                displayCount={displayCount}
                totalCount={totalCount}
              />
              {!area.customColor && (
                <div onClick={(e) => e.stopPropagation()}>
                  <ColorPicker
                    value={undefined}
                    onChange={(hex) => onSetAreaColor(area.id, hex)}
                    showHexInput={false}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {isExpanded && (hasChildren || isLoading) && (
            <motion.div
              className={css.foldersSection}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: 'hidden' }}
            >
              {isLoading ? (
                <div className={glassWidgetStyles.placeholder}><Loader size="s" ariaLabel="Загрузка" /></div>
              ) : (
                <>
                  <TreeAreaChildren
                    areaId={area.id}
                    folders={folders}
                    tasks={tasks}
                    onViewTaskDetails={(taskId, e) => onViewTaskDetails(taskId, e)}
                  />
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});
