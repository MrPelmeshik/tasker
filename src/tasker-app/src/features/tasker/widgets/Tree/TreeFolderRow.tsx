import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { GlassButton } from '../../../../components/ui/GlassButton';
import { FolderCardLink } from '../../../../components/folders';
import { Tooltip } from '../../../../components/ui';
import { FolderIcon, CheckSquareIcon, EyeIcon, LinkIcon } from '../../../../components/icons';
import { useCopyEntityLink, useCustomColorStyle } from '../../../../hooks';
import { handleExpandKeyDown } from '../../../../utils/keyboard';
import type { FolderSummary, TaskSummary } from '../../../../types';
import css from '../../../../styles/tree.module.css';

export interface TreeFolderRowProps {
  folder: FolderSummary;
  areaId: string;
  depth: number;
  isExpanded: boolean;
  subfolders: FolderSummary[];
  tasks: TaskSummary[];
  isLoading: boolean;
  /** При активном фильтре: отображаемое количество */
  displayCount?: number;
  /** При активном фильтре: полное количество (для формата displayed/total) */
  totalCount?: number;
  activeDrag: { id: string; data: { type: string; folder?: FolderSummary; task?: TaskSummary } } | null;
  isOver: boolean;
  canDrop: boolean;
  onToggle: () => void;
  onViewDetails: (e: React.MouseEvent) => void;
  onCreateFolder: (e: React.MouseEvent) => void;
  onCreateTask: (e: React.MouseEvent) => void;
}

/** Строка папки с droppable, drag за весь блок. Memoized. */
export const TreeFolderRow: React.FC<TreeFolderRowProps> = React.memo(({
  folder,
  depth,
  isExpanded,
  subfolders,
  tasks,
  displayCount,
  totalCount,
  activeDrag,
  isOver,
  canDrop,
  onToggle,
  onViewDetails,
  onCreateFolder,
  onCreateTask,
}) => {
  /** Показывать контент: либо по данным из бэкенда, либо по уже загруженным подпапкам/задачам (актуально после создания) */
  const hasChildren = subfolders.length + tasks.length > 0 || folder.tasksCount + folder.subfoldersCount > 0;
  const { attributes, listeners, setNodeRef: setDraggableRef, isDragging } = useDraggable({
    id: `folder-${folder.id}`,
    data: { type: 'folder', folder },
  });
  // Droppable moved to Parent (TreeFolder)
  const customColorStyle = useCustomColorStyle(folder.customColor);
  const { copyLink: handleCopyLink } = useCopyEntityLink('folder', folder.id);

  const level = depth + 1;
  return (
    <div>
      <div
        className={`${css.folderItem} ${isDragging ? css.isDragging : ''}`}
        style={{ paddingLeft: `calc(var(--tree-indent) * ${level - 1})` }}
      >
        <div
          ref={setDraggableRef}
          className={`${css.folderCard} ${isExpanded ? css.expanded : ''} ${isOver && canDrop ? css.isOverValid : ''} ${isOver && !canDrop ? css.isOverInvalid : ''}`}
          data-custom-color={folder.customColor ? 'true' : undefined}
          style={customColorStyle}
          {...attributes}
          {...listeners}
          onClick={onToggle}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => handleExpandKeyDown(e, onToggle)}
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
            <FolderCardLink
              folder={folder}
              style={customColorStyle}
              dataCustomColor={!!folder.customColor}
              displayCount={displayCount}
              totalCount={totalCount}
            />
          </div>
        </div>
      </div>
    </div>
  );
});
