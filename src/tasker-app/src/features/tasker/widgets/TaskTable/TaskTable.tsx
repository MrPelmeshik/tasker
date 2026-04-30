import React, { useMemo, useCallback } from 'react';
import { GlassWidget, GlassButton, Tooltip } from '../../../../components';
import { Loader } from '../../../../components/ui/Loader';
import { EventStatusBadge } from '../../../../components/ui/EventStatusBadge';
import type { WidgetSizeProps } from '../../../../types';
import { useModal, useTaskUpdate, useToast } from '../../../../context';
import { useWeek } from '../../../../hooks';
import { formatDateOnly } from '../../../../utils/date';
import { buildWeekDays, getWeekEndIso } from '../../../../utils/week';
import { useTaskTableData } from './useTaskTableData';
import { useTaskTableHandlers } from './useTaskTableHandlers';
import { TaskTableToolbar } from './TaskTableToolbar';
import { CalendarIcon } from '../../../../components/icons';
import { useTreeExpandState } from '../Tree/useTreeExpandState';
import { buildTaskTableDisplayRows } from './taskTableHierarchy';
import { TaskTableRow } from './TaskTableRow';
import { useTaskerShellFilters } from '../../context/TaskerShellContext';
import css from '../../../../styles/task-table.module.css';

export interface TaskTableProps extends WidgetSizeProps {
  onViewModeChange?: (mode: 'calendar') => void;
}

export const TaskTable: React.FC<TaskTableProps> = ({ colSpan, rowSpan, onViewModeChange }) => {
  const { weekStartIso, go } = useWeek();
  const { openAreaModal, openFolderModal, openTaskModal, openActivityModal, closeActivityModal } = useModal();
  const { subscribeToTaskUpdates, notifyTaskUpdate } = useTaskUpdate();
  const { showError } = useToast();

  const { enabledStatuses, sortPreset, searchQuery, setSearchQuery, toggleStatus, setSortPreset, enabledEventTypes, toggleEventType } = useTaskerShellFilters();

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
              {!loading &&
                displayRows.map((dr) => (
                  <TaskTableRow
                    key={dr.kind === 'task' ? dr.row.taskId : dr.kind === 'folder' ? `folder-${dr.folderId}-${dr.collapsed ? 'c' : 'e'}` : `area-${dr.areaId}`}
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
                  />
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </GlassWidget>
  );
};
