import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  closestCenter,
  pointerWithin,
  rectIntersection,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import glassWidgetStyles from '../../../styles/glass-widget.module.css';
import { GlassWidget } from '../../../components/common/GlassWidget';
import { GlassButton } from '../../../components/ui/GlassButton';
import { GlassTag } from '../../../components/ui/GlassTag';
import { TaskCardLink } from '../../../components/tasks';
import { AreaCardLink } from '../../../components/areas';
import { FolderCardLink } from '../../../components/folders';
import { TaskStatusBadge, Tooltip } from '../../../components/ui';
import { useModal, useTaskUpdate, useToast } from '../../../context';
import { parseApiErrorMessage } from '../../../utils/parse-api-error';
import { GripVerticalIcon, FolderIcon, CheckSquareIcon, LayoutGridIcon, EyeIcon } from '../../../components/icons';
import type {
  WidgetSizeProps,
  AreaShortCard,
  FolderSummary,
  TaskSummary,
  AreaCreateRequest,
  AreaUpdateRequest,
  FolderCreateRequest,
  FolderUpdateRequest,
  TaskCreateRequest,
  TaskUpdateRequest,
} from '../../../types';
import {
  fetchAreaShortCard,
  fetchAreaById,
  createArea,
  updateArea,
  deleteArea,
  fetchRootFoldersByArea,
  fetchChildFolders,
  fetchFolderById,
  createFolder,
  updateFolder,
  deleteFolder,
  fetchTaskSummaryByFolder,
  fetchTaskSummaryByAreaRoot,
  fetchTaskById,
  createTask,
  updateTask,
  deleteTask,
} from '../../../services/api';
import css from '../../../styles/tree.module.css';
import { hexToRgb } from '../../../utils/color';

/** Собирает все ID потомков папки из загруженных данных */
function getDescendantFolderIds(
  folderId: string,
  foldersByParent: Map<string, FolderSummary[]>
): Set<string> {
  const result = new Set<string>();
  const queue = [folderId];
  while (queue.length > 0) {
    const id = queue.shift()!;
    const children = foldersByParent.get(id) ?? [];
    for (const c of children) {
      result.add(c.id);
      queue.push(c.id);
    }
  }
  return result;
}

/** Коллизия: pointerWithin для точности, closestCenter для надёжности, rectIntersection как fallback */
function collisionDetection(args: Parameters<typeof pointerWithin>[0]) {
  const pointerCollisions = pointerWithin(args);
  if (pointerCollisions.length > 0) return pointerCollisions;
  const closestCollisions = closestCenter(args);
  if (closestCollisions.length > 0) return closestCollisions;
  return rectIntersection(args);
}

/** Полезная нагрузка для перетаскиваемого элемента */
type DragPayload = { type: string; folder?: FolderSummary; task?: TaskSummary };

/** Проверяет, можно ли переместить перетаскиваемый элемент в целевой droppable */
function isValidDrop(
  payload: DragPayload | null | undefined,
  overId: string,
  foldersByArea: Map<string, FolderSummary[]>,
  foldersByParent: Map<string, FolderSummary[]>
): boolean {
  if (!payload) return false;
  const { type, folder } = payload;

  if (type === 'task') return true;

  if (type === 'folder' && folder) {
    if (overId.startsWith('area-root-') || overId.startsWith('area-empty-')) {
      const areaId = overId.replace('area-root-', '').replace('area-empty-', '');
      return folder.areaId === areaId;
    }
    if (overId.startsWith('folder-') || overId.startsWith('folder-empty-')) {
      const targetFolderId = overId.replace('folder-empty-', '').replace('folder-', '');
      if (folder.id === targetFolderId) return false;
      const descendants = getDescendantFolderIds(folder.id, foldersByParent);
      if (descendants.has(targetFolderId)) return false;
      const targetFolder = findFolderById(targetFolderId, foldersByArea, foldersByParent);
      return targetFolder ? folder.areaId === targetFolder.areaId : false;
    }
  }
  return false;
}

