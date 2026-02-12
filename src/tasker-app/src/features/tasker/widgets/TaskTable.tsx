import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { GlassWidget, GlassButton, GlassTag, TaskStatusBadge, Tooltip } from '../../../components';
import { EyeIcon } from '../../../components/icons';
import type { WidgetSizeProps } from '../../../types';
import type { TaskResponse, TaskUpdateRequest } from '../../../types/api';
import { TaskStatus } from '../../../types/task-status';
import css from '../../../styles/task-table.module.css';
import {
  fetchTasks,
  fetchWeeklyTasks,
  fetchTaskById,
  fetchGroupById,
  fetchGroupsByArea,
  updateTask,
  deleteTask,
  createEventForTask,
  EventTypeActivity,
  getMondayIso,
  type TaskWeeklyActivity,
  type TaskDayActivity,
} from '../../../services/api';
import { useModal, useTaskUpdate } from '../../../context';
import { formatDateOnly } from '../../../utils/date';

type WeekNav = 'prev' | 'next' | 'current' | 'latest';

/** Строка таблицы: задача + активность по дням */
type TaskRow = {
  taskId: string;
  taskName: string;
  carryWeeks: number;
  hasFutureActivities: boolean;
  days: TaskDayActivity[];
  task: TaskResponse;
};

function useWeek(): { weekStartIso: string; go: (nav: WeekNav) => void; set: (iso: string) => void } {
  const [weekStartIso, setWeekStartIso] = useState(() => getMondayIso(new Date()));

  const go = (nav: WeekNav) => {
    if (nav === 'current' || nav === 'latest') return setWeekStartIso(getMondayIso(new Date()));
    const base = new Date(weekStartIso + 'T12:00:00');
    base.setDate(base.getDate() + (nav === 'prev' ? -7 : 7));
    setWeekStartIso(getMondayIso(base));
  };

  return { weekStartIso, go, set: setWeekStartIso };
}

/** Данные для заголовков дней недели (label — краткое, weekdayLong — полное для подсказки) */
function buildWeekDays(isoMonday: string): { label: string; weekdayLong: string; date: string }[] {
  const base = new Date(isoMonday + 'T00:00:00Z');
  const weekdayFmt = new Intl.DateTimeFormat('ru-RU', { weekday: 'short' });
  const weekdayLongFmt = new Intl.DateTimeFormat('ru-RU', { weekday: 'long' });
  const dateFmt = new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base);
    d.setUTCDate(d.getUTCDate() + i);
    const weekday = weekdayFmt.format(d);
    const weekdayLong = weekdayLongFmt.format(d);
    const date = dateFmt.format(d);
    return { label: weekday, weekdayLong, date };
  });
}

/** ISO-дата конца недели (понедельник + 6 дней) */
function getWeekEndIso(isoMonday: string): string {
  const base = new Date(isoMonday + 'T00:00:00Z');
  base.setUTCDate(base.getUTCDate() + 6);
  return base.toISOString().slice(0, 10);
}

/** 7 ISO-дат для выбранной недели */
function buildWeekDates(isoMonday: string): string[] {
  const base = new Date(isoMonday + 'T00:00:00Z');
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base);
    d.setUTCDate(d.getUTCDate() + i);
    return d.toISOString().slice(0, 10);
  });
}

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

  const loadData = useCallback(async () => {
    let alive = true;
    setLoading(true);
    try {
      const [tasksRes, weeklyRes] = await Promise.all([
        fetchTasks(),
        fetchWeeklyTasks({ weekStartIso }),
      ]);
      if (!alive) return;

      const inProgressTasks = tasksRes.filter(t => t.status === TaskStatus.InProgress);
      const weeklyByTaskId = new Map<string, TaskWeeklyActivity>();
      weeklyRes.forEach(a => weeklyByTaskId.set(a.taskId, a));

      const weekDates = buildWeekDates(weekStartIso);
      const merged: TaskRow[] = inProgressTasks.map(task => {
        const activity = weeklyByTaskId.get(task.id);
        const daysMap = activity ? new Map(activity.days.map(d => [d.date, d.count])) : null;
        const days: TaskDayActivity[] = weekDates.map(date => ({
          date,
          count: daysMap?.get(date) ?? 0,
        }));
        return {
          taskId: task.id,
          taskName: task.title,
          carryWeeks: activity?.carryWeeks ?? 0,
          hasFutureActivities: activity?.hasFutureActivities ?? false,
          days,
          task,
        };
      });

      setRows(merged);
    } catch (error) {
      console.error('Ошибка загрузки задач:', error);
      if (alive) setRows([]);
    } finally {
      if (alive) setLoading(false);
    }
    return () => { alive = false; };
  }, [weekStartIso]);

  const handleActivitySaveForTask = useCallback(
    (task: TaskResponse) => async (data: { title: string; description: string }) => {
      await createEventForTask({
        entityId: task.id,
        title: data.title,
        description: data.description || undefined,
        eventType: EventTypeActivity,
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
    (task: TaskResponse, date: string, event: React.MouseEvent) => {
      event.stopPropagation();
      const onOpenTaskDetails = async () => {
        closeActivityModal();
        try {
          const group = await fetchGroupById(task.groupId);
          if (!group) return;
          const groupsForModal = await fetchGroupsByArea(group.areaId);
          openTaskModal(task, 'edit', groupsForModal, (data, id) => handleTaskSave(data as TaskUpdateRequest, id), handleTaskDelete);
        } catch (error) {
          console.error('Ошибка загрузки задачи:', error);
        }
      };
      openActivityModal(task, date, handleActivitySaveForTask(task), onOpenTaskDetails);
    },
    [openActivityModal, closeActivityModal, openTaskModal, handleTaskSave, handleTaskDelete, handleActivitySaveForTask]
  );

  const handleViewTaskDetails = useCallback(async (taskId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      const task = await fetchTaskById(taskId);
      if (!task) return;
      const group = await fetchGroupById(task.groupId);
      if (!group) return;
      const groupsForModal = await fetchGroupsByArea(group.areaId);
      openTaskModal(task, 'edit', groupsForModal, (data, id) => handleTaskSave(data as TaskUpdateRequest, id), handleTaskDelete);
    } catch (error) {
      console.error('Ошибка загрузки задачи:', error);
    }
  }, [openTaskModal, handleTaskSave, handleTaskDelete]);

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
