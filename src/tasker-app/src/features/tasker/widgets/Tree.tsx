import React, { useState, useEffect } from 'react';
import glassWidgetStyles from '../../../styles/glass-widget.module.css';
import { GlassWidget } from '../../../components/common/GlassWidget';
import { GlassButton } from '../../../components/ui/GlassButton';
import { GlassTag } from '../../../components/ui/GlassTag';
import { TaskStatusBadge } from '../../../components/ui/TaskStatusBadge';
import { useModal, useTaskUpdate } from '../../../context';
import type { 
  WidgetSizeProps, 
  AreaShortCard, 
  GroupSummary,
  TaskSummary,
  AreaCreateRequest, 
  AreaUpdateRequest, 
  GroupCreateRequest, 
  GroupUpdateRequest,
  TaskCreateRequest,
  TaskUpdateRequest,
  TaskStatus
} from '../../../types';
import { 
  fetchAreaShortCard, 
  fetchAreaById, 
  createArea, 
  updateArea,
  deleteArea,
  fetchGroupShortCardByAreaForTree, 
  fetchGroupById, 
  createGroup, 
  updateGroup,
  deleteGroup,
  fetchTaskSummaryByGroup,
  fetchTaskById,
  createTask,
  updateTask,
  deleteTask
} from '../../../services/api';
import css from '../../../styles/tree.module.css';
import { EyeIcon } from '../../../components/icons';
import { hexToRgb } from '../../../utils/color';