/** Находит папку по ID среди загруженных данных */
function findFolderById(
  folderId: string,
  foldersByArea: Map<string, FolderSummary[]>,
  foldersByParent: Map<string, FolderSummary[]>
): FolderSummary | undefined {
  for (const folders of Array.from(foldersByArea.values()).concat(Array.from(foldersByParent.values()))) {
    const found = folders.find((f: FolderSummary) => f.id === folderId);
    if (found) return found;
  }
  return undefined;
}

/** Парсит ID droppable и возвращает целевые areaId и parentFolderId */
function parseDropTarget(
  overId: string,
  foldersByArea: Map<string, FolderSummary[]>,
  foldersByParent: Map<string, FolderSummary[]>
): { areaId: string; parentFolderId: string | null } | null {
  if (overId.startsWith('area-root-') || overId.startsWith('area-empty-')) {
    const areaId = overId.replace('area-root-', '').replace('area-empty-', '');
    return { areaId, parentFolderId: null };
  }
  if (overId.startsWith('folder-') || overId.startsWith('folder-empty-')) {
    const folderId = overId.replace('folder-empty-', '').replace('folder-', '');
    const folder = findFolderById(folderId, foldersByArea, foldersByParent);
    return folder ? { areaId: folder.areaId, parentFolderId: folderId } : null;
  }
  return null;
}

/** Строка папки с drag handle и droppable */
interface TreeFolderRowProps {
  folder: FolderSummary;
  areaId: string;
  depth: number;
  isExpanded: boolean;
  subfolders: FolderSummary[];
  tasks: TaskSummary[];
  isLoading: boolean;
  activeDrag: { id: string; data: { type: string; folder?: FolderSummary; task?: TaskSummary } } | null;
  foldersByArea: Map<string, FolderSummary[]>;
  foldersByParent: Map<string, FolderSummary[]>;
  onToggle: () => void;
  onViewDetails: (e: React.MouseEvent) => void;
  onCreateFolder: (e: React.MouseEvent) => void;
  onCreateTask: (e: React.MouseEvent) => void;
  renderFolder: (folder: FolderSummary, areaId: string, depth: number) => React.ReactNode;
  renderTask: (task: TaskSummary) => React.ReactNode;
}

const TreeFolderRow: React.FC<TreeFolderRowProps> = ({
  folder,
  areaId,
  depth,
  isExpanded,
  subfolders,
  tasks,
  isLoading,
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
  const hasChildren = folder.tasksCount + folder.subfoldersCount > 0;
  const { attributes, listeners, setNodeRef: setDraggableRef, isDragging } = useDraggable({
    id: `folder-${folder.id}`,
    data: { type: 'folder', folder },
  });
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({ id: `folder-${folder.id}`, data: { folder } });
  const canDrop = isValidDrop(activeDrag?.data, `folder-${folder.id}`, foldersByArea, foldersByParent);
  const customColorStyle = folder.customColor ? { '--card-custom-color': folder.customColor, '--card-custom-color-rgb': hexToRgb(folder.customColor) } as React.CSSProperties : {};

  return (
    <React.Fragment>
      <div className={`${css.folderItem} ${isDragging ? css.isDragging : ''}`} style={{ marginLeft: `calc(var(--tree-indent) * ${depth})`, width: `calc(100% - (var(--tree-indent) * ${depth}))` }}>
        <div
          ref={(node) => {
            setDroppableRef(node);
            setDraggableRef(node);
          }}
          className={`${css.folderCard} ${isExpanded ? css.expanded : ''} ${isOver && canDrop ? css.isOverValid : ''} ${isOver && !canDrop ? css.isOverInvalid : ''}`}
          data-custom-color={folder.customColor ? 'true' : undefined}
          style={customColorStyle}
          onClick={hasChildren ? onToggle : undefined}
          role={hasChildren ? 'button' : undefined}
          tabIndex={hasChildren ? 0 : undefined}
          onKeyDown={hasChildren ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(); } } : undefined}
        >
          <div className={css.folderContent}>
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
              <div className={css.dragHandle} {...attributes} {...listeners} onClick={(e) => e.stopPropagation()}>
                <GripVerticalIcon style={{ width: 12, height: 12 }} />
              </div>
              <FolderCardLink
                folder={folder}
                style={customColorStyle}
                dataCustomColor={!!folder.customColor}
              />
            </div>
          </div>
        </div>
      </div>
      {hasChildren && isExpanded && (
        <div className={css.tasksSection} style={{ marginLeft: `calc(var(--tree-indent) * ${depth + 1})` }}>
          {isLoading ? (
            <div className={glassWidgetStyles.placeholder}>Загрузка...</div>
          ) : (
            <>
              {subfolders.map((sf) => renderFolder(sf, areaId, depth + 1))}
              {tasks.map((task) => renderTask(task))}
            </>
          )}
        </div>
      )}
    </React.Fragment>
  );
};

