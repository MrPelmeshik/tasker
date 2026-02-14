import React, { useState, useCallback, useEffect, useRef } from 'react';
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
  fetchAreaById,
  fetchFolderById,
  fetchTaskById,
  updateFolder,
  updateTask,
} from '../../../../services/api';
import { GlassWidget } from '../../../../components/common/GlassWidget';
import { LayoutGridIcon, UnfoldVerticalIcon, FoldVerticalIcon, FilterIcon, SortIcon } from '../../../../components/icons';
import { Tooltip } from '../../../../components/ui/Tooltip';
import { GlassButton } from '../../../../components/ui/GlassButton';
import { GlassSelect } from '../../../../components/ui/GlassSelect';
import { Loader } from '../../../../components/ui/Loader';
import { TaskStatusBadge } from '../../../../components/ui/TaskStatusBadge';
import type { TaskStatus } from '../../../../types/task-status';
import { getTaskStatusOptions } from '../../../../types/task-status';
import { useModal, useTaskUpdate, useToast } from '../../../../context';
import type { WidgetSizeProps, FolderSummary } from '../../../../types';
import type { FolderResponse } from '../../../../types/api';
import { isValidEntityId, type EntityType } from '../../../../utils/entity-links';
import {
  collisionDetection,
  parseDropTarget,
  isValidDrop,
  filterTasksByStatus,
  sortTasks,
  TREE_SORT_PRESET_OPTIONS,
  type DragPayload,
  type TreeSortPreset,
} from './treeUtils';
import { useTreeData } from './useTreeData';
import { useTreeHandlers } from './useTreeHandlers';
import { TreeAreaSection } from './TreeAreaSection';
import { TreeFolderRow } from './TreeFolderRow';
import { TreeTaskRow } from './TreeTaskRow';
import { TreeDndOverlay } from './TreeDndOverlay';
import glassWidgetStyles from '../../../../styles/glass-widget.module.css';
import css from '../../../../styles/tree.module.css';

const TREE_FILTERS_STORAGE_KEY = 'tasker-tree-filters';

function loadTreeFilters(): { enabledStatuses: Set<TaskStatus>; sortPreset: TreeSortPreset } {
  const validStatuses = new Set(getTaskStatusOptions().map((o) => o.value as TaskStatus));
  const validPresets = new Set(TREE_SORT_PRESET_OPTIONS.map((o) => o.value));
  try {
    const raw = localStorage.getItem(TREE_FILTERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { enabledStatuses?: number[]; sortPreset?: string };
      const enabledStatuses =
        Array.isArray(parsed.enabledStatuses) && parsed.enabledStatuses.length > 0
          ? new Set((parsed.enabledStatuses as TaskStatus[]).filter((v) => validStatuses.has(v)))
          : new Set(validStatuses);
      const sortPreset =
        typeof parsed.sortPreset === 'string' && validPresets.has(parsed.sortPreset as TreeSortPreset)
          ? (parsed.sortPreset as TreeSortPreset)
          : 'statusAscAlpha';
      return {
        enabledStatuses: enabledStatuses.size > 0 ? enabledStatuses : new Set(validStatuses),
        sortPreset,
      };
    }
  } catch {
    /* ignore */
  }
  return {
    enabledStatuses: new Set(validStatuses),
    sortPreset: 'statusAscAlpha',
  };
}

