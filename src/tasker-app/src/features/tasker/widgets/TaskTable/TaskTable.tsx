import React, { useMemo } from 'react';
import { GlassWidget, GlassButton, GlassTag, Tooltip } from '../../../../components';
import { Loader } from '../../../../components/ui/Loader';
import { TaskCardLink } from '../../../../components/tasks';
import { EventStatusBadge } from '../../../../components/ui/EventStatusBadge';
import type { WidgetSizeProps } from '../../../../types';
import { useModal, useTaskUpdate, useToast } from '../../../../context';
import { useWeek } from '../../../../hooks';
import { formatDateOnly } from '../../../../utils/date';
import { hexToRgb } from '../../../../utils/color';
import { buildWeekDays, getWeekEndIso } from '../../../../utils/week';
import { intensityClass } from './taskTableUtils';
import { useTaskTableData } from './useTaskTableData';
import { useTaskTableHandlers } from './useTaskTableHandlers';
import { useTaskTableFilters } from './useTaskTableFilters';
import { TaskTableToolbar } from './TaskTableToolbar';
import { CalendarIcon } from '../../../../components/icons';
import css from '../../../../styles/task-table.module.css';

export interface TaskTableProps extends WidgetSizeProps {
  onViewModeChange?: (mode: 'calendar') => void;
}

export const TaskTable: React.FC<TaskTableProps> = ({ colSpan, rowSpan, onViewModeChange }) => {
  const { weekStartIso, go } = useWeek();
  const { openTaskModal, openActivityModal, closeActivityModal } = useModal();
  const { subscribeToTaskUpdates, notifyTaskUpdate } = useTaskUpdate();
  const { showError } = useToast();

  const { enabledStatuses, sortPreset, searchQuery, setSearchQuery, toggleStatus, setSortPreset, enabledEventTypes, toggleEventType } = useTaskTableFilters();

  const { loading, groupedRows, loadData, handleActivitySaveForTask, handleActivityUpdateForTask, handleActivityDeleteForTask } = useTaskTableData({
    weekStartIso,
    showError,
    notifyTaskUpdate,
    subscribeToTaskUpdates,
    enabledStatuses,
    searchQuery,
    sortPreset,
    enabledEventTypes,
  });

  const handlers = useTaskTableHandlers({
    loadData,
    showError,
    notifyTaskUpdate,
    openTaskModal,
    openActivityModal,
    closeActivityModal,
    handleActivitySaveForTask,
    handleActivityUpdateForTask,
    handleActivityDeleteForTask,
  });

  const daysHeader = useMemo(() => buildWeekDays(weekStartIso), [weekStartIso]);
  const dateRangeLabel = useMemo(
    () => `${formatDateOnly(weekStartIso)} – ${formatDateOnly(getWeekEndIso(weekStartIso))}`,
    [weekStartIso]
  );

  const renderEventTooltip = (events: { id: string; eventType: number }[]) => {
    const counts: Record<number, number> = {};
    let total = 0;
    events.forEach(e => {
      counts[e.eventType] = (counts[e.eventType] || 0) + 1;
      total++;
    });

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {Object.entries(counts).map(([typeStr, count]) => {
          const type = Number(typeStr);
          return (
            <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <EventStatusBadge eventType={type} size="s" variant="default" showName={true} />
              <span style={{ fontSize: '12px', opacity: 0.9, fontWeight: 500 }}>× {count}</span>
            </div>
          );
        })}
        {total > 0 && (
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.1)',
            marginTop: '4px',
            paddingTop: '6px',
            fontSize: '11px',
            opacity: 0.7,
            textAlign: 'right'
          }}>
            Всего: {total}
          </div>
        )}
      </div>
    );
  };

  const hasRelevantHistory = (types: number[]) => {
    if (!types || types.length === 0) return false;
    // If no filters enabled, assume we want to see indicators if any event exists (or maybe default to Note/Activity?)
    // Actually if no filter enabled, enabledEventTypes is empty? No, initial state has defaults.
    // If enabledEventTypes is empty, maybe show nothing?
    if (enabledEventTypes.size === 0) return false;
    return types.some(t => enabledEventTypes.has(t));
  };

  return (
    <GlassWidget colSpan={colSpan} rowSpan={rowSpan}>
      <div className={css.container}>
        <div className={css.toolbar}>
          <span className={css.weekLabel}>Неделя</span>
          <GlassButton size="s" variant="subtle" onClick={() => go('prev')}>Предыдущая</GlassButton>
          <GlassButton size="s" variant="subtle" onClick={() => go('current')}>Текущая</GlassButton>
          <GlassButton size="s" variant="subtle" onClick={() => go('next')}>Следующая</GlassButton>

          <TaskTableToolbar
            enabledStatuses={enabledStatuses}
            toggleStatus={toggleStatus}
            sortPreset={sortPreset}
            setSortPreset={setSortPreset}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            enabledEventTypes={enabledEventTypes}
            toggleEventType={toggleEventType}
          />

          <div className={css.spacer} />
          <span className={css.muted}>{dateRangeLabel}</span>
          {onViewModeChange && (
            <GlassButton size="s" variant="subtle" onClick={() => onViewModeChange('calendar')} aria-label="Календарь">
              <CalendarIcon width={16} height={16} />
            </GlassButton>
          )}
        </div>
        <div className={css.gridWrapper}>
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
                <th className={`${css.th} ${css.colArea}`} />
                <th className={`${css.th} ${css.colTask}`}>Задача</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td className={`${css.td} ${css.tdLoading}`} colSpan={11}><Loader size="xs" ariaLabel="Загрузка" /></td>
                </tr>
              )}
              {!loading && groupedRows.flatMap(group =>
                group.rows.map((row, i) => (
                  <tr key={row.taskId}>
                    <td className={`${css.td} ${css.colCarry}`}>
                      {hasRelevantHistory(row.pastEventTypes) ? (
                        <Tooltip content="Есть события в прошлых неделях (выбранных типов)" placement="bottom" size="s">
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
                          <Tooltip content={day.events && day.events.length > 0 ? renderEventTooltip(day.events) : String(day.count)} placement="bottom" size="s">
                            <span className={`${css.heatCell} ${intensityClass(day.count)}`} />
                          </Tooltip>
                        ) : (
                          <span className={css.heatCellPlaceholder} />
                        )}
                      </td>
                    ))}
                    <td className={`${css.td} ${css.colFuture}`}>
                      {hasRelevantHistory(row.futureEventTypes) ? (
                        <Tooltip content="Есть события в будущих неделях (выбранных типов)" placement="bottom" size="s">
                          <GlassTag variant="subtle" size="xs">→</GlassTag>
                        </Tooltip>
                      ) : null}
                    </td>
                    {i === 0 ? (
                      <td
                        className={`${css.td} ${css.colArea} ${group.areaColor ? css.colAreaWithColor : ''}`}
                        rowSpan={group.rows.length}
                        style={group.areaColor ? {
                          '--card-custom-color': group.areaColor,
                          '--card-custom-color-rgb': hexToRgb(group.areaColor),
                        } as React.CSSProperties : undefined}
                      >
                        <div className={css.areaLabelClip}>
                          <div className={css.areaLabelWrapper}>
                            <span className={css.areaLabel}>{group.areaTitle}</span>
                          </div>
                        </div>
                      </td>
                    ) : null}
                    <td className={`${css.td} ${css.colTask}`}>
                      <TaskCardLink
                        task={row.task}
                        onClick={(e) => handlers.handleViewTaskDetails(row.taskId, e)}
                        className={css.taskCell}
                        variant="text"
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </GlassWidget>
  );
};
