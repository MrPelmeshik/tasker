import React, { useState, useEffect, useCallback } from 'react';
import glassWidgetStyles from '../../../styles/glass-widget.module.css';
import { GlassWidget } from '../../../components/common/GlassWidget';
import { GlassButton } from '../../../components/ui/GlassButton';
import { GlassTag } from '../../../components/ui/GlassTag';
import { TaskCardLink } from '../../../components/tasks';
import { useModal, useTaskUpdate, useToast } from '../../../context';
import { parseApiErrorMessage } from '../../../utils/parse-api-error';
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
import { EyeIcon } from '../../../components/icons';
import { hexToRgb } from '../../../utils/color';

export const Tree: React.FC<WidgetSizeProps> = ({ colSpan, rowSpan }) => {
  const { openAreaModal, openFolderModal, openTaskModal } = useModal();
  const { notifyTaskUpdate } = useTaskUpdate();
  const { addError } = useToast();

  const [areas, setAreas] = useState<AreaShortCard[]>([]);
  const [foldersByArea, setFoldersByArea] = useState<Map<string, FolderSummary[]>>(new Map());
  const [foldersByParent, setFoldersByParent] = useState<Map<string, FolderSummary[]>>(new Map());
  const [tasksByArea, setTasksByArea] = useState<Map<string, TaskSummary[]>>(new Map());
  const [tasksByFolder, setTasksByFolder] = useState<Map<string, TaskSummary[]>>(new Map());
  const [expandedAreas, setExpandedAreas] = useState<Set<string>>(new Set());
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [loadingContent, setLoadingContent] = useState<Set<string>>(new Set());

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
    const customColorStyle = folder.customColor ? { '--card-custom-color': folder.customColor, '--card-custom-color-rgb': hexToRgb(folder.customColor) } as React.CSSProperties : {};

    return (
      <React.Fragment key={folder.id}>
        <div className={css.folderItem} style={{ marginLeft: `calc(var(--tree-indent) * ${depth})` }}>
          <div
            className={`${css.folderCard} ${isExpanded ? css.expanded : ''}`}
            onClick={() => toggleFolder(folder.id, areaId)}
            data-custom-color={folder.customColor ? 'true' : undefined}
            style={customColorStyle}
          >
            <div className={css.folderContent}>
              <div className={css.folderInfo}>
                <div className={css.folderTitleRow}>
                  <GlassTag variant="subtle" size="xs">
                    {folder.tasksCount + folder.subfoldersCount}
                  </GlassTag>
                  <div className={css.folderTitle}>{folder.title}</div>
                </div>
              </div>
              <div className={css.folderActions}>
                <GlassButton variant="subtle" size="xs" onClick={(e) => handleViewFolderDetails(folder.id, e)}>
                  <EyeIcon />
                </GlassButton>
                <GlassButton variant="subtle" size="xs" onClick={(e) => handleCreateFolderForFolder(folder.id, areaId, e)}>
                  Создать папку
                </GlassButton>
                <GlassButton variant="subtle" size="xs" onClick={(e) => handleCreateTaskForFolder(folder.id, areaId, e)}>
                  Создать задачу
                </GlassButton>
              </div>
            </div>
          </div>
        </div>
        {isExpanded && (
          <div className={css.tasksSection} style={{ marginLeft: `calc(var(--tree-indent) * ${depth + 1})` }}>
            {isLoading ? (
              <div className={glassWidgetStyles.placeholder}>Загрузка...</div>
            ) : (
              <>
                {subfolders.map((sf) => renderFolder(sf, areaId, depth + 1))}
                {tasks.map((task) => {
                  const taskStyle = task.customColor ? { '--card-custom-color': task.customColor, '--card-custom-color-rgb': hexToRgb(task.customColor) } as React.CSSProperties : {};
                  return (
                    <div key={task.id} className={css.taskItem}>
                      <TaskCardLink
                        task={task}
                        onClick={(e) => handleViewTaskDetails(task.id, e)}
                        className={css.taskCard}
                        style={taskStyle}
                        dataCustomColor={!!task.customColor}
                      />
                    </div>
                  );
                })}
                {subfolders.length === 0 && tasks.length === 0 && (
                  <div className={glassWidgetStyles.placeholder}>Пусто</div>
                )}
              </>
            )}
          </div>
        )}
      </React.Fragment>
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
      <div className={css.tree}>
        <div className={css.widgetHeader}>
          <h3 className={css.widgetTitle}>Дерево</h3>
          <GlassButton variant="subtle" size="xs" onClick={handleCreateArea}>
            Создать область
          </GlassButton>
        </div>
        <div className={css.widgetContent}>
          {areas.length === 0 ? (
            <div className={glassWidgetStyles.placeholder}>Нет доступных областей</div>
          ) : (
            areas.map((area) => {
              const isExpanded = expandedAreas.has(area.id);
              const folders = foldersByArea.get(area.id) ?? [];
              const tasks = tasksByArea.get(area.id) ?? [];
              const isLoading = loadingContent.has(`area:${area.id}`);
              const customColorStyle = area.customColor ? { '--card-custom-color': area.customColor, '--card-custom-color-rgb': hexToRgb(area.customColor) } as React.CSSProperties : {};

              return (
                <div key={area.id} className={css.areaSection}>
                  <div
                    className={`${css.areaCard} ${isExpanded ? css.expanded : ''}`}
                    onClick={() => toggleArea(area.id)}
                    data-custom-color={area.customColor ? 'true' : undefined}
                    style={customColorStyle}
                  >
                    <div className={css.areaContent}>
                      <div className={css.areaInfo}>
                        <div className={css.areaTitleRow}>
                          <GlassTag variant="subtle" size="xs">
                            {area.foldersCount + area.rootTasksCount}
                          </GlassTag>
                          <div className={css.areaTitle}>{area.title}</div>
                        </div>
                      </div>
                      <div className={css.areaActions}>
                        <GlassButton variant="subtle" size="xs" onClick={(e) => handleViewAreaDetails(area.id, e)}>
                          <EyeIcon />
                        </GlassButton>
                        <GlassButton variant="subtle" size="xs" onClick={(e) => handleCreateFolderForArea(area.id, e)}>
                          Создать папку
                        </GlassButton>
                        <GlassButton variant="subtle" size="xs" onClick={(e) => handleCreateTaskForArea(area.id, e)}>
                          Создать задачу
                        </GlassButton>
                      </div>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className={css.foldersSection}>
                      {isLoading ? (
                        <div className={glassWidgetStyles.placeholder}>Загрузка...</div>
                      ) : (
                        <>
                          {folders.map((f) => renderFolder(f, area.id, 1))}
                          {tasks.map((task) => {
                            const taskStyle = task.customColor ? { '--card-custom-color': task.customColor, '--card-custom-color-rgb': hexToRgb(task.customColor) } as React.CSSProperties : {};
                            return (
                              <div key={task.id} className={css.taskItem}>
                                <TaskCardLink
                                  task={task}
                                  onClick={(e) => handleViewTaskDetails(task.id, e)}
                                  className={css.taskCard}
                                  style={taskStyle}
                                  dataCustomColor={!!task.customColor}
                                />
                              </div>
                            );
                          })}
                          {folders.length === 0 && tasks.length === 0 && (
                            <div className={glassWidgetStyles.placeholder}>Нет папок и задач</div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </GlassWidget>
  );
};