/** Область с droppable-карточкой */
interface TreeAreaSectionProps {
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

const TreeAreaSection: React.FC<TreeAreaSectionProps> = ({
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
  const customColorStyle = area.customColor ? { '--card-custom-color': area.customColor, '--card-custom-color-rgb': hexToRgb(area.customColor) } as React.CSSProperties : {};

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
        onKeyDown={hasChildren ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(); } } : undefined}
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

/** Строка задачи с drag handle */
interface TreeTaskRowProps {
  task: TaskSummary;
  onViewDetails: (e: React.MouseEvent) => void;
}

const TreeTaskRow: React.FC<TreeTaskRowProps> = ({ task, onViewDetails }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `task-${task.id}`,
    data: { type: 'task', task },
  });
  const taskStyle = task.customColor ? { '--card-custom-color': task.customColor, '--card-custom-color-rgb': hexToRgb(task.customColor) } as React.CSSProperties : {};
  return (
    <div className={`${css.taskItem} ${isDragging ? css.isDragging : ''}`}>
      <div ref={setNodeRef} className={css.taskCard} style={taskStyle} data-custom-color={task.customColor ? 'true' : undefined}>
        <div className={css.taskContent}>
          <div className={css.treeRowMain}>
            <div className={css.dragHandle} {...attributes} {...listeners}>
              <GripVerticalIcon style={{ width: 12, height: 12 }} />
            </div>
            <TaskCardLink
              task={task}
              variant="text"
              showTypeIcon
              onClick={onViewDetails}
              style={taskStyle}
              dataCustomColor={!!task.customColor}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export const Tree: React.FC<WidgetSizeProps> = ({ colSpan, rowSpan }) => {
  const { openAreaModal, openFolderModal, openTaskModal } = useModal();
  const { notifyTaskUpdate } = useTaskUpdate();
  const { addError, addSuccess } = useToast();

  const [areas, setAreas] = useState<AreaShortCard[]>([]);
  const [foldersByArea, setFoldersByArea] = useState<Map<string, FolderSummary[]>>(new Map());
  const [foldersByParent, setFoldersByParent] = useState<Map<string, FolderSummary[]>>(new Map());
  const [tasksByArea, setTasksByArea] = useState<Map<string, TaskSummary[]>>(new Map());
  const [tasksByFolder, setTasksByFolder] = useState<Map<string, TaskSummary[]>>(new Map());
  const [expandedAreas, setExpandedAreas] = useState<Set<string>>(new Set());
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [loadingContent, setLoadingContent] = useState<Set<string>>(new Set());
  const [activeDrag, setActiveDrag] = useState<{ id: string; data: { type: string; folder?: FolderSummary; task?: TaskSummary } } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const data = active.data.current as { type: string; folder?: FolderSummary; task?: TaskSummary } | undefined;
    if (data) setActiveDrag({ id: active.id as string, data });
  }, []);

  useEffect(() => {
    const loadAreas = async () => {
      try {
        setLoading(true);
        const data = await fetchAreaShortCard();
        setAreas(data);
      } catch (error) {
        console.error('Ошибка загрузки областей:', error);
        setAreas([]);
        addError(parseApiErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };
    loadAreas();
  }, [addError]);

  const loadAreaContent = useCallback(async (areaId: string) => {
    try {
      setLoadingContent((prev) => new Set(prev).add(`area:${areaId}`));
      const [folders, tasks] = await Promise.all([
        fetchRootFoldersByArea(areaId),
        fetchTaskSummaryByAreaRoot(areaId),
      ]);
      setFoldersByArea((prev) => new Map(prev).set(areaId, folders));
      setTasksByArea((prev) => new Map(prev).set(areaId, tasks));
    } catch (error) {
      console.error(`Ошибка загрузки содержимого области ${areaId}:`, error);
      setFoldersByArea((prev) => new Map(prev).set(areaId, []));
      setTasksByArea((prev) => new Map(prev).set(areaId, []));
      addError(parseApiErrorMessage(error));
    } finally {
      setLoadingContent((prev) => {
        const next = new Set(prev);
        next.delete(`area:${areaId}`);
        return next;
      });
    }
  }, [addError]);

  const loadFolderContent = useCallback(async (folderId: string, areaId: string) => {
    try {
      setLoadingContent((prev) => new Set(prev).add(`folder:${folderId}`));
      const [subfolders, tasks] = await Promise.all([
        fetchChildFolders(folderId, areaId),
        fetchTaskSummaryByFolder(folderId),
      ]);
      setFoldersByParent((prev) => new Map(prev).set(folderId, subfolders));
      setTasksByFolder((prev) => new Map(prev).set(folderId, tasks));
    } catch (error) {
      console.error(`Ошибка загрузки содержимого папки ${folderId}:`, error);
      setFoldersByParent((prev) => new Map(prev).set(folderId, []));
      setTasksByFolder((prev) => new Map(prev).set(folderId, []));
      addError(parseApiErrorMessage(error));
    } finally {
      setLoadingContent((prev) => {
        const next = new Set(prev);
        next.delete(`folder:${folderId}`);
        return next;
      });
    }
  }, [addError]);

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
    [foldersByArea, foldersByParent, addError, addSuccess, notifyTaskUpdate, loadFolderContent]
  );

  const toggleArea = (areaId: string) => {
    setExpandedAreas((prev) => {
      const next = new Set(prev);
      if (next.has(areaId)) next.delete(areaId);
      else {
        next.add(areaId);
        if (!foldersByArea.has(areaId) && !tasksByArea.has(areaId)) loadAreaContent(areaId);
      }
      return next;
    });
  };

  const toggleFolder = (folderId: string, areaId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) next.delete(folderId);
      else {
        next.add(folderId);
        if (!foldersByParent.has(folderId) && !tasksByFolder.has(folderId)) loadFolderContent(folderId, areaId);
      }
      return next;
    });
  };

  const handleCreateArea = () => openAreaModal(null, 'create', handleAreaSave);
  const handleViewAreaDetails = async (areaId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const area = await fetchAreaById(areaId);
      if (area) openAreaModal(area, 'edit', handleAreaSave, handleAreaDelete);
    } catch (error) {
      console.error('Ошибка загрузки области:', error);
      addError(parseApiErrorMessage(error));
    }
  };
  const handleCreateFolderForArea = (areaId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const areasForModal = areas.map((a) => ({ ...a, id: a.id, title: a.title, description: a.description }));
    openFolderModal(null, 'create', areasForModal, (data, folderId) => handleFolderSave(data, folderId), undefined, areaId, null);
  };
  const handleCreateFolderForFolder = (folderId: string, areaId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const areasForModal = areas.map((a) => ({ ...a, id: a.id, title: a.title, description: a.description }));
    openFolderModal(null, 'create', areasForModal, (data, fid) => handleFolderSave(data, fid), undefined, areaId, folderId);
  };
  const handleCreateTaskForArea = (areaId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const areasForTaskModal = areas.map((a) => ({ id: a.id, title: a.title }));
    openTaskModal(null, 'create', (data, taskId) => handleTaskSave(data, taskId), undefined, undefined, areaId, areasForTaskModal);
  };
  const handleCreateTaskForFolder = (folderId: string, areaId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const areasForTaskModal = areas.map((a) => ({ id: a.id, title: a.title }));
    openTaskModal(null, 'create', (data, taskId) => handleTaskSave(data, taskId), undefined, folderId, areaId, areasForTaskModal);
  };
  const handleViewFolderDetails = async (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const folder = await fetchFolderById(folderId);
      if (folder) {
        const areasForModal = areas.map((a) => ({ ...a, id: a.id, title: a.title, description: a.description }));
        openFolderModal(folder, 'edit', areasForModal, (data, fid) => handleFolderSave(data, fid), handleFolderDelete);
      }
    } catch (error) {
      console.error('Ошибка загрузки папки:', error);
      addError(parseApiErrorMessage(error));
    }
  };
  const handleViewTaskDetails = async (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const task = await fetchTaskById(taskId);
      if (task) {
        const areasForTaskModal = areas.map((a) => ({ id: a.id, title: a.title }));
        openTaskModal(task, 'edit', (data, tid) => handleTaskSave(data, tid), handleTaskDelete, undefined, undefined, areasForTaskModal);
      }
    } catch (error) {
      console.error('Ошибка загрузки задачи:', error);
      addError(parseApiErrorMessage(error));
    }
  };

  const handleAreaSave = async (data: AreaCreateRequest | (AreaUpdateRequest & { id?: string })) => {
    try {
      const d = data as { id?: string } & AreaCreateRequest;
      if (!d.id) await createArea(data as AreaCreateRequest);
      else await updateArea(d.id, data as AreaUpdateRequest);
      const updated = await fetchAreaShortCard();
      setAreas(updated);
    } catch (error) {
      console.error('Ошибка сохранения области:', error);
      throw error;
    }
  };
  const handleAreaDelete = async (id: string) => {
    try {
      await deleteArea(id);
      const updated = await fetchAreaShortCard();
      setAreas(updated);
      setFoldersByArea((prev) => {
        const next = new Map(prev);
        next.delete(id);
        return next;
      });
      setTasksByArea((prev) => {
        const next = new Map(prev);
        next.delete(id);
        return next;
      });
    } catch (error) {
      console.error('Ошибка удаления области:', error);
      throw error;
    }
  };
  const handleFolderSave = async (data: FolderCreateRequest | FolderUpdateRequest, folderId?: string) => {
    try {
      const areaId = data.areaId;
      if (!folderId) {
        await createFolder(data as FolderCreateRequest);
      } else {
        await updateFolder(folderId, data as FolderUpdateRequest);
      }
      const rootFolders = await fetchRootFoldersByArea(areaId);
      setFoldersByArea((prev) => new Map(prev).set(areaId, rootFolders));
      if (data.parentFolderId) {
        const children = await fetchChildFolders(data.parentFolderId, areaId);
        setFoldersByParent((prev) => new Map(prev).set(data.parentFolderId!, children));
      }
      setAreas((prev) => prev.map((a) => (a.id === areaId ? { ...a, foldersCount: rootFolders.length } : a)));
    } catch (error) {
      console.error('Ошибка сохранения папки:', error);
      throw error;
    }
  };
  const handleFolderDelete = async (id: string) => {
    try {
      const folder = await fetchFolderById(id);
      const areaId = folder?.areaId;
      const parentId = folder?.parentFolderId;
      await deleteFolder(id);
      if (areaId) {
        const rootFolders = await fetchRootFoldersByArea(areaId);
        setFoldersByArea((prev) => new Map(prev).set(areaId, rootFolders));
        if (parentId) {
          const children = await fetchChildFolders(parentId, areaId);
          setFoldersByParent((prev) => new Map(prev).set(parentId, children));
        }
        setAreas((prev) => prev.map((a) => (a.id === areaId ? { ...a, foldersCount: rootFolders.length } : a)));
      }
      setFoldersByParent((prev) => {
        const next = new Map(prev);
        next.delete(id);
        return next;
      });
      setTasksByFolder((prev) => {
        const next = new Map(prev);
        next.delete(id);
        return next;
      });
    } catch (error) {
      console.error('Ошибка удаления папки:', error);
      throw error;
    }
  };
  const handleTaskSave = async (data: TaskCreateRequest | TaskUpdateRequest, taskId?: string) => {
    try {
      const areaId = data.areaId;
      const folderId = data.folderId ?? undefined;
      if (!taskId) {
        await createTask(data as TaskCreateRequest);
      } else {
        await updateTask(taskId, data as TaskUpdateRequest);
      }
      if (folderId) {
        const tasks = await fetchTaskSummaryByFolder(folderId);
        setTasksByFolder((prev) => new Map(prev).set(folderId, tasks));
      } else {
        const tasks = await fetchTaskSummaryByAreaRoot(areaId);
        setTasksByArea((prev) => new Map(prev).set(areaId, tasks));
      }
      notifyTaskUpdate(taskId, folderId);
    } catch (error) {
      console.error('Ошибка сохранения задачи:', error);
      throw error;
    }
  };
  const handleTaskDelete = async (id: string) => {
    try {
      const task = await fetchTaskById(id);
      const folderId = task?.folderId ?? undefined;
      const areaId = task?.areaId;
      await deleteTask(id);
      if (folderId && areaId) {
        const tasks = await fetchTaskSummaryByFolder(folderId);
        setTasksByFolder((prev) => new Map(prev).set(folderId, tasks));
      } else if (areaId) {
        const tasks = await fetchTaskSummaryByAreaRoot(areaId);
        setTasksByArea((prev) => new Map(prev).set(areaId, tasks));
      }
      notifyTaskUpdate(id, folderId);
    } catch (error) {
      console.error('Ошибка удаления задачи:', error);
      throw error;
    }
  };

  const renderFolder = (folder: FolderSummary, areaId: string, depth: number) => {
    const isExpanded = expandedFolders.has(folder.id);
    const subfolders = foldersByParent.get(folder.id) ?? [];
    const tasks = tasksByFolder.get(folder.id) ?? [];
    const isLoading = loadingContent.has(`folder:${folder.id}`);
    return (
      <TreeFolderRow
        key={folder.id}
        folder={folder}
        areaId={areaId}
        depth={depth}
        isExpanded={isExpanded}
        subfolders={subfolders}
        tasks={tasks}
        isLoading={isLoading}
        activeDrag={activeDrag}
        foldersByArea={foldersByArea}
        foldersByParent={foldersByParent}
        onToggle={() => toggleFolder(folder.id, areaId)}
        onViewDetails={(e) => handleViewFolderDetails(folder.id, e)}
        onCreateFolder={(e) => handleCreateFolderForFolder(folder.id, areaId, e)}
        onCreateTask={(e) => handleCreateTaskForFolder(folder.id, areaId, e)}
        renderFolder={renderFolder}
        renderTask={(task) => <TreeTaskRow key={task.id} task={task} onViewDetails={(e) => handleViewTaskDetails(task.id, e)} />}
      />
    );
  };

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
              <GlassButton variant="subtle" size="xs" onClick={handleCreateArea} aria-label="Создать область">
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
                  onViewDetails={(e) => handleViewAreaDetails(area.id, e)}
                  onCreateFolder={(e) => handleCreateFolderForArea(area.id, e)}
                  onCreateTask={(e) => handleCreateTaskForArea(area.id, e)}
                  onViewTaskDetails={handleViewTaskDetails}
                  renderFolder={renderFolder}
                />
              ))
            )}
          </div>
        </div>
        {createPortal(
          <DragOverlay zIndex={1100} style={{ cursor: 'grabbing' }}>
            {activeDrag?.data.type === 'folder' && activeDrag.data.folder && (
              <div className={css.dragOverlayCard}>
                <GripVerticalIcon style={{ width: 16, height: 16, flexShrink: 0 }} />
                <GlassTag variant="subtle" size="xs">{activeDrag.data.folder.tasksCount + activeDrag.data.folder.subfoldersCount}</GlassTag>
                <span>{activeDrag.data.folder.title}</span>
              </div>
            )}
            {activeDrag?.data.type === 'task' && activeDrag.data.task && (
              <div className={css.dragOverlayCard}>
                <GripVerticalIcon style={{ width: 16, height: 16, flexShrink: 0 }} />
                <TaskStatusBadge status={activeDrag.data.task.status} size="xs" variant="compact" />
                <span>{activeDrag.data.task.title}</span>
              </div>
            )}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </GlassWidget>
  );
};
