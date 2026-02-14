import React, { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { GlassWidget } from '../../../../components/common/GlassWidget';
import { Z_INDEX_DND_OVERLAY } from '../../../../config/constants';
import { Loader } from '../../../../components/ui/Loader';
import { useModal, useTaskUpdate, useToast } from '../../../../context';
import type { WidgetSizeProps, FolderSummary } from '../../../../types';
import { type EntityType } from '../../../../utils/entity-links';
import {
  collisionDetection,
  filterTasksByStatus,
  sortTasks,
  type DragPayload,
} from './treeUtils';
import { useTreeData } from './useTreeData';
import { useTreeHandlers } from './useTreeHandlers';
import { useTreeFilters } from './useTreeFilters';
import { useTreeDeepLink } from './useTreeDeepLink';
import { useTreeDragEnd } from './useTreeDragEnd';
import { TreeFolderRow } from './TreeFolderRow';
import { TreeTaskRow } from './TreeTaskRow';
import { TreeDndOverlay } from './TreeDndOverlay';
import { TreeToolbar } from './TreeToolbar';
import { TreeEmpty } from './TreeEmpty';
import { TreeContent } from './TreeContent';
import glassWidgetStyles from '../../../../styles/glass-widget.module.css';
import css from '../../../../styles/tree.module.css';

export interface TreeProps extends WidgetSizeProps {
  /** Deep link для открытия сущности при загрузке страницы */
  initialDeepLink?: { entityType: EntityType; entityId: string };
  /** Режим встраивания: без обёртки GlassWidget (используется внутри SidebarTabsWidget) */
  embedded?: boolean;
}

export const Tree: React.FC<TreeProps> = ({ colSpan, rowSpan, initialDeepLink, embedded }) => {
  const { openAreaModal, openFolderModal, openTaskModal } = useModal();
  const { notifyTaskUpdate, subscribeToTaskUpdates } = useTaskUpdate();
  const { showError, addSuccess } = useToast();

  const treeData = useTreeData({
    showError,
    subscribeToTaskUpdates,
  });

  const {
    areas,
    setAreas,
    foldersByArea,
    setFoldersByArea,
    foldersByParent,
    setFoldersByParent,
    tasksByArea,
    setTasksByArea,
    tasksByFolder,
    setTasksByFolder,
    expandedAreas,
    expandedFolders,
    setExpandedAreas,
    setExpandedFolders,
    loading,
    loadingContent,
    loadAreaContent,
    loadFolderContent,
    toggleArea,
    toggleFolder,
    expandAll,
    collapseAll,
    isAllExpanded,
  } = treeData;

  const handlers = useTreeHandlers({
    areas,
    setAreas,
    setFoldersByArea,
    setFoldersByParent,
    setTasksByArea,
    setTasksByFolder,
    setExpandedAreas,
    setExpandedFolders,
    loadFolderContent,
    foldersByParent,
    showError,
    addSuccess,
    notifyTaskUpdate,
    openAreaModal,
    openFolderModal,
    openTaskModal,
  });

  const [activeDrag, setActiveDrag] = useState<{ id: string; data: DragPayload } | null>(null);

  const { enabledStatuses, sortPreset, hasStatusFilter, toggleStatus, setSortPreset } = useTreeFilters();

  useTreeDeepLink({
    loading,
    initialDeepLink,
    areas,
    foldersByArea,
    foldersByParent,
    tasksByArea,
    tasksByFolder,
    setExpandedAreas,
    setExpandedFolders,
    loadAreaContent,
    loadFolderContent,
    openAreaModal,
    openFolderModal,
    openTaskModal,
    showError,
    handleAreaSave: handlers.handleAreaSave,
    handleAreaDelete: handlers.handleAreaDelete ?? (() => Promise.resolve()),
    handleFolderSave: handlers.handleFolderSave,
    handleFolderDelete: handlers.handleFolderDelete ?? (() => Promise.resolve()),
    handleTaskSave: handlers.handleTaskSave,
    handleTaskDelete: handlers.handleTaskDelete ?? (() => Promise.resolve()),
  });

  const handleDragEndCallback = useTreeDragEnd({
    foldersByArea,
    foldersByParent,
    setFoldersByArea,
    setFoldersByParent,
    setTasksByArea,
    setTasksByFolder,
    setExpandedFolders,
    setAreas,
    loadFolderContent,
    showError,
    addSuccess,
    notifyTaskUpdate,
  });

  const filterAndSortTasks = useCallback(
    (tasks: import('../../../../types').TaskSummary[]) => {
      const filtered = hasStatusFilter ? filterTasksByStatus(tasks, enabledStatuses) : tasks;
      return sortTasks(filtered, sortPreset);
    },
    [enabledStatuses, sortPreset, hasStatusFilter]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const data = active.data.current as DragPayload | undefined;
    if (data) setActiveDrag({ id: active.id as string, data });
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveDrag(null);
      await handleDragEndCallback(event);
    },
    [handleDragEndCallback]
  );

  const renderFolder = useCallback(
    (folder: FolderSummary, areaId: string, depth: number) => {
      const subfolders = foldersByParent.get(folder.id) ?? [];
      const rawTasks = tasksByFolder.get(folder.id) ?? [];
      const tasks = filterAndSortTasks(rawTasks);
      const isLoading = loadingContent.has(`folder:${folder.id}`);
      const displayCount = hasStatusFilter ? subfolders.length + tasks.length : undefined;
      const totalCount = hasStatusFilter ? folder.tasksCount + folder.subfoldersCount : undefined;
      return (
        <TreeFolderRow
          key={folder.id}
          folder={folder}
          areaId={areaId}
          depth={depth}
          isExpanded={expandedFolders.has(folder.id)}
          subfolders={subfolders}
          tasks={tasks}
          isLoading={isLoading}
          displayCount={displayCount}
          totalCount={totalCount}
          activeDrag={activeDrag}
          foldersByArea={foldersByArea}
          foldersByParent={foldersByParent}
          onToggle={() => toggleFolder(folder.id, areaId)}
          onViewDetails={(e) => handlers.handleViewFolderDetails(folder.id, e)}
          onCreateFolder={(e) => handlers.handleCreateFolderForFolder(folder.id, areaId, e)}
          onCreateTask={(e) => handlers.handleCreateTaskForFolder(folder.id, areaId, e)}
          renderFolder={renderFolder}
          renderTask={(task, level) => <TreeTaskRow key={task.id} level={level} task={task} onViewDetails={(e) => handlers.handleViewTaskDetails(task.id, e)} />}
        />
      );
    },
    [expandedFolders, foldersByParent, tasksByFolder, loadingContent, activeDrag, foldersByArea, toggleFolder, handlers, filterAndSortTasks, hasStatusFilter]
  );

  const innerContent = (
    <div className={css.tree}>
      {activeDrag && <div className={css.dragHint}>Переместите в папку или область</div>}
      <div className={`${css.widgetContent} scrollbar-compact`}>
        <TreeToolbar
          onCreateArea={handlers.handleCreateArea}
          isAllExpanded={isAllExpanded}
          onExpandAll={expandAll}
          onCollapseAll={collapseAll}
          enabledStatuses={enabledStatuses}
          toggleStatus={toggleStatus}
          sortPreset={sortPreset}
          setSortPreset={setSortPreset}
        />
        {loading ? (
          <div className={glassWidgetStyles.placeholder}><Loader size="m" ariaLabel="Загрузка" /></div>
        ) : areas.length === 0 ? (
          <TreeEmpty />
        ) : (
          <TreeContent
            areas={areas}
            foldersByArea={foldersByArea}
            foldersByParent={foldersByParent}
            tasksByArea={tasksByArea}
            expandedAreas={expandedAreas}
            loadingContent={loadingContent}
            activeDrag={activeDrag}
            filterAndSortTasks={filterAndSortTasks}
            hasStatusFilter={hasStatusFilter}
            onToggleArea={toggleArea}
            onViewAreaDetails={handlers.handleViewAreaDetails}
            onCreateFolderForArea={handlers.handleCreateFolderForArea}
            onCreateTaskForArea={handlers.handleCreateTaskForArea}
            onViewTaskDetails={handlers.handleViewTaskDetails}
            renderFolder={renderFolder}
          />
        )}
      </div>
    </div>
  );

  const dndContent = (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveDrag(null)}
    >
      {innerContent}
      {createPortal(
        <DragOverlay zIndex={Z_INDEX_DND_OVERLAY} className="cursor-grabbing">
          {activeDrag?.data.type === 'folder' && activeDrag.data.folder && (
            <TreeDndOverlay type="folder" folder={activeDrag.data.folder} />
          )}
          {activeDrag?.data.type === 'task' && activeDrag.data.task && (
            <TreeDndOverlay type="task" task={activeDrag.data.task} />
          )}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );

  if (embedded) {
    return dndContent;
  }

  if (loading) {
    return (
      <GlassWidget title="Иерархия" colSpan={colSpan} rowSpan={rowSpan}>
        <div className={glassWidgetStyles.placeholder}><Loader size="m" ariaLabel="Загрузка" /></div>
      </GlassWidget>
    );
  }

  return (
    <GlassWidget colSpan={colSpan} rowSpan={rowSpan}>
      {dndContent}
    </GlassWidget>
  );
};
