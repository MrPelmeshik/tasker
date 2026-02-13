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
import {
  fetchRootFoldersByArea,
  fetchChildFolders,
  fetchTaskSummaryByFolder,
  fetchTaskSummaryByAreaRoot,
  updateFolder,
  updateTask,
} from '../../../../services/api';
import { GlassWidget } from '../../../../components/common/GlassWidget';
import { GlassButton } from '../../../../components/ui/GlassButton';
import { Tooltip } from '../../../../components/ui';
import { LayoutGridIcon } from '../../../../components/icons';
import { useModal, useTaskUpdate, useToast } from '../../../../context';
import { parseApiErrorMessage } from '../../../../utils/parse-api-error';
import type { WidgetSizeProps, FolderSummary } from '../../../../types';
import { collisionDetection, parseDropTarget, isValidDrop, type DragPayload } from './treeUtils';
import { useTreeData } from './useTreeData';
import { useTreeHandlers } from './useTreeHandlers';
import { TreeAreaSection } from './TreeAreaSection';
import { TreeFolderRow } from './TreeFolderRow';
import { TreeTaskRow } from './TreeTaskRow';
import { TreeDndOverlay } from './TreeDndOverlay';
import glassWidgetStyles from '../../../../styles/glass-widget.module.css';
import css from '../../../../styles/tree.module.css';

