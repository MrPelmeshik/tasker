import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { GlassWidget, GlassButton, GlassTag, TaskStatusBadge, Tooltip } from '../../../components';
import { EyeIcon } from '../../../components/icons';
import type { WidgetSizeProps } from '../../../types';
import type { TaskResponse, TaskUpdateRequest } from '../../../types/api';
import { TaskStatus } from '../../../types/task-status';
import css from '../../../styles/task-table.module.css';
import {
  fetchTasksWithActivities,
  buildTaskWithActivitiesFilter,
  dateRangeFromWeek,
  fetchTaskById,
  fetchGroupById,
  fetchGroupsByArea,
  fetchAreaShortCard,
  updateTask,
  deleteTask,
  createEventForTask,
  EventTypeActivity,
  type TaskDayActivity,
} from '../../../services/api';
import { useModal, useTaskUpdate, useToast } from '../../../context';
import { useWeek } from '../../../hooks';
import { parseApiErrorMessage } from '../../../utils/parse-api-error';
import { formatDateOnly } from '../../../utils/date';
import { buildWeekDays, getWeekEndIso } from '../../../utils/week';

/** Минимальные данные задачи для строки (полная задача — через fetchTaskById) */
type TaskRowTask = Pick<TaskResponse, 'id' | 'groupId' | 'title' | 'status'>;

/** Строка таблицы: задача + активность по дням */
type TaskRow = {
  taskId: string;
  taskName: string;
  carryWeeks: number;
  hasFutureActivities: boolean;
  days: TaskDayActivity[];
  task: TaskRowTask;
};

function intensityClass(count: number): string {
  if (count <= 0) return css.intensity0;
  if (count <= 2) return css.intensity1;
  if (count <= 4) return css.intensity2;
  if (count <= 6) return css.intensity3;
  if (count <= 9) return css.intensity4;
  return css.intensity5;
}

