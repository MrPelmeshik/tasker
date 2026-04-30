import React, { useMemo, useCallback } from 'react';
import { GlassWidget, GlassButton, GlassTag, Tooltip } from '../../../../components';
import { Loader } from '../../../../components/ui/Loader';
import { TaskCardLink } from '../../../../components/tasks';
import { FolderCardLink } from '../../../../components/folders';
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
import { CalendarIcon, ChevronDownIcon } from '../../../../components/icons';
import { useTreeExpandState } from '../Tree/useTreeExpandState';
import { buildTaskTableDisplayRows, type AggregatedTaskRowMetrics, type TaskTableDisplayRow } from './taskTableHierarchy';
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

  const { loading, groupedRows, folderIndex, loadData, handleActivitySaveForTask, handleActivityUpdateForTask, handleActivityDeleteForTask } = useTaskTableData({
    weekStartIso,
    showError,
    notifyTaskUpdate,
    subscribeToTaskUpdates,
    enabledStatuses,
    searchQuery,
    sortPreset,
    enabledEventTypes,
  });

  const { expandedAreas, expandedFolders, setExpandedAreas, setExpandedFolders } = useTreeExpandState();

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

  const forceExpandAll = searchQuery.trim().length > 0;
  const displayRows = useMemo(
    () =>
      buildTaskTableDisplayRows(
        groupedRows,
        folderIndex,
        expandedAreas,
        expandedFolders,
        sortPreset,
        forceExpandAll
      ),
    [groupedRows, folderIndex, expandedAreas, expandedFolders, sortPreset, forceExpandAll]
  );

  const bodyColSpan = 4 + daysHeader.length;

  const groupMetaByAreaId = useMemo(() => new Map(groupedRows.map((g) => [g.areaId, g])), [groupedRows]);

  const toggleTableArea = useCallback(
    (areaId: string) => {
      setExpandedAreas((prev) => {
        const next = new Set(prev);
        if (next.has(areaId)) next.delete(areaId);
        else next.add(areaId);
        return next;
      });
    },
    [setExpandedAreas]
  );

  const toggleTableFolder = useCallback(
    (folderId: string) => {
      setExpandedFolders((prev) => {
        const next = new Set(prev);
        if (next.has(folderId)) next.delete(folderId);
        else next.add(folderId);
        return next;
      });
    },
    [setExpandedFolders]
  );

  const renderEventTooltip = (events: { id: string; eventType: number }[]) => {
    const counts: Record<number, number> = {};
    let total = 0;
    events.forEach((e) => {
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
          <div
            style={{
              borderTop: '1px solid rgba(255,255,255,0.1)',
              marginTop: '4px',
              paddingTop: '6px',
              fontSize: '11px',
              opacity: 0.7,
              textAlign: 'right',
            }}
          >
            Всего: {total}
          </div>
        )}
      </div>
    );
  };

  const hasRelevantHistory = (types: number[]) => {
    if (!types || types.length === 0) return false;
    if (enabledEventTypes.size === 0) return false;
    return types.some((t) => enabledEventTypes.has(t));
  };

  const renderDayCells = (
    metrics: AggregatedTaskRowMetrics | null,
    clickable: boolean,
    onDayClick?: (date: string, e: React.MouseEvent) => void,
    taskId?: string
  ) => {
    if (!metrics) {
      return daysHeader.map((d) => (
        <td key={d.date} className={`${css.td} ${css.colDay}`}>
          <span className={css.heatCellPlaceholder} />
        </td>
      ));
    }
    return metrics.days.map((day) => (
      <td
        key={day.date}
        className={`${css.td} ${css.colDay} ${clickable ? css.colDayClickable : ''}`}
        onClick={clickable && onDayClick ? (e) => onDayClick(day.date, e) : undefined}
      >
        {day.count > 0 ? (
          <Tooltip
            content={day.events && day.events.length > 0 ? renderEventTooltip(day.events) : String(day.count)}
            placement="bottom"
            size="s"
          >
            <span className={`${css.heatCell} ${intensityClass(day.count)}`} />
          </Tooltip>
        ) : (
          <span className={css.heatCellPlaceholder} />
        )}
      </td>
    ));
  };

  const areaCell = (areaId: string) => {
    const g = groupMetaByAreaId.get(areaId);
    const areaTitle = g?.areaTitle ?? '—';
    const areaColor = g?.areaColor;
    return (
    <td
      className={`${css.td} ${css.colArea} ${areaColor ? css.colAreaWithColor : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        toggleTableArea(areaId);
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleTableArea(areaId);
        }
      }}
      style={
        areaColor
          ? ({
              '--card-custom-color': areaColor,
              '--card-custom-color-rgb': hexToRgb(areaColor),
            } as React.CSSProperties)
          : undefined
      }
      title="Развернуть / свернуть область"
    >
      <div className={css.areaLabelClip}>
        <div className={css.areaLabelWrapper}>
          <span className={css.areaLabel}>{areaTitle}</span>
        </div>
      </div>
    </td>
    );
  };

  const renderRow = (dr: TaskTableDisplayRow) => {
    if (dr.kind === 'area_collapsed') {
      const m = dr.metrics;
      return (
        <tr key={`area-collapsed-${dr.areaId}`}>
          <td className={`${css.td} ${css.colCarry}`}>
            {hasRelevantHistory(m.pastEventTypes) ? (
              <Tooltip content="Есть события в прошлых неделях (выбранных типов)" placement="bottom" size="s">
                <GlassTag variant="subtle" size="xs">
                  ←
                </GlassTag>
              </Tooltip>
            ) : null}
          </td>
          {renderDayCells(m, false)}
          <td className={`${css.td} ${css.colFuture}`}>
            {hasRelevantHistory(m.futureEventTypes) ? (
              <Tooltip content="Есть события в будущих неделях (выбранных типов)" placement="bottom" size="s">
                <GlassTag variant="subtle" size="xs">
                  →
                </GlassTag>
              </Tooltip>
            ) : null}
          </td>
          {areaCell(dr.areaId)}
          <td className={`${css.td} ${css.colTask}`}>
            <span className={css.muted}>{dr.areaTitle}</span>
            <span className={css.muted}> · свёрнуто</span>
          </td>
        </tr>
      );
    }

    if (dr.kind === 'folder') {
      const m = dr.metrics;
      const folderStyle = dr.customColor
        ? ({
            '--card-custom-color': dr.customColor,
            '--card-custom-color-rgb': hexToRgb(dr.customColor),
          } as React.CSSProperties)
        : {};
      const expanded = !dr.collapsed;
      return (
        <tr key={`folder-${dr.folderId}-${dr.collapsed ? 'c' : 'e'}`}>
          <td className={`${css.td} ${css.colCarry}`}>
            {m && hasRelevantHistory(m.pastEventTypes) ? (
              <Tooltip content="Есть события в прошлых неделях (выбранных типов)" placement="bottom" size="s">
                <GlassTag variant="subtle" size="xs">
                  ←
                </GlassTag>
              </Tooltip>
            ) : null}
          </td>
          {renderDayCells(m, false)}
          <td className={`${css.td} ${css.colFuture}`}>
            {m && hasRelevantHistory(m.futureEventTypes) ? (
              <Tooltip content="Есть события в будущих неделях (выбранных типов)" placement="bottom" size="s">
                <GlassTag variant="subtle" size="xs">
                  →
                </GlassTag>
              </Tooltip>
            ) : null}
          </td>
          {areaCell(dr.areaId)}
          <td className={`${css.td} ${css.colTask}`}>
            <div className={css.folderRowInner} style={{ paddingLeft: `calc(var(--tree-indent) * ${dr.depth + 1})` }}>
              <GlassButton
                type="button"
                variant="subtle"
                size="xs"
                className={css.folderChevronBtn}
                aria-expanded={expanded}
                aria-label={expanded ? 'Свернуть папку' : 'Развернуть папку'}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleTableFolder(dr.folderId);
                }}
              >
                <ChevronDownIcon width={14} height={14} className={expanded ? css.folderChevronExpanded : css.folderChevron} />
              </GlassButton>
              <FolderCardLink
                folder={{
                  id: dr.folderId,
                  title: dr.title,
                  tasksCount: dr.tasksCount,
                  subfoldersCount: dr.subfoldersCount,
                  customColor: dr.customColor ?? undefined,
                }}
                style={folderStyle}
                dataCustomColor={!!dr.customColor}
              />
            </div>
          </td>
        </tr>
      );
    }

    const row = dr.row;
    return (
      <tr key={row.taskId}>
        <td className={`${css.td} ${css.colCarry}`}>
          {hasRelevantHistory(row.pastEventTypes) ? (
            <Tooltip content="Есть события в прошлых неделях (выбранных типов)" placement="bottom" size="s">
              <GlassTag variant="subtle" size="xs">
                ←
              </GlassTag>
            </Tooltip>
          ) : null}
        </td>
        {row.days.map((day) => (
          <td
            key={day.date}
            className={`${css.td} ${css.colDay} ${css.colDayClickable}`}
            onClick={(e) => handlers.handleDayCellClick(row.task, day.date, e)}
          >
            {day.count > 0 ? (
              <Tooltip
                content={day.events && day.events.length > 0 ? renderEventTooltip(day.events) : String(day.count)}
                placement="bottom"
                size="s"
              >
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
              <GlassTag variant="subtle" size="xs">
                →
              </GlassTag>
            </Tooltip>
          ) : null}
        </td>
        {areaCell(dr.areaId)}
        <td className={`${css.td} ${css.colTask}`}>
          <div style={{ paddingLeft: `calc(var(--tree-indent) * ${dr.depth + 1})` }}>
            <TaskCardLink
              task={row.task}
              onClick={(e) => handlers.handleViewTaskDetails(row.taskId, e)}
              className={css.taskCell}
              variant="text"
            />
          </div>
        </td>
      </tr>
    );
  };

  return (
    <GlassWidget colSpan={colSpan} rowSpan={rowSpan}>
      <div className={css.container}>
        <div className={css.toolbar}>
          <span className={css.weekLabel}>Неделя</span>
          <GlassButton size="s" variant="subtle" onClick={() => go('prev')}>
            Предыдущая
          </GlassButton>
          <GlassButton size="s" variant="subtle" onClick={() => go('current')}>
            Текущая
          </GlassButton>
          <GlassButton size="s" variant="subtle" onClick={() => go('next')}>
            Следующая
          </GlassButton>

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
                  <td className={`${css.td} ${css.tdLoading}`} colSpan={bodyColSpan}>
                    <Loader size="xs" ariaLabel="Загрузка" />
                  </td>
                </tr>
              )}
              {!loading && displayRows.map((dr) => renderRow(dr))}
            </tbody>
          </table>
        </div>
      </div>
    </GlassWidget>
  );
};
