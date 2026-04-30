import React, { useMemo, useCallback, useState } from 'react';
import { GlassWidget, GlassButton, Tooltip } from '../../../../components';
import { Loader } from '../../../../components/ui/Loader';
import { EventStatusBadge } from '../../../../components/ui/EventStatusBadge';
import type { WidgetSizeProps } from '../../../../types';
import { useTaskUpdate, useToast } from '../../../../context';
import { useWeek } from '../../../../hooks';
import { formatDateOnly } from '../../../../utils/date';
import { buildWeekDays, getWeekEndIso } from '../../../../utils/week';
import { useTaskTableData } from './useTaskTableData';
import { useTaskTableHandlers } from './useTaskTableHandlers';
import { TaskTableToolbar } from './TaskTableToolbar';
import { CalendarIcon, FoldVerticalIcon, UnfoldVerticalIcon } from '../../../../components/icons';
import { useTreeExpandState } from '../Tree/useTreeExpandState';
import { buildTaskTableDisplayRows, type TaskTableDisplayRow } from './taskTableHierarchy';
import { TaskTableRow } from './TaskTableRow';
import { useTaskerShellFilters } from '../../context/TaskerShellContext';
import { useTaskerDetailPanel } from '../../context/TaskerDetailPanelContext';
import css from '../../../../styles/task-table.module.css';

export interface TaskTableProps extends WidgetSizeProps {
  onViewModeChange?: (mode: 'calendar') => void;
}