export const Tree: React.FC<WidgetSizeProps> = ({ colSpan, rowSpan }) => {
  const { openAreaModal, openGroupModal, openTaskModal } = useModal();
  const { notifyTaskUpdate } = useTaskUpdate();
  const [areas, setAreas] = useState<AreaShortCard[]>([]);
  const [groupsByArea, setGroupsByArea] = useState<Map<string, GroupSummary[]>>(new Map());
  const [tasksByGroup, setTasksByGroup] = useState<Map<string, TaskSummary[]>>(new Map());
  const [expandedAreas, setExpandedAreas] = useState<Set<string>>(new Set());
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [loadingGroups, setLoadingGroups] = useState<Set<string>>(new Set());
  const [loadingTasks, setLoadingTasks] = useState<Set<string>>(new Set());


  useEffect(() => {
    const loadAreas = async () => {
      try {
        setLoading(true);
        const data = await fetchAreaShortCard();
        setAreas(data);
      } catch (error) {
        console.error('Ошибка загрузки областей:', error);
        setAreas([]);
      } finally {
        setLoading(false);
      }
    };

    loadAreas();
  }, []);

  const toggleArea = async (areaId: string) => {
    setExpandedAreas(prev => {
      const newSet = new Set(prev);
      if (newSet.has(areaId)) {
        newSet.delete(areaId);
      } else {
        newSet.add(areaId);
        // Загружаем группы для области, если их еще нет
        if (!groupsByArea.has(areaId)) {
          loadGroupsForArea(areaId);
        }
      }
      return newSet;
    });
  };

  const loadGroupsForArea = async (areaId: string) => {
    try {
      setLoadingGroups(prev => new Set(prev).add(areaId));
      const groups = await fetchGroupShortCardByAreaForTree(areaId);
      setGroupsByArea(prev => new Map(prev).set(areaId, groups));
    } catch (error) {
      console.error(`Ошибка загрузки групп для области ${areaId}:`, error);
      setGroupsByArea(prev => new Map(prev).set(areaId, []));
    } finally {
      setLoadingGroups(prev => {
        const newSet = new Set(prev);
        newSet.delete(areaId);
        return newSet;
      });
    }
  };

  const toggleGroup = async (groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
        // Загружаем задачи для группы, если их еще нет
        if (!tasksByGroup.has(groupId)) {
          loadTasksForGroup(groupId);
        }
      }
      return newSet;
    });
  };

  const loadTasksForGroup = async (groupId: string) => {
    try {
      setLoadingTasks(prev => new Set(prev).add(groupId));
      const tasks = await fetchTaskSummaryByGroup(groupId);
      setTasksByGroup(prev => new Map(prev).set(groupId, tasks));
    } catch (error) {
      console.error(`Ошибка загрузки задач для группы ${groupId}:`, error);
      setTasksByGroup(prev => new Map(prev).set(groupId, []));
    } finally {
      setLoadingTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(groupId);
        return newSet;
      });
    }
  };

  // Обработчики для областей
  const handleCreateArea = () => {
    openAreaModal(null, 'create', handleAreaSave);
  };

  const handleViewAreaDetails = async (areaId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      const area = await fetchAreaById(areaId);
      if (area) {
        openAreaModal(area, 'edit', handleAreaSave, handleAreaDelete);
      }
    } catch (error) {
      console.error('Ошибка загрузки области:', error);
    }
  };

  const handleCreateGroupForArea = (areaId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const areasForModal = areas.map(area => ({
      id: area.id,
      title: area.title,
      description: area.description,
      ownerUserId: '',
      createdAt: new Date(0),
      updatedAt: new Date(0),
      isActive: true,
    }));
    openGroupModal(null, 'create', areasForModal, (data, groupId) => handleGroupSave(data, groupId), undefined, areaId);
  };

  const handleCreateTaskForGroup = (groupId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    // Находим область, к которой принадлежит группа
    let targetAreaId = '';
    for (const [areaId, groups] of Array.from(groupsByArea.entries())) {
      if (groups.some((group: GroupSummary) => group.id === groupId)) {
        targetAreaId = areaId;
        break;
      }
    }
    
    // Показываем только группы из той же области
    const groupsForModal = targetAreaId 
      ? (groupsByArea.get(targetAreaId) || []).map(group => ({
          id: group.id,
          title: group.title,
          description: group.description,
          areaId: group.areaId,
          ownerUserId: '',
          createdAt: new Date(0),
          updatedAt: new Date(0),
          isActive: true,
        }))
      : [];
      
    const areasForTaskModal = areas.map(a => ({ id: a.id, title: a.title }));
    openTaskModal(null, 'create', groupsForModal, (data, taskId) => handleTaskSave(data, taskId), undefined, groupId, targetAreaId, areasForTaskModal);
  };

  // Обработчики для групп
  const handleViewGroupDetails = async (groupId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      const group = await fetchGroupById(groupId);
      if (group) {
        const areasForModal = areas.map(area => ({
          id: area.id,
          title: area.title,
          description: area.description,
          ownerUserId: '',
          createdAt: new Date(0),
          updatedAt: new Date(0),
          isActive: true,
        }));
        openGroupModal(group, 'edit', areasForModal, (data, groupId) => handleGroupSave(data, groupId), handleGroupDelete);
      }
    } catch (error) {
      console.error('Ошибка загрузки группы:', error);
    }
  };

  // Обработчики для задач
  const handleViewTaskDetails = async (taskId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      const task = await fetchTaskById(taskId);
      if (task) {
        // Находим область, к которой принадлежит группа задачи
        let targetAreaId = '';
        for (const [areaId, groups] of Array.from(groupsByArea.entries())) {
          if (groups.some((group: GroupSummary) => group.id === task.groupId)) {
            targetAreaId = areaId;
            break;
          }
        }
        
        // Показываем только группы из той же области
        const groupsForModal = targetAreaId 
          ? (groupsByArea.get(targetAreaId) || []).map(group => ({
              id: group.id,
              title: group.title,
              description: group.description,
              areaId: group.areaId,
              ownerUserId: '',
              createdAt: new Date(0),
              updatedAt: new Date(0),
              isActive: true,
            }))
          : [];
          
        const areasForTaskModal = areas.map(a => ({ id: a.id, title: a.title }));
        openTaskModal(task, 'edit', groupsForModal, (data, taskId) => handleTaskSave(data, taskId), handleTaskDelete, undefined, undefined, areasForTaskModal);
      }
    } catch (error) {
      console.error('Ошибка загрузки задачи:', error);
    }
  };

  // Обработчики удаления
  const handleAreaDelete = async (id: string) => {
    try {
      await deleteArea(id);
      const updatedAreas = await fetchAreaShortCard();
      setAreas(updatedAreas);
      setGroupsByArea(prev => {
        const next = new Map(prev);
        next.delete(id);
        return next;
      });
    } catch (error) {
      console.error('Ошибка удаления области:', error);
      throw error;
    }
  };

  const handleGroupDelete = async (id: string) => {
    try {
      const group = await fetchGroupById(id);
      const areaId = group?.areaId;
      await deleteGroup(id);
      if (areaId) {
        const updatedGroups = await fetchGroupShortCardByAreaForTree(areaId);
        setGroupsByArea(prev => new Map(prev).set(areaId, updatedGroups));
        setAreas(prev => prev.map(area =>
          area.id === areaId ? { ...area, groupsCount: updatedGroups.length } : area
        ));
      }
      setTasksByGroup(prev => {
        const next = new Map(prev);
        next.delete(id);
        return next;
      });
    } catch (error) {
      console.error('Ошибка удаления группы:', error);
      throw error;
    }
  };

  const handleTaskDelete = async (id: string) => {
    try {
      const task = await fetchTaskById(id);
      const groupId = task?.groupId;
      await deleteTask(id);
      if (groupId) {
        const updatedTasks = await fetchTaskSummaryByGroup(groupId);
        setTasksByGroup(prev => new Map(prev).set(groupId, updatedTasks));
        setGroupsByArea(prev => {
          const newMap = new Map<string, GroupSummary[]>();
          prev.forEach((groups, areaId) => {
            const updatedGroups = groups.map((g: GroupSummary) =>
              g.id === groupId ? { ...g, tasksCount: updatedTasks.length } : g
            );
            newMap.set(areaId, updatedGroups);
          });
          return newMap;
        });
      }
      notifyTaskUpdate(id, groupId);
    } catch (error) {
      console.error('Ошибка удаления задачи:', error);
      throw error;
    }
  };

  // Обработчики сохранения
  const handleAreaSave = async (data: AreaCreateRequest | (AreaUpdateRequest & { id?: string })) => {
    try {
      const dataWithId = data as { id?: string } & AreaCreateRequest;
      const isCreate = !dataWithId.id;
      
      if (isCreate) {
        await createArea(data as AreaCreateRequest);
      } else {
        await updateArea(dataWithId.id!, data as AreaUpdateRequest);
      }
      
      // Перезагружаем список областей
      const updatedAreas = await fetchAreaShortCard();
      setAreas(updatedAreas);
    } catch (error) {
      console.error('Ошибка сохранения области:', error);
      throw error;
    }
  };

  const handleGroupSave = async (data: GroupCreateRequest | GroupUpdateRequest, groupId?: string) => {
    try {
      // Определяем режим по наличию groupId
      const isCreate = !groupId;
      
      if (isCreate) {
        await createGroup(data as GroupCreateRequest);
        // Перезагружаем группы для соответствующей области
        const areaId = data.areaId;
        if (areaId) {
          const updatedGroups = await fetchGroupShortCardByAreaForTree(areaId);
          setGroupsByArea(prev => new Map(prev).set(areaId, updatedGroups));
          
          // Обновляем счетчик групп в карточке области
          setAreas(prev => prev.map(area => 
            area.id === areaId 
              ? { ...area, groupsCount: updatedGroups.length }
              : area
          ));
        }
      } else {
        // Получаем текущую группу для определения старой области
        const currentGroup = await fetchGroupById(groupId);
        const oldAreaId = currentGroup?.areaId;
        
        await updateGroup(groupId, data as GroupUpdateRequest);
        
        // Перезагружаем группы для новой области
        const newAreaId = data.areaId;
        if (newAreaId) {
          const updatedGroups = await fetchGroupShortCardByAreaForTree(newAreaId);
          setGroupsByArea(prev => new Map(prev).set(newAreaId, updatedGroups));
          
          // Обновляем счетчик групп в карточке новой области
          setAreas(prev => prev.map(area => 
            area.id === newAreaId 
              ? { ...area, groupsCount: updatedGroups.length }
              : area
          ));
        }
        
        // Перезагружаем группы для старой области, если она отличается от новой
        if (oldAreaId && oldAreaId !== newAreaId) {
          const updatedOldGroups = await fetchGroupShortCardByAreaForTree(oldAreaId);
          setGroupsByArea(prev => new Map(prev).set(oldAreaId, updatedOldGroups));
          
          // Обновляем счетчик групп в карточке старой области
          setAreas(prev => prev.map(area => 
            area.id === oldAreaId 
              ? { ...area, groupsCount: updatedOldGroups.length }
              : area
          ));
        }
      }
    } catch (error) {
      console.error('Ошибка сохранения группы:', error);
      throw error;
    }
  };

  const handleTaskSave = async (data: TaskCreateRequest | TaskUpdateRequest, taskId?: string) => {
    try {
      // Определяем режим по наличию taskId
      const isCreate = !taskId;
      
      if (isCreate) {
        await createTask(data as TaskCreateRequest);
        // Перезагружаем задачи для соответствующей группы
        const groupId = data.groupId;
        if (groupId) {
          const updatedTasks = await fetchTaskSummaryByGroup(groupId);
          setTasksByGroup(prev => new Map(prev).set(groupId, updatedTasks));
          
          // Обновляем счетчик задач в карточке группы
          setGroupsByArea(prev => {
            const newMap = new Map(prev);
            newMap.forEach((groups, areaId) => {
              const updatedGroups = groups.map((group: GroupSummary) => 
                group.id === groupId 
                  ? { ...group, tasksCount: updatedTasks.length }
                  : group
              );
              newMap.set(areaId, updatedGroups);
            });
            return newMap;
          });
        }
        
        // Уведомляем об обновлении задачи
        notifyTaskUpdate(undefined, data.groupId);
      } else {
        // Получаем текущую задачу для определения старой группы
        const currentTask = await fetchTaskById(taskId);
        const oldGroupId = currentTask?.groupId;
        await updateTask(taskId, data as TaskUpdateRequest);
        
        // Перезагружаем задачи для новой группы
        const newGroupId = data.groupId;
        if (newGroupId) {
          const updatedTasks = await fetchTaskSummaryByGroup(newGroupId);
          setTasksByGroup(prev => new Map(prev).set(newGroupId, updatedTasks));
          
          // Обновляем счетчик задач в карточке новой группы
          setGroupsByArea(prev => {
            const newMap = new Map(prev);
            newMap.forEach((groups, areaId) => {
              const updatedGroups = groups.map((group: GroupSummary) => 
                group.id === newGroupId 
                  ? { ...group, tasksCount: updatedTasks.length }
                  : group
              );
              newMap.set(areaId, updatedGroups);
            });
            return newMap;
          });
        }
        
        // Перезагружаем задачи для старой группы, если она отличается от новой
        if (oldGroupId && oldGroupId !== newGroupId) {
          const updatedOldTasks = await fetchTaskSummaryByGroup(oldGroupId);
          setTasksByGroup(prev => new Map(prev).set(oldGroupId, updatedOldTasks));
          
          // Обновляем счетчик задач в карточке старой группы
          setGroupsByArea(prev => {
            const newMap = new Map(prev);
            newMap.forEach((groups, areaId) => {
              const updatedGroups = groups.map((group: GroupSummary) => 
                group.id === oldGroupId 
                  ? { ...group, tasksCount: updatedOldTasks.length }
                  : group
              );
              newMap.set(areaId, updatedGroups);
            });
            return newMap;
          });
        }
        
        // Уведомляем об обновлении задачи
        notifyTaskUpdate(taskId, data.groupId);
      }
    } catch (error) {
      console.error('Ошибка сохранения задачи:', error);
      throw error;
    }
  };



  if (loading) {
    return (
      <GlassWidget title="Иерархия областей и групп" colSpan={colSpan} rowSpan={rowSpan}>
        <div className={glassWidgetStyles.placeholder}>Загрузка...</div>
      </GlassWidget>
    );
  }

  return (
    <GlassWidget colSpan={colSpan} rowSpan={rowSpan}>
      <div className={css.tree}>
        <div className={css.widgetHeader}>
          <h3 className={css.widgetTitle}>Дерево</h3>
          <GlassButton 
            variant="subtle"
            size="xs"
            onClick={handleCreateArea}
          >
            Cоздать область
          </GlassButton>
        </div>

        <div className={css.widgetContent}>
          {areas.length === 0 ? (
            <div className={glassWidgetStyles.placeholder}>
              Нет доступных областей
            </div>
          ) : (
            areas.map((area) => {
              const customColorStyle = area.customColor ? {
                '--card-custom-color': area.customColor,
                '--card-custom-color-rgb': hexToRgb(area.customColor)
              } as React.CSSProperties : {};
              
              return (
              <div key={area.id} className={css.areaSection}>
                <div 
                  className={`${css.areaCard} ${expandedAreas.has(area.id) ? css.expanded : ''}`}
                  onClick={() => toggleArea(area.id)}
                  data-custom-color={area.customColor ? 'true' : undefined}
                  style={customColorStyle}
                >
                <div className={css.areaContent}>
                  <div className={css.areaInfo}>
                    <div className={css.areaTitleRow}>
                      <GlassTag 
                        variant="subtle" 
                        size="xs"
                      >
                        {area.groupsCount}
                      </GlassTag>
                      <div className={css.areaTitle}>{area.title}</div>
                    </div>
                  </div>
                  <div className={css.areaActions}>
                    <GlassButton 
                      variant="subtle"
                      size="xs"
                      onClick={(e: React.MouseEvent) => handleViewAreaDetails(area.id, e)}
                    >
                      <EyeIcon />
                    </GlassButton>
                    <GlassButton 
                      variant="subtle"
                      size="xs"
                      onClick={(e: React.MouseEvent) => handleCreateGroupForArea(area.id, e)}
                    >
                      Cоздать группу
                    </GlassButton>
                  </div>
                </div>
              </div>
              
              {expandedAreas.has(area.id) && (
                <div className={css.groupsSection}>
                  {loadingGroups.has(area.id) ? (
                    <div className={glassWidgetStyles.placeholder}>Загрузка групп...</div>
                  ) : (
                    (() => {
                      const groups = groupsByArea.get(area.id) || [];
                      return groups.length === 0 ? (
                        <div className={glassWidgetStyles.placeholder}>Нет групп в этой области</div>
                      ) : (
                        groups.map((group) => {
                          const groupCustomColorStyle = group.customColor ? {
                            '--card-custom-color': group.customColor,
                            '--card-custom-color-rgb': hexToRgb(group.customColor)
                          } as React.CSSProperties : {};
                          
                          return (
                          <React.Fragment key={group.id}>
                            <div className={css.groupItem}>
                              <div 
                                className={`${css.groupCard} ${expandedGroups.has(group.id) ? css.expanded : ''}`}
                                onClick={() => toggleGroup(group.id)}
                                data-custom-color={group.customColor ? 'true' : undefined}
                                style={groupCustomColorStyle}
                              >
                                <div className={css.groupContent}>
                                  <div className={css.groupInfo}>
                                    <div className={css.groupTitleRow}>
                                      <GlassTag 
                                        variant="subtle" 
                                        size="xs"
                                      >
                                        {group.tasksCount}
                                      </GlassTag>
                                      <div className={css.groupTitle}>{group.title}</div>
                                    </div>
                                  </div>
                                  <div className={css.groupActions}>
                                    <GlassButton 
                                      variant="subtle"
                                      size="xs"
                                      onClick={(e: React.MouseEvent) => handleViewGroupDetails(group.id, e)}
                                    >
                                      <EyeIcon />
                                    </GlassButton>
                                    <GlassButton 
                                      variant="subtle"
                                      size="xs"
                                      onClick={(e: React.MouseEvent) => handleCreateTaskForGroup(group.id, e)}
                                    >
                                      Cоздать задачу
                                    </GlassButton>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {expandedGroups.has(group.id) && (
                              <div className={css.tasksSection}>
                                {loadingTasks.has(group.id) ? (
                                  <div className={glassWidgetStyles.placeholder}>Загрузка задач...</div>
                                ) : (
                                  (() => {
                                    const tasks = tasksByGroup.get(group.id) || [];
                                    return tasks.length === 0 ? (
                                      <div className={glassWidgetStyles.placeholder}>Нет задач в этой группе</div>
                                    ) : (
                                      tasks.map((task) => {
                                        const taskCustomColorStyle = task.customColor ? {
                                          '--card-custom-color': task.customColor,
                                          '--card-custom-color-rgb': hexToRgb(task.customColor)
                                        } as React.CSSProperties : {};
                                        
                                        return (
                                        <div key={task.id} className={css.taskItem}>
                                          <div 
                                            className={css.taskCard}
                                            data-custom-color={task.customColor ? 'true' : undefined}
                                            style={taskCustomColorStyle}
                                          >
                                            <div className={css.taskContent}>
                                              <div className={css.taskInfo}>
                                                <div className={css.taskTitleRow}>
                                                  <div className={css.taskTitle}>{task.title}</div>
                                                  <TaskStatusBadge
                                                    status={task.status as TaskStatus}
                                                    size="xs"
                                                    variant="compact"
                                                  />
                                                </div>
                                              </div>
                                              <div className={css.taskActions}>
                                                <GlassButton 
                                                  variant="subtle"
                                                  size="xs"
                                                  onClick={(e: React.MouseEvent) => handleViewTaskDetails(task.id, e)}
                                                >
                                                  <EyeIcon />
                                                </GlassButton>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                        );
                                      })
                                    );
                                  })()
                                )}
                              </div>
                            )}
                          </React.Fragment>
                          );
                        })
                      );
                    })()
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
