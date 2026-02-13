import React, { useMemo } from 'react';
import { GlassWidget, GlassButton, GlassTag, Tooltip } from '../../../../components';
import { TaskCardLink } from '../../../../components/tasks';
import type { WidgetSizeProps } from '../../../../types';
import { useModal, useTaskUpdate, useToast } from '../../../../context';
import { useWeek } from '../../../../hooks';
import { formatDateOnly } from '../../../../utils/date';
import { buildWeekDays, getWeekEndIso } from '../../../../utils/week';
import { intensityClass } from './taskTableUtils';
import { useTaskTableData } from './useTaskTableData';
import { useTaskTableHandlers } from './useTaskTableHandlers';
import css from '../../../../styles/task-table.module.css';

export const TaskTable: React.FC<WidgetSizeProps> = ({ colSpan, rowSpan }) => {
  const { weekStartIso, go } = useWeek();
  const { openTaskModal, openActivityModal, closeActivityModal } = useModal();
  const { subscribeToTaskUpdates, notifyTaskUpdate } = useTaskUpdate();
  const { addError } = useToast();

  const { loading, rows, loadData, handleActivitySaveForTask } = useTaskTableData({
    weekStartIso,
    addError,
    notifyTaskUpdate,
    subscribeToTaskUpdates,
  });

  const handlers = useTaskTableHandlers({
    loadData,
    addError,
    notifyTaskUpdate,
    openTaskModal,
    openActivityModal,
    closeActivityModal,
    handleActivitySaveForTask,
  });

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
                      onClick={(e) => handlers.handleDayCellClick(row.task, day.date, e)}
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
                    <TaskCardLink
                      task={row.task}
                      onClick={(e) => handlers.handleViewTaskDetails(row.taskId, e)}
                      className={css.taskCell}
                      variant="text"
                    />
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