export const TaskTable: React.FC<WidgetSizeProps> = ({ colSpan, rowSpan }) => {
  const { weekStartIso, go } = useWeek();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<TaskRow[]>([]);
  const { openTaskModal, openActivityModal, closeActivityModal } = useModal();
  const { subscribeToTaskUpdates, notifyTaskUpdate } = useTaskUpdate();
  const { addError } = useToast();

  const loadData = useCallback(async () => {
    let alive = true;
    setLoading(true);
    try {
      const filter = buildTaskWithActivitiesFilter({
        ...dateRangeFromWeek(weekStartIso),
        statuses: [TaskStatus.InProgress, TaskStatus.Pending],
        includeTasksWithActivitiesInRange: true,
      });
      const res = await fetchTasksWithActivities(filter);
      if (!alive) return;

      const merged: TaskRow[] = res.items.map(item => ({
        taskId: item.taskId,
        taskName: item.taskName,
        carryWeeks: item.carryWeeks,
        hasFutureActivities: item.hasFutureActivities,
        days: item.days,
        task: {
          id: item.taskId,
          groupId: item.groupId,
          title: item.taskName,
          status: item.status,
        },
      }));

      setRows(merged);
    } catch (error) {
      console.error('Ошибка загрузки задач:', error);
      if (alive) {
        setRows([]);
        addError(parseApiErrorMessage(error));
      }
    } finally {
      if (alive) setLoading(false);
    }
    return () => { alive = false; };
  }, [weekStartIso, addError]);

  const handleActivitySaveForTask = useCallback(
    (task: TaskResponse) => async (data: { title: string; description: string; date: string }) => {
      await createEventForTask({
        entityId: task.id,
        title: data.title,
        description: data.description || undefined,
        eventType: EventTypeActivity,
        eventDate: data.date,
      });
      await loadData();
      notifyTaskUpdate(task.id, task.groupId);
    },
    [loadData, notifyTaskUpdate]
  );

  const handleTaskSave = useCallback(async (data: TaskUpdateRequest, taskId?: string) => {
    if (!taskId) return;
    try {
      await updateTask(taskId, data);
      await loadData();
      notifyTaskUpdate(taskId, data.groupId);
    } catch (error) {
      console.error('Ошибка сохранения задачи:', error);
      throw error;
    }
  }, [loadData, notifyTaskUpdate]);

  const handleTaskDelete = useCallback(async (id: string) => {
    try {
      await deleteTask(id);
      await loadData();
      notifyTaskUpdate(id, undefined);
    } catch (error) {
      console.error('Ошибка удаления задачи:', error);
      throw error;
    }
  }, [loadData, notifyTaskUpdate]);

  const handleDayCellClick = useCallback(
    (task: TaskRowTask, date: string, event: React.MouseEvent) => {
      event.stopPropagation();
      const onOpenTaskDetails = async () => {
        closeActivityModal();
        try {
          const fullTask = await fetchTaskById(task.id);
          if (!fullTask) return;
          const group = await fetchGroupById(fullTask.groupId);
          if (!group) return;
          const [groupsForModal, areasData] = await Promise.all([
            fetchGroupsByArea(group.areaId),
            fetchAreaShortCard(),
          ]);
          const areasForTaskModal = areasData.map(a => ({ id: a.id, title: a.title }));
          openTaskModal(fullTask, 'edit', groupsForModal, (data, id) => handleTaskSave(data as TaskUpdateRequest, id), handleTaskDelete, undefined, undefined, areasForTaskModal);
        } catch (error) {
          console.error('Ошибка загрузки задачи:', error);
          addError(parseApiErrorMessage(error));
        }
      };
      openActivityModal(task as TaskResponse, date, handleActivitySaveForTask(task as TaskResponse), onOpenTaskDetails);
    },
    [openActivityModal, closeActivityModal, openTaskModal, handleTaskSave, handleTaskDelete, handleActivitySaveForTask, addError]
  );

  const handleViewTaskDetails = useCallback(async (taskId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      const task = await fetchTaskById(taskId);
      if (!task) return;
      const group = await fetchGroupById(task.groupId);
      if (!group) return;
      const [groupsForModal, areasData] = await Promise.all([
        fetchGroupsByArea(group.areaId),
        fetchAreaShortCard(),
      ]);
      const areasForTaskModal = areasData.map(a => ({ id: a.id, title: a.title }));
      openTaskModal(task, 'edit', groupsForModal, (data, id) => handleTaskSave(data as TaskUpdateRequest, id), handleTaskDelete, undefined, undefined, areasForTaskModal);
    } catch (error) {
      console.error('Ошибка загрузки задачи:', error);
      addError(parseApiErrorMessage(error));
    }
  }, [openTaskModal, handleTaskSave, handleTaskDelete, addError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const unsubscribe = subscribeToTaskUpdates(() => loadData());
    return unsubscribe;
  }, [subscribeToTaskUpdates, loadData]);

  const daysHeader = useMemo(() => buildWeekDays(weekStartIso), [weekStartIso]);
  const dateRangeLabel = useMemo(
    () => `${formatDateOnly(weekStartIso)} – ${formatDateOnly(getWeekEndIso(weekStartIso))}`,
    [weekStartIso]
  );

  return (
    <GlassWidget colSpan={colSpan} rowSpan={rowSpan}>
      <div className={css.container}>
        <div className={css.toolbar}>
          <span className={css.weekLabel}>Неделя</span>
          <GlassButton size="s" variant="subtle" onClick={() => go('prev')}>Предыдущая</GlassButton>
          <GlassButton size="s" variant="subtle" onClick={() => go('current')}>Текущая</GlassButton>
          <GlassButton size="s" variant="subtle" onClick={() => go('next')}>Следующая</GlassButton>
          <div className={css.spacer} />
          <span className={css.muted}>{dateRangeLabel}</span>
        </div>
        <table className={css.table}>
          <thead className={css.thead}>
            <tr>
              <th className={`${css.th} ${css.colCarry}`} />
              {daysHeader.map((d, i) => (
                <th key={i} className={`${css.th} ${css.colDay}`}>
                  <Tooltip content={`${d.weekdayLong}, ${d.date}`} placement="bottom" size="s">
                    <span>{d.label}</span>
                  </Tooltip>
                </th>
              ))}
              <th className={`${css.th} ${css.colFuture}`} />
              <th className={`${css.th} ${css.colTask}`}>Задача</th>
            </tr>
          </thead>
        </table>
        <div className={css.gridWrapper}>
          <table className={css.table}>
            <tbody>
              {loading && (
                <tr>
                  <td className={css.td} colSpan={10}>Загрузка…</td>
                </tr>
              )}
              {!loading && rows.map(row => (
                <tr key={row.taskId}>
                  <td className={`${css.td} ${css.colCarry}`}>
                    {row.carryWeeks > 0 ? (
                      <Tooltip content="Есть активности в прошлых неделях" placement="bottom" size="s">
                        <GlassTag variant="subtle" size="xs">←</GlassTag>
                      </Tooltip>
                    ) : null}
                  </td>
                  {row.days.map(day => (
                    <td
                      key={day.date}
                      className={`${css.td} ${css.colDay} ${css.colDayClickable}`}
                      onClick={(e) => handleDayCellClick(row.task, day.date, e)}
                    >
                      {day.count > 0 ? (
                        <Tooltip content={String(day.count)} placement="bottom" size="s">
                          <span className={`${css.heatCell} ${intensityClass(day.count)}`} />
                        </Tooltip>
                      ) : (
                        <span className={css.heatCellPlaceholder} />
                      )}
                    </td>
                  ))}
                  <td className={`${css.td} ${css.colFuture}`}>
                    {row.hasFutureActivities ? (
                      <Tooltip content="Есть активности в будущих неделях" placement="bottom" size="s">
                        <GlassTag variant="subtle" size="xs">→</GlassTag>
                      </Tooltip>
                    ) : null}
                  </td>
                  <td className={`${css.td} ${css.colTask}`}>
                    <div className={css.taskCell}>
                      <GlassButton
                        size="xxs"
                        variant="subtle"
                        onClick={(e: React.MouseEvent) => handleViewTaskDetails(row.taskId, e)}
                        className={css.taskButton}
                      >
                        <EyeIcon />
                      </GlassButton>
                      <TaskStatusBadge
                        status={(row.task.status ?? TaskStatus.InProgress) as TaskStatus}
                        size="xs"
                        variant="compact"
                      />
                      <span>{row.taskName}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </GlassWidget>
  );
};