export const TaskTable: React.FC<TaskTableProps> = ({ colSpan, rowSpan, onViewModeChange }) => {
  const { weekStartIso, go } = useWeek();
  const { openAreaModal, openFolderModal, openTaskModal, openActivityModal, closeActivityModal } = useTaskerDetailPanel();
  const { subscribeToTaskUpdates, notifyTaskUpdate } = useTaskUpdate();
  const { showError } = useToast();

  const { enabledStatuses, sortPreset, searchQuery, setSearchQuery, toggleStatus, setSortPreset, enabledEventTypes, toggleEventType, hasStatusFilter } = useTaskerShellFilters();

  const { loading, groupedRows, folderIndex, areaTotals, folderTotals, loadData, handleActivitySaveForTask, handleActivityUpdateForTask, handleActivityDeleteForTask } = useTaskTableData({
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
  const [hoveredRowKey, setHoveredRowKey] = useState<string | null>(null);
  const [hoveredDayIndex, setHoveredDayIndex] = useState<number | null>(null);

  const handlers = useTaskTableHandlers({
    loadData,
    showError,
    notifyTaskUpdate,
    openAreaModal,
    openFolderModal,
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
        forceExpandAll,
        areaTotals,
        folderTotals
      ),
    [groupedRows, folderIndex, expandedAreas, expandedFolders, sortPreset, forceExpandAll, areaTotals, folderTotals]
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

  const expandAllInTable = useCallback(() => {
    const nextAreas = new Set(groupedRows.map((g) => g.areaId));
    const nextFolders = new Set<string>();
    for (const folder of Array.from(folderIndex.folderById.values())) {
      nextFolders.add(folder.id);
    }
    setExpandedAreas(nextAreas);
    setExpandedFolders(nextFolders);
  }, [groupedRows, folderIndex, setExpandedAreas, setExpandedFolders]);

  const collapseAllInTable = useCallback(() => {
    setExpandedAreas(new Set());
    setExpandedFolders(new Set());
  }, [setExpandedAreas, setExpandedFolders]);

  const isAllExpandedInTable = useMemo(() => {
    if (groupedRows.length === 0) return false;
    const allAreaExpanded = groupedRows.every((g) => expandedAreas.has(g.areaId));
    if (!allAreaExpanded) return false;
    const tableAreaIds = new Set(groupedRows.map((g) => g.areaId));
    const folderIdsInTable = Array.from(folderIndex.folderById.values())
      .filter((f) => tableAreaIds.has(f.areaId))
      .map((f) => f.id);
    return folderIdsInTable.every((id) => expandedFolders.has(id));
  }, [groupedRows, folderIndex, expandedAreas, expandedFolders]);

  const renderEventTooltip = useCallback((events: { id: string; eventType: number }[]) => {
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
  }, []);

  const hasRelevantHistory = useCallback((types: number[]) => {
    if (!types || types.length === 0) return false;
    if (enabledEventTypes.size === 0) return false;
    return types.some((t) => enabledEventTypes.has(t));
  }, [enabledEventTypes]);

  const getDisplayRowKey = useCallback((dr: TaskTableDisplayRow): string => {
    if (dr.kind === 'task') return dr.row.taskId;
    if (dr.kind === 'folder') return `folder-${dr.folderId}-${dr.collapsed ? 'c' : 'e'}`;
    if (dr.kind === 'area_header') return `area-header-${dr.areaId}`;
    return `area-${dr.areaId}`;
  }, []);

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
          <Tooltip content={isAllExpandedInTable ? 'Свернуть всё' : 'Развернуть всё'} placement="bottom" size="s">
            <GlassButton
              size="s"
              variant="subtle"
              onClick={isAllExpandedInTable ? collapseAllInTable : expandAllInTable}
              aria-label={isAllExpandedInTable ? 'Свернуть всё' : 'Развернуть всё'}
            >
              {isAllExpandedInTable ? <FoldVerticalIcon className="icon-m" /> : <UnfoldVerticalIcon className="icon-m" />}
            </GlassButton>
          </Tooltip>

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
        <div
          className={css.gridWrapper}
          onMouseLeave={() => {
            setHoveredRowKey(null);
            setHoveredDayIndex(null);
          }}
        >
          <table className={css.table}>
            <thead className={css.thead}>
              <tr>
                <th className={`${css.th} ${css.colCarry}`} />
                {daysHeader.map((d, i) => (
                  <th key={i} className={`${css.th} ${css.colDay} ${hoveredDayIndex === i ? css.colHeaderHovered : ''}`}>
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
              {!loading &&
                displayRows.map((dr) => {
                  const rowKey = getDisplayRowKey(dr);
                  return (
                  <TaskTableRow
                    key={rowKey}
                    rowKey={rowKey}
                    row={dr}
                    daysHeader={daysHeader}
                    groupMetaByAreaId={groupMetaByAreaId}
                    hasRelevantHistory={hasRelevantHistory}
                    renderEventTooltip={renderEventTooltip}
                    onToggleArea={toggleTableArea}
                    onToggleFolder={toggleTableFolder}
                    onTaskDayClick={handlers.handleDayCellClick}
                    onTaskOpen={handlers.handleViewTaskDetails}
                    onAreaOpen={handlers.handleViewAreaDetails}
                    onAreaCreateFolder={handlers.handleCreateFolderForArea}
                    onAreaCreateTask={handlers.handleCreateTaskForArea}
                    onFolderOpen={handlers.handleViewFolderDetails}
                    onFolderCreateFolder={handlers.handleCreateFolderForFolder}
                    onFolderCreateTask={handlers.handleCreateTaskForFolder}
                    showFilteredCounts={hasStatusFilter}
                    hoveredRowKey={hoveredRowKey}
                    hoveredDayIndex={hoveredDayIndex}
                    onHoverDayCell={(nextRowKey, dayIndex) => {
                      setHoveredRowKey(nextRowKey);
                      setHoveredDayIndex(dayIndex);
                    }}
                    onLeaveDayCell={() => {
                      setHoveredDayIndex(null);
                    }}
                    onHoverRow={(nextRowKey) => {
                      setHoveredRowKey(nextRowKey);
                      setHoveredDayIndex(null);
                    }}
                    onLeaveRow={() => {
                      setHoveredRowKey(null);
                      setHoveredDayIndex(null);
                    }}
                  />
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </GlassWidget>
  );
};
