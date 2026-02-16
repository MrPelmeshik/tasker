import React, { useState, useCallback, useMemo } from 'react';
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
import type { WidgetSizeProps } from '../../../../types';
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
import { TreeDndOverlay } from './TreeDndOverlay';
import { TreeToolbar } from './TreeToolbar';
import { TreeEmpty } from './TreeEmpty';
import { TreeContent } from './TreeContent';
import { TreeProvider } from './TreeContext';
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
    setFoldersByArea,
    setFoldersByParent,
    setTasksByArea,
    setTasksByFolder,
    setExpandedAreas,
    setExpandedFolders,
    loadFolderContent,
    loadAreaContent,
    foldersByArea,
    foldersByParent,
    tasksByArea,
    tasksByFolder,
    expandedAreas,
    expandedFolders,
    loading,
    loadingContent,
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

  // Construct Context Value
  const contextValue = useMemo(() => ({
    // Data
    areas, // Actually areas only used in TreeContent loop, but simpler to include
    foldersByArea,
    foldersByParent,
    tasksByArea,
    tasksByFolder,
    expandedAreas,
    expandedFolders,
    loadingContent,
    activeDrag,

    // Actions
    actions: {
      toggleArea,
      toggleFolder,
      onViewAreaDetails: handlers.handleViewAreaDetails,
      onCreateFolderForArea: handlers.handleCreateFolderForArea,
      onCreateTaskForArea: handlers.handleCreateTaskForArea,
      onViewFolderDetails: handlers.handleViewFolderDetails,
      onCreateFolderForFolder: handlers.handleCreateFolderForFolder,
      onCreateTaskForFolder: handlers.handleCreateTaskForFolder,
      onViewTaskDetails: handlers.handleViewTaskDetails,
      onSetAreaColor: handlers.handleSetAreaColor,
    },

    // Helpers
    helpers: {
      filterAndSortTasks,
      hasStatusFilter,
    }
  }), [
    areas,
    foldersByArea,
    foldersByParent,
    tasksByArea,
    tasksByFolder,
    expandedAreas,
    expandedFolders,
    loadingContent,
    activeDrag,
    toggleArea,
    toggleFolder,
    handlers,
    filterAndSortTasks,
    hasStatusFilter
  ]);

  const innerContent = (
    <div className={css.tree}>
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
      {activeDrag && <div className={css.dragHint}>Переместите в папку или область</div>}
      <div className={`${css.widgetContent} scrollbar-compact`}>
        {loading ? (
          <div className={glassWidgetStyles.placeholder}><Loader size="m" ariaLabel="Загрузка" /></div>
        ) : areas.length === 0 ? (
          <TreeEmpty />
        ) : (
          <TreeContent />
        )}
      </div>
    </div>
  );

  const dndContent = (
    <TreeProvider value={contextValue}>
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
    </TreeProvider>
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
