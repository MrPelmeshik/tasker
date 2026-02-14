import React from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { GlassButton } from '../../../../components/ui/GlassButton';
import { FolderCardLink } from '../../../../components/folders';
import { Tooltip } from '../../../../components/ui';
import { Loader } from '../../../../components/ui/Loader';
import { FolderIcon, CheckSquareIcon, EyeIcon, LinkIcon } from '../../../../components/icons';
import { buildEntityUrl } from '../../../../utils/entity-links';
import { useToast } from '../../../../context';
import { useCustomColorStyle } from '../../../../hooks';
import { handleExpandKeyDown } from '../../../../utils/keyboard';
import { isValidDrop } from './treeUtils';
import type { FolderSummary, TaskSummary } from '../../../../types';
import glassWidgetStyles from '../../../../styles/glass-widget.module.css';
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
  foldersByArea: Map<string, FolderSummary[]>;
  foldersByParent: Map<string, FolderSummary[]>;
  onToggle: () => void;
  onViewDetails: (e: React.MouseEvent) => void;
  onCreateFolder: (e: React.MouseEvent) => void;
  onCreateTask: (e: React.MouseEvent) => void;
  renderFolder: (folder: FolderSummary, areaId: string, depth: number) => React.ReactNode;
  renderTask: (task: TaskSummary, level: number) => React.ReactNode;
}

/** Строка папки с droppable, drag за весь блок */
export const TreeFolderRow: React.FC<TreeFolderRowProps> = ({
  folder,
  areaId,
  depth,
  isExpanded,
  subfolders,
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
  renderFolder,
  renderTask,
}) => {
  /** Показывать контент: либо по данным из бэкенда, либо по уже загруженным подпапкам/задачам (актуально после создания) */
  const hasChildren = subfolders.length + tasks.length > 0 || folder.tasksCount + folder.subfoldersCount > 0;
  const { attributes, listeners, setNodeRef: setDraggableRef, isDragging } = useDraggable({
    id: `folder-${folder.id}`,
    data: { type: 'folder', folder },
  });
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({ id: `folder-${folder.id}`, data: { folder } });
  const canDrop = isValidDrop(activeDrag?.data, `folder-${folder.id}`, foldersByArea, foldersByParent);
  const customColorStyle = useCustomColorStyle(folder.customColor);
  const { addSuccess } = useToast();

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(buildEntityUrl('folder', folder.id)).then(
      () => addSuccess('Ссылка скопирована'),
      () => {}
    );
  };

  const level = depth + 1;
  return (
    <div ref={setDroppableRef} className={css.folderBlock}>
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
          onClick={hasChildren ? onToggle : undefined}
          role={hasChildren ? 'button' : undefined}
          tabIndex={hasChildren ? 0 : undefined}
          onKeyDown={hasChildren ? (e) => handleExpandKeyDown(e, onToggle) : undefined}
        >
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
            <Tooltip content="Копировать ссылку" placement="top">
              <GlassButton variant="subtle" size="xs" className={css.treeActionButton} onClick={handleCopyLink} aria-label="Копировать ссылку">
                <LinkIcon style={{ width: 14, height: 14 }} />
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
      {hasChildren && isExpanded && (
        <div className={css.tasksSection}>
          {isLoading ? (
            <div className={glassWidgetStyles.placeholder}><Loader size="s" ariaLabel="Загрузка" /></div>
          ) : (
            <>
              {subfolders.map((sf) => renderFolder(sf, areaId, depth + 1))}
              {tasks.map((task) => renderTask(task, depth + 2))}
            </>
          )}
        </div>
      )}
    </div>
  );
};