export const Tree: React.FC<WidgetSizeProps> = ({ colSpan, rowSpan }) => {
  const { openAreaModal, openFolderModal, openTaskModal } = useModal();
  const { notifyTaskUpdate, subscribeToTaskUpdates } = useTaskUpdate();
  const { addError, addSuccess } = useToast();

  const treeData = useTreeData({
    addError,
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
    loadFolderContent,
    toggleArea,
    toggleFolder,
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
    addError,
    addSuccess,
    notifyTaskUpdate,
    openAreaModal,
    openFolderModal,
    openTaskModal,
  });

  const [activeDrag, setActiveDrag] = useState<{ id: string; data: DragPayload } | null>(null);

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
      const { active, over } = event;
      setActiveDrag(null);
      if (!over) {
        console.debug('[Tree DnD] handleDragEnd: over=null, ранний выход');
        return;
      }
      const overId = String(over.id);
      const target = parseDropTarget(overId, foldersByArea, foldersByParent);
      const payload = (active.data?.current ?? active.data) as DragPayload | undefined;
      console.debug('[Tree DnD] handleDragEnd:', { over, overId, target, payload, isValidDrop: payload ? isValidDrop(payload, overId, foldersByArea, foldersByParent) : false });
      if (!target || !payload || !isValidDrop(payload, overId, foldersByArea, foldersByParent)) {
        console.debug('[Tree DnD] handleDragEnd: ранний выход (target/payload/isValidDrop)');
        return;
      }

      try {
        if (payload.type === 'folder' && payload.folder) {
          const folder = payload.folder;
          await updateFolder(folder.id, {
            title: folder.title,
            description: folder.description ?? '',
            areaId: folder.areaId,
            parentFolderId: target.parentFolderId,
          });
          const rootFolders = await fetchRootFoldersByArea(folder.areaId);
          setFoldersByArea((prev) => new Map(prev).set(folder.areaId, rootFolders));
          if (folder.parentFolderId) {
            const children = await fetchChildFolders(folder.parentFolderId, folder.areaId);
            setFoldersByParent((prev) => new Map(prev).set(folder.parentFolderId!, children));
          }
          if (target.parentFolderId) {
            const children = await fetchChildFolders(target.parentFolderId, target.areaId);
            setFoldersByParent((prev) => new Map(prev).set(target.parentFolderId!, children));
          }
          setAreas((prev) => prev.map((a) => (a.id === folder.areaId ? { ...a, foldersCount: rootFolders.length } : a)));
          setExpandedAreas((prev) => new Set(prev).add(folder.areaId));
          if (target.parentFolderId) setExpandedFolders((prev) => new Set(prev).add(target.parentFolderId!));
          addSuccess('Папка перемещена');
        } else if (payload.type === 'task' && payload.task) {
          const task = payload.task;
          console.debug('[Tree DnD] updateTask:', task.id, { areaId: target.areaId, folderId: target.parentFolderId });
          await updateTask(task.id, {
            title: task.title,
            description: task.description ?? '',
            areaId: target.areaId,
            folderId: target.parentFolderId,
            status: task.status,
          });
          const oldFolderId = task.folderId ?? undefined;
          const oldAreaId = task.areaId;
          if (oldFolderId) {
            const tasks = await fetchTaskSummaryByFolder(oldFolderId);
            setTasksByFolder((prev) => new Map(prev).set(oldFolderId, tasks));
            const subfolders = foldersByParent.get(oldFolderId) ?? [];
            if (tasks.length === 0 && subfolders.length === 0) {
              setExpandedFolders((prev) => {
                const next = new Set(prev);
                next.delete(oldFolderId);
                return next;
              });
            }
          } else if (oldAreaId) {
            const tasks = await fetchTaskSummaryByAreaRoot(oldAreaId);
            setTasksByArea((prev) => new Map(prev).set(oldAreaId, tasks));
          }
          if (target.parentFolderId) {
            await loadFolderContent(target.parentFolderId, target.areaId);
            setExpandedAreas((prev) => new Set(prev).add(target.areaId));
            setExpandedFolders((prev) => new Set(prev).add(target.parentFolderId!));
          } else {
            const tasks = await fetchTaskSummaryByAreaRoot(target.areaId);
            setTasksByArea((prev) => new Map(prev).set(target.areaId, tasks));
            setExpandedAreas((prev) => new Set(prev).add(target.areaId));
          }
          notifyTaskUpdate(task.id, target.parentFolderId ?? undefined);
          addSuccess('Задача перемещена');
        }
      } catch (error) {
        console.error('Ошибка перемещения:', error);
        addError(parseApiErrorMessage(error));
      }
    },
    [foldersByArea, foldersByParent, addError, addSuccess, notifyTaskUpdate, loadFolderContent, setAreas, setFoldersByArea, setFoldersByParent, setTasksByArea, setTasksByFolder, setExpandedAreas, setExpandedFolders]
  );

  const renderFolder = useCallback(
    (folder: FolderSummary, areaId: string, depth: number) => {
      const subfolders = foldersByParent.get(folder.id) ?? [];
      const tasks = tasksByFolder.get(folder.id) ?? [];
      const isLoading = loadingContent.has(`folder:${folder.id}`);
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
          activeDrag={activeDrag}
          foldersByArea={foldersByArea}
          foldersByParent={foldersByParent}
          onToggle={() => toggleFolder(folder.id, areaId)}
          onViewDetails={(e) => handlers.handleViewFolderDetails(folder.id, e)}
          onCreateFolder={(e) => handlers.handleCreateFolderForFolder(folder.id, areaId, e)}
          onCreateTask={(e) => handlers.handleCreateTaskForFolder(folder.id, areaId, e)}
          renderFolder={renderFolder}
          renderTask={(task) => <TreeTaskRow key={task.id} task={task} onViewDetails={(e) => handlers.handleViewTaskDetails(task.id, e)} />}
        />
      );
    },
    [expandedFolders, foldersByParent, tasksByFolder, loadingContent, activeDrag, foldersByArea, toggleFolder, handlers]
  );

  if (loading) {
    return (
      <GlassWidget title="Иерархия" colSpan={colSpan} rowSpan={rowSpan}>
        <div className={glassWidgetStyles.placeholder}>Загрузка...</div>
      </GlassWidget>
    );
  }

  return (
    <GlassWidget colSpan={colSpan} rowSpan={rowSpan}>
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveDrag(null)}
      >
        <div className={css.tree}>
          <div className={css.widgetHeader}>
            <h3 className={css.widgetTitle}>Дерево</h3>
            <Tooltip content="Создать область" placement="bottom">
              <GlassButton variant="subtle" size="xs" onClick={handlers.handleCreateArea} aria-label="Создать область">
                <LayoutGridIcon style={{ width: 16, height: 16 }} />
              </GlassButton>
            </Tooltip>
          </div>
          {activeDrag && <div className={css.dragHint}>Переместите в папку или область</div>}
          <div className={css.widgetContent}>
            {areas.length === 0 ? (
              <div className={glassWidgetStyles.placeholder}>Нет доступных областей</div>
            ) : (
              areas.map((area) => (
                <TreeAreaSection
                  key={area.id}
                  area={area}
                  isExpanded={expandedAreas.has(area.id)}
                  folders={foldersByArea.get(area.id) ?? []}
                  tasks={tasksByArea.get(area.id) ?? []}
                  isLoading={loadingContent.has(`area:${area.id}`)}
                  activeDrag={activeDrag}
                  foldersByArea={foldersByArea}
                  foldersByParent={foldersByParent}
                  onToggle={() => toggleArea(area.id)}
                  onViewDetails={(e) => handlers.handleViewAreaDetails(area.id, e)}
                  onCreateFolder={(e) => handlers.handleCreateFolderForArea(area.id, e)}
                  onCreateTask={(e) => handlers.handleCreateTaskForArea(area.id, e)}
                  onViewTaskDetails={handlers.handleViewTaskDetails}
                  renderFolder={renderFolder}
                />
              ))
            )}
          </div>
        </div>
        {createPortal(
          <DragOverlay zIndex={1100} style={{ cursor: 'grabbing' }}>
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
    </GlassWidget>
  );
};