function saveTreeFilters(enabledStatuses: Set<TaskStatus>, sortPreset: TreeSortPreset): void {
  try {
    localStorage.setItem(
      TREE_FILTERS_STORAGE_KEY,
      JSON.stringify({
        enabledStatuses: Array.from(enabledStatuses),
        sortPreset,
      })
    );
  } catch {
    /* ignore */
  }
}

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
  const processedDeepLinkRef = useRef<string | null>(null);

  const [filterState, setFilterState] = useState(loadTreeFilters);
  const { enabledStatuses, sortPreset } = filterState;
  const hasStatusFilter = enabledStatuses.size < 5;

  useEffect(() => {
    saveTreeFilters(enabledStatuses, sortPreset);
  }, [enabledStatuses, sortPreset]);

  const toggleStatus = useCallback((status: TaskStatus) => {
    setFilterState((prev) => {
      const next = new Set(prev.enabledStatuses);
      if (next.has(status)) {
        next.delete(status);
      } else {
        next.add(status);
      }
      return { ...prev, enabledStatuses: next };
    });
  }, []);

  const setSortPreset = useCallback((preset: TreeSortPreset) => {
    setFilterState((prev) => ({ ...prev, sortPreset: preset }));
  }, []);

  const filterAndSortTasks = useCallback(
    (tasks: import('../../../../types').TaskSummary[]) => {
      const filtered = hasStatusFilter ? filterTasksByStatus(tasks, enabledStatuses) : tasks;
      return sortTasks(filtered, sortPreset);
    },
    [enabledStatuses, sortPreset, hasStatusFilter]
  );

  useEffect(() => {
    if (loading || !initialDeepLink) return;
    const key = `${initialDeepLink.entityType}:${initialDeepLink.entityId}`;
    if (processedDeepLinkRef.current === key) return;
    processedDeepLinkRef.current = key;

    const process = async () => {
      const { entityType, entityId } = initialDeepLink;
      if (!isValidEntityId(entityId)) {
        showError('Ресурс не найден');
        return;
      }
      try {
        if (entityType === 'area') {
          const area = await fetchAreaById(entityId);
          if (!area) {
            showError('Ресурс недоступен');
            return;
          }
          setExpandedAreas((prev) => new Set(prev).add(area.id));
          if (!foldersByArea.has(area.id) && !tasksByArea.has(area.id)) {
            await loadAreaContent(area.id);
          }
          openAreaModal(area, 'edit', handlers.handleAreaSave, handlers.handleAreaDelete);
        } else if (entityType === 'folder') {
          const folder = await fetchFolderById(entityId);
          if (!folder) {
            showError('Ресурс недоступен');
            return;
          }
          setExpandedAreas((prev) => new Set(prev).add(folder.areaId));
          const folderIdsToExpand: string[] = [];
          let current: FolderResponse | null = folder;
          while (current) {
            folderIdsToExpand.unshift(current.id);
            if (current.parentFolderId) {
              const parent: FolderResponse | null = await fetchFolderById(current.parentFolderId);
              current = parent;
            } else {
              current = null;
            }
          }
          if (!foldersByArea.has(folder.areaId) && !tasksByArea.has(folder.areaId)) {
            await loadAreaContent(folder.areaId);
          }
          for (let i = 0; i < folderIdsToExpand.length - 1; i++) {
            const fid = folderIdsToExpand[i];
            setExpandedFolders((prev) => new Set(prev).add(fid));
            if (!foldersByParent.has(fid) && !tasksByFolder.has(fid)) {
              await loadFolderContent(fid, folder.areaId);
            }
          }
          setExpandedFolders((prev) => new Set(prev).add(folder.id));
          if (!foldersByParent.has(folder.id) && !tasksByFolder.has(folder.id)) {
            await loadFolderContent(folder.id, folder.areaId);
          }
          const areasForModal = areas.map((a) => ({ ...a, id: a.id, title: a.title, description: a.description }));
          openFolderModal(folder, 'edit', areasForModal, handlers.handleFolderSave, handlers.handleFolderDelete);
        } else {
          const task = await fetchTaskById(entityId);
          if (!task) {
            showError('Ресурс недоступен');
            return;
          }
          setExpandedAreas((prev) => new Set(prev).add(task.areaId));
          if (task.folderId) {
            let currentFolderId: string | null = task.folderId;
            const folderChain: { id: string; areaId: string }[] = [];
            while (currentFolderId) {
              const f: FolderResponse | null = await fetchFolderById(currentFolderId);
              if (!f) break;
              folderChain.unshift({ id: f.id, areaId: f.areaId });
              currentFolderId = f.parentFolderId ?? null;
            }
            if (!foldersByArea.has(task.areaId) && !tasksByArea.has(task.areaId)) {
              await loadAreaContent(task.areaId);
            }
            for (let i = 0; i < folderChain.length; i++) {
              const { id: fid, areaId } = folderChain[i];
              setExpandedFolders((prev) => new Set(prev).add(fid));
              if (!foldersByParent.has(fid) && !tasksByFolder.has(fid)) {
                await loadFolderContent(fid, areaId);
              }
            }
          } else if (!foldersByArea.has(task.areaId) && !tasksByArea.has(task.areaId)) {
            await loadAreaContent(task.areaId);
          }
          const areasForTaskModal = areas.map((a) => ({ id: a.id, title: a.title }));
          openTaskModal(task, 'edit', handlers.handleTaskSave, handlers.handleTaskDelete, undefined, undefined, areasForTaskModal);
        }
      } catch {
        showError('Ресурс недоступен');
      }
    };
    process();
  }, [
    loading,
    initialDeepLink,
    areas,
    foldersByArea,
    foldersByParent,
    tasksByArea,
    tasksByFolder,
    setExpandedAreas,
    setExpandedFolders,
    setFoldersByArea,
    setTasksByArea,
    loadAreaContent,
    loadFolderContent,
    openAreaModal,
    openFolderModal,
    openTaskModal,
    showError,
    handlers,
  ]);

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

      /** Выход без действия, если отпущено на то же место */
      if (payload.type === 'folder' && payload.folder) {
        const folder = payload.folder;
        if (target.areaId === folder.areaId && (target.parentFolderId ?? null) === (folder.parentFolderId ?? null)) {
          return;
        }
      } else if (payload.type === 'task' && payload.task) {
        const task = payload.task;
        if (target.areaId === task.areaId && (target.parentFolderId ?? null) === (task.folderId ?? null)) {
          return;
        }
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
          } else {
            const tasks = await fetchTaskSummaryByAreaRoot(target.areaId);
            setTasksByArea((prev) => new Map(prev).set(target.areaId, tasks));
          }
          notifyTaskUpdate(task.id, target.parentFolderId ?? undefined);
          addSuccess('Задача перемещена');
        }
      } catch (error) {
        console.error('Ошибка перемещения:', error);
        showError(error);
      }
    },
    [foldersByArea, foldersByParent, showError, addSuccess, notifyTaskUpdate, loadFolderContent, setAreas, setFoldersByArea, setFoldersByParent, setTasksByArea, setTasksByFolder, setExpandedFolders]
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
      <div className={css.widgetContent}>
        <div className={css.treeTopActions}>
          <Tooltip content="Создать область" placement="top">
            <GlassButton
              variant="subtle"
              size="xs"
              className={`${css.treeActionButton} ${css.treeTopActionButton}`}
              onClick={handlers.handleCreateArea}
              aria-label="Создать область"
            >
              <LayoutGridIcon style={{ width: 14, height: 14 }} />
            </GlassButton>
          </Tooltip>
          <Tooltip content={isAllExpanded ? 'Свернуть дерево' : 'Развернуть дерево'} placement="top">
            <GlassButton
              variant="subtle"
              size="xs"
              className={`${css.treeActionButton} ${css.treeTopActionButton}`}
              onClick={() => (isAllExpanded ? collapseAll() : expandAll())}
              aria-label={isAllExpanded ? 'Свернуть дерево' : 'Развернуть дерево'}
            >
              {isAllExpanded ? (
                <FoldVerticalIcon style={{ width: 14, height: 14 }} />
              ) : (
                <UnfoldVerticalIcon style={{ width: 14, height: 14 }} />
              )}
            </GlassButton>
          </Tooltip>
          <div className={css.treeStatusFiltersBlock}>
            <span className={css.treeStatusFiltersBlockIcon} aria-hidden>
              <FilterIcon style={{ width: 14, height: 14 }} />
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
            renderValue={(opt) => (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <SortIcon style={{ width: 14, height: 14, flexShrink: 0 }} />
                {opt.label}
              </span>
            )}
          />
        </div>
        {loading ? (
          <div className={glassWidgetStyles.placeholder}><Loader size="m" ariaLabel="Загрузка" /></div>
        ) : areas.length === 0 ? (
          <div className={glassWidgetStyles.placeholder}>Нет доступных областей</div>
        ) : (
          areas.map((area) => {
            const rawTasks = tasksByArea.get(area.id) ?? [];
            const filteredTasks = filterAndSortTasks(rawTasks);
            const folders = foldersByArea.get(area.id) ?? [];
            const displayCount = hasStatusFilter ? folders.length + filteredTasks.length : undefined;
            const totalCount = hasStatusFilter ? area.foldersCount + area.rootTasksCount : undefined;
            return (
              <TreeAreaSection
                key={area.id}
                area={area}
                isExpanded={expandedAreas.has(area.id)}
                folders={folders}
                tasks={filteredTasks}
                isLoading={loadingContent.has(`area:${area.id}`)}
                displayCount={displayCount}
                totalCount={totalCount}
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
            );
          })
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
