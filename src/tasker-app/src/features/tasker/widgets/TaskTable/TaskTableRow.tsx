import React from 'react';
import { GlassButton, GlassTag, Tooltip } from '../../../../components';
import { AreaCardLink } from '../../../../components/areas';
import { FolderCardLink } from '../../../../components/folders';
import { TaskCardLink } from '../../../../components/tasks';
import { ChevronDownIcon, EyeIcon, FolderIcon, CheckSquareIcon, LinkIcon } from '../../../../components/icons';
import { hexToRgb } from '../../../../utils/color';
import type { GroupedTaskRows } from './useTaskTableData';
import type { AggregatedTaskRowMetrics, TaskTableDisplayRow } from './taskTableHierarchy';
import { intensityClass } from './taskTableUtils';
import type { TaskRowTask } from './taskTableUtils';
import { useCopyEntityLink } from '../../../../hooks/useCopyEntityLink';
import css from '../../../../styles/task-table.module.css';

type DayHeader = { date: string };

interface TaskTableRowProps {
  rowKey: string;
  row: TaskTableDisplayRow;
  daysHeader: DayHeader[];
  groupMetaByAreaId: Map<string, GroupedTaskRows[number]>;
  hasRelevantHistory: (types: number[]) => boolean;
  renderEventTooltip: (events: { id: string; eventType: number }[]) => React.ReactNode;
  onToggleArea: (areaId: string) => void;
  onToggleFolder: (folderId: string) => void;
  onTaskDayClick: (task: TaskRowTask, date: string, e: React.MouseEvent) => void;
  onTaskOpen: (taskId: string, e: React.MouseEvent) => void;
  onAreaOpen: (areaId: string, e: React.MouseEvent) => void;
  onAreaCreateFolder: (areaId: string, e: React.MouseEvent) => void;
  onAreaCreateTask: (areaId: string, e: React.MouseEvent) => void;
  onFolderOpen: (folderId: string, e: React.MouseEvent) => void;
  onFolderCreateFolder: (folderId: string, areaId: string, e: React.MouseEvent) => void;
  onFolderCreateTask: (folderId: string, areaId: string, e: React.MouseEvent) => void;
  showFilteredCounts: boolean;
  hoveredRowKey: string | null;
  hoveredDayIndex: number | null;
  onHoverDayCell: (rowKey: string, dayIndex: number) => void;
  onLeaveDayCell: () => void;
  onHoverRow: (rowKey: string) => void;
  onLeaveRow: () => void;
}

function renderDayCells(
  rowKey: string,
  daysHeader: DayHeader[],
  metrics: AggregatedTaskRowMetrics | null,
  clickable: boolean,
  renderEventTooltip: (events: { id: string; eventType: number }[]) => React.ReactNode,
  onDayClick?: (date: string, e: React.MouseEvent) => void,
  hoveredRowKey?: string | null,
  hoveredDayIndex?: number | null,
  onHoverDayCell?: (rowKey: string, dayIndex: number) => void,
  onLeaveDayCell?: () => void
) {
  if (!metrics) {
    return daysHeader.map((d, idx) => (
      <td
        key={d.date}
        className={`${css.td} ${css.colDay} ${hoveredRowKey === rowKey ? css.dayRowHovered : ''} ${hoveredDayIndex === idx ? css.dayColHovered : ''}`}
        onMouseEnter={() => onHoverDayCell?.(rowKey, idx)}
        onMouseLeave={onLeaveDayCell}
      >
        <span className={css.heatCellPlaceholder} />
      </td>
    ));
  }
  return metrics.days.map((day, idx) => (
    <td
      key={day.date}
      className={`${css.td} ${css.colDay} ${clickable ? css.colDayClickable : ''} ${hoveredRowKey === rowKey ? css.dayRowHovered : ''} ${hoveredDayIndex === idx ? css.dayColHovered : ''}`}
      onClick={clickable && onDayClick ? (e) => onDayClick(day.date, e) : undefined}
      onMouseEnter={() => onHoverDayCell?.(rowKey, idx)}
      onMouseLeave={onLeaveDayCell}
    >
      {day.count > 0 ? (
        <Tooltip content={day.events && day.events.length > 0 ? renderEventTooltip(day.events) : String(day.count)} placement="bottom" size="s">
          <span className={`${css.heatCell} ${intensityClass(day.count)}`} />
        </Tooltip>
      ) : (
        <span className={css.heatCellPlaceholder} />
      )}
    </td>
  ));
}

const AreaCell: React.FC<{
  areaId: string;
  areaTitle: string;
  areaColor?: string;
  onToggleArea: (areaId: string) => void;
  interactive?: boolean;
}> = React.memo(({ areaId, areaTitle, areaColor, onToggleArea, interactive = true }) => (
  <td
    className={`${css.td} ${css.colArea}`}
    onClick={(e) => {
      if (!interactive) return;
      e.stopPropagation();
      onToggleArea(areaId);
    }}
    role={interactive ? 'button' : undefined}
    tabIndex={interactive ? 0 : undefined}
    onKeyDown={(e) => {
      if (!interactive) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onToggleArea(areaId);
      }
    }}
    title="Развернуть / свернуть область"
  >
    <div className={css.areaLabelClip}>
      <div className={css.areaLabelWrapper}>
        <span className={css.areaLabel}>{areaTitle}</span>
      </div>
    </div>
  </td>
));

/**
 * <summary>
 * Отдельная строка таблицы активностей (область/папка/задача) с memo.
 * Вынесена как подготовка к последующей виртуализации tbody.
 * </summary>
 */
export const TaskTableRow: React.FC<TaskTableRowProps> = React.memo(
  ({
    row,
    rowKey,
    daysHeader,
    groupMetaByAreaId,
    hasRelevantHistory,
    renderEventTooltip,
    onToggleArea,
    onToggleFolder,
    onTaskDayClick,
    onTaskOpen,
    onAreaOpen,
    onAreaCreateFolder,
    onAreaCreateTask,
    onFolderOpen,
    onFolderCreateFolder,
    onFolderCreateTask,
    showFilteredCounts,
    hoveredRowKey,
    hoveredDayIndex,
    onHoverDayCell,
    onLeaveDayCell,
    onHoverRow,
    onLeaveRow,
  }) => {
    const areaMeta = groupMetaByAreaId.get(row.areaId);
    const areaTitle = areaMeta?.areaTitle ?? (row.kind === 'area_collapsed' || row.kind === 'area_header' ? row.areaTitle : '—');
    const areaColor = areaMeta?.areaColor;
    const { copyLink: copyAreaLink } = useCopyEntityLink('area', row.areaId);
    const { copyLink: copyFolderLink } = useCopyEntityLink('folder', row.kind === 'folder' ? row.folderId : undefined);
    const { copyLink: copyTaskLink } = useCopyEntityLink('task', row.kind === 'task' ? row.row.taskId : undefined);

    if (row.kind === 'area_header') {
      return (
        <tr
          className={hoveredRowKey === rowKey ? css.tableRowHovered : ''}
          onMouseEnter={() => onHoverRow(rowKey)}
          onMouseLeave={onLeaveRow}
        >
          <td className={`${css.td} ${css.colCarry}`} />
          {renderDayCells(rowKey, daysHeader, null, false, renderEventTooltip, undefined, hoveredRowKey, hoveredDayIndex, onHoverDayCell, onLeaveDayCell)}
          <td className={`${css.td} ${css.colFuture}`} />
          <AreaCell areaId={row.areaId} areaTitle={areaTitle} areaColor={areaColor} onToggleArea={onToggleArea} interactive={false} />
          <td className={`${css.td} ${css.colTask}`}>
            <div className={`${css.rowMain} ${css.treeNodeCard}`}>
              <span
                className={css.treeToggleIconButton}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleArea(row.areaId);
                }}
                role="button"
                tabIndex={0}
                aria-label="Свернуть область"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onToggleArea(row.areaId);
                  }
                }}
              >
                <span className={`${css.compactChevron} ${css.folderChevronExpanded}`} aria-hidden="true">
                  <ChevronDownIcon width={14} height={14} />
                </span>
              </span>
              <AreaCardLink
                area={{
                  id: row.areaId,
                  title: areaTitle,
                  foldersCount: row.totalFoldersCount,
                  rootTasksCount: row.totalRootTasksCount,
                  customColor: areaColor ?? null,
                }}
                displayCount={showFilteredCounts ? row.displayFoldersCount + row.displayRootTasksCount : undefined}
                totalCount={showFilteredCounts ? row.totalFoldersCount + row.totalRootTasksCount : undefined}
                style={
                  areaColor
                    ? ({
                        '--card-custom-color': areaColor,
                        '--card-custom-color-rgb': hexToRgb(areaColor),
                      } as React.CSSProperties)
                    : undefined
                }
                dataCustomColor={!!areaColor}
              />
              <div className={css.rowActions} onClick={(e) => e.stopPropagation()}>
                <Tooltip content="Просмотреть" placement="top">
                  <GlassButton variant="subtle" size="xs" className={css.rowActionButton} onClick={(e) => onAreaOpen(row.areaId, e)} aria-label="Просмотреть область">
                    <EyeIcon className="icon-m" />
                  </GlassButton>
                </Tooltip>
                <Tooltip content="Создать папку" placement="top">
                  <GlassButton variant="subtle" size="xs" className={css.rowActionButton} onClick={(e) => onAreaCreateFolder(row.areaId, e)} aria-label="Создать папку">
                    <FolderIcon className="icon-m" />
                  </GlassButton>
                </Tooltip>
                <Tooltip content="Создать задачу" placement="top">
                  <GlassButton variant="subtle" size="xs" className={css.rowActionButton} onClick={(e) => onAreaCreateTask(row.areaId, e)} aria-label="Создать задачу">
                    <CheckSquareIcon className="icon-m" />
                  </GlassButton>
                </Tooltip>
                <Tooltip content="Копировать ссылку" placement="top">
                  <GlassButton variant="subtle" size="xs" className={css.rowActionButton} onClick={copyAreaLink} aria-label="Копировать ссылку">
                    <LinkIcon className="icon-m" />
                  </GlassButton>
                </Tooltip>
              </div>
            </div>
          </td>
        </tr>
      );
    }

    if (row.kind === 'area_collapsed') {
      const m = row.metrics;
      return (
        <tr
          className={hoveredRowKey === rowKey ? css.tableRowHovered : ''}
          onMouseEnter={() => onHoverRow(rowKey)}
          onMouseLeave={onLeaveRow}
        >
          <td className={`${css.td} ${css.colCarry}`}>
            {hasRelevantHistory(m.pastEventTypes) ? (
              <Tooltip content="Есть события в прошлых неделях (выбранных типов)" placement="bottom" size="s">
                <GlassTag variant="subtle" size="xs">←</GlassTag>
              </Tooltip>
            ) : null}
          </td>
          {renderDayCells(rowKey, daysHeader, m, false, renderEventTooltip, undefined, hoveredRowKey, hoveredDayIndex, onHoverDayCell, onLeaveDayCell)}
          <td className={`${css.td} ${css.colFuture}`}>
            {hasRelevantHistory(m.futureEventTypes) ? (
              <Tooltip content="Есть события в будущих неделях (выбранных типов)" placement="bottom" size="s">
                <GlassTag variant="subtle" size="xs">→</GlassTag>
              </Tooltip>
            ) : null}
          </td>
          <AreaCell areaId={row.areaId} areaTitle={areaTitle} areaColor={areaColor} onToggleArea={onToggleArea} interactive={false} />
          <td className={`${css.td} ${css.colTask}`}>
            <div className={`${css.rowMain} ${css.treeNodeCard}`}>
              <span
                className={css.treeToggleIconButton}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleArea(row.areaId);
                }}
                role="button"
                tabIndex={0}
                aria-label="Развернуть область"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onToggleArea(row.areaId);
                  }
                }}
              >
                <span className={`${css.compactChevron} ${css.folderChevron}`} aria-hidden="true">
                  <ChevronDownIcon width={14} height={14} />
                </span>
              </span>
              <AreaCardLink
                area={{
                  id: row.areaId,
                  title: areaTitle,
                  foldersCount: row.totalFoldersCount,
                  rootTasksCount: row.totalRootTasksCount,
                  customColor: areaColor ?? null,
                }}
                displayCount={showFilteredCounts ? row.displayFoldersCount + row.displayRootTasksCount : undefined}
                totalCount={showFilteredCounts ? row.totalFoldersCount + row.totalRootTasksCount : undefined}
                style={
                  areaColor
                    ? ({
                        '--card-custom-color': areaColor,
                        '--card-custom-color-rgb': hexToRgb(areaColor),
                      } as React.CSSProperties)
                    : undefined
                }
                dataCustomColor={!!areaColor}
              />
              <div className={css.rowActions} onClick={(e) => e.stopPropagation()}>
                <Tooltip content="Просмотреть" placement="top">
                  <GlassButton variant="subtle" size="xs" className={css.rowActionButton} onClick={(e) => onAreaOpen(row.areaId, e)} aria-label="Просмотреть область">
                    <EyeIcon className="icon-m" />
                  </GlassButton>
                </Tooltip>
                <Tooltip content="Создать папку" placement="top">
                  <GlassButton variant="subtle" size="xs" className={css.rowActionButton} onClick={(e) => onAreaCreateFolder(row.areaId, e)} aria-label="Создать папку">
                    <FolderIcon className="icon-m" />
                  </GlassButton>
                </Tooltip>
                <Tooltip content="Создать задачу" placement="top">
                  <GlassButton variant="subtle" size="xs" className={css.rowActionButton} onClick={(e) => onAreaCreateTask(row.areaId, e)} aria-label="Создать задачу">
                    <CheckSquareIcon className="icon-m" />
                  </GlassButton>
                </Tooltip>
                <Tooltip content="Копировать ссылку" placement="top">
                  <GlassButton variant="subtle" size="xs" className={css.rowActionButton} onClick={copyAreaLink} aria-label="Копировать ссылку">
                    <LinkIcon className="icon-m" />
                  </GlassButton>
                </Tooltip>
              </div>
            </div>
          </td>
        </tr>
      );
    }

    if (row.kind === 'folder') {
      const m = row.metrics;
      const folderStyle = row.customColor
        ? ({ '--card-custom-color': row.customColor, '--card-custom-color-rgb': hexToRgb(row.customColor) } as React.CSSProperties)
        : {};
      const expanded = !row.collapsed;
      return (
        <tr
          className={hoveredRowKey === rowKey ? css.tableRowHovered : ''}
          onMouseEnter={() => onHoverRow(rowKey)}
          onMouseLeave={onLeaveRow}
        >
          <td className={`${css.td} ${css.colCarry}`}>
            {m && hasRelevantHistory(m.pastEventTypes) ? (
              <Tooltip content="Есть события в прошлых неделях (выбранных типов)" placement="bottom" size="s">
                <GlassTag variant="subtle" size="xs">←</GlassTag>
              </Tooltip>
            ) : null}
          </td>
          {renderDayCells(rowKey, daysHeader, m, false, renderEventTooltip, undefined, hoveredRowKey, hoveredDayIndex, onHoverDayCell, onLeaveDayCell)}
          <td className={`${css.td} ${css.colFuture}`}>
            {m && hasRelevantHistory(m.futureEventTypes) ? (
              <Tooltip content="Есть события в будущих неделях (выбранных типов)" placement="bottom" size="s">
                <GlassTag variant="subtle" size="xs">→</GlassTag>
              </Tooltip>
            ) : null}
          </td>
          <AreaCell areaId={row.areaId} areaTitle={areaTitle} areaColor={areaColor} onToggleArea={onToggleArea} />
          <td className={`${css.td} ${css.colTask}`}>
            <div
              className={`${css.folderRowInner} ${css.treeNodeCard}`}
              style={{
                paddingLeft: `calc(var(--tree-indent) * ${row.depth + 1})`,
                ...(row.customColor
                  ? ({
                      '--card-custom-color': row.customColor,
                      '--card-custom-color-rgb': hexToRgb(row.customColor),
                    } as React.CSSProperties)
                  : {}),
              }}
              data-custom-color={row.customColor ? 'true' : undefined}
            >
              <span
                className={css.treeToggleIconButton}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFolder(row.folderId);
                }}
                role="button"
                tabIndex={0}
                aria-label={expanded ? 'Свернуть папку' : 'Развернуть папку'}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onToggleFolder(row.folderId);
                  }
                }}
              >
                <span className={`${css.compactChevron} ${expanded ? css.folderChevronExpanded : css.folderChevron}`} aria-hidden="true">
                  <ChevronDownIcon width={14} height={14} />
                </span>
              </span>
              <FolderCardLink
                folder={{
                  id: row.folderId,
                  title: row.title,
                  tasksCount: row.totalTasksCount,
                  subfoldersCount: row.totalSubfoldersCount,
                  customColor: row.customColor ?? undefined,
                }}
                displayCount={showFilteredCounts ? row.displaySubfoldersCount + row.displayTasksCount : undefined}
                totalCount={showFilteredCounts ? row.totalSubfoldersCount + row.totalTasksCount : undefined}
                style={folderStyle}
                dataCustomColor={!!row.customColor}
              />
              <div className={css.rowActions} onClick={(e) => e.stopPropagation()}>
                <Tooltip content="Просмотреть" placement="top">
                  <GlassButton variant="subtle" size="xs" className={css.rowActionButton} onClick={(e) => onFolderOpen(row.folderId, e)} aria-label="Просмотреть папку">
                    <EyeIcon className="icon-m" />
                  </GlassButton>
                </Tooltip>
                <Tooltip content="Создать подпапку" placement="top">
                  <GlassButton variant="subtle" size="xs" className={css.rowActionButton} onClick={(e) => onFolderCreateFolder(row.folderId, row.areaId, e)} aria-label="Создать подпапку">
                    <FolderIcon className="icon-m" />
                  </GlassButton>
                </Tooltip>
                <Tooltip content="Создать задачу" placement="top">
                  <GlassButton variant="subtle" size="xs" className={css.rowActionButton} onClick={(e) => onFolderCreateTask(row.folderId, row.areaId, e)} aria-label="Создать задачу">
                    <CheckSquareIcon className="icon-m" />
                  </GlassButton>
                </Tooltip>
                <Tooltip content="Копировать ссылку" placement="top">
                  <GlassButton variant="subtle" size="xs" className={css.rowActionButton} onClick={copyFolderLink} aria-label="Копировать ссылку">
                    <LinkIcon className="icon-m" />
                  </GlassButton>
                </Tooltip>
              </div>
            </div>
          </td>
        </tr>
      );
    }

    const taskRow = row.row;
    return (
      <tr
        className={hoveredRowKey === rowKey ? css.tableRowHovered : ''}
        onMouseEnter={() => onHoverRow(rowKey)}
        onMouseLeave={onLeaveRow}
      >
        <td className={`${css.td} ${css.colCarry}`}>
          {hasRelevantHistory(taskRow.pastEventTypes) ? (
            <Tooltip content="Есть события в прошлых неделях (выбранных типов)" placement="bottom" size="s">
              <GlassTag variant="subtle" size="xs">←</GlassTag>
            </Tooltip>
          ) : null}
        </td>
        {renderDayCells(rowKey, daysHeader, {
          days: taskRow.days,
          carryWeeks: taskRow.carryWeeks,
          hasFutureActivities: taskRow.hasFutureActivities,
          pastEventTypes: taskRow.pastEventTypes,
          futureEventTypes: taskRow.futureEventTypes,
        }, true, renderEventTooltip, (date, e) =>
          onTaskDayClick(taskRow.task, date, e)
        , hoveredRowKey, hoveredDayIndex, onHoverDayCell, onLeaveDayCell)}
        <td className={`${css.td} ${css.colFuture}`}>
          {hasRelevantHistory(taskRow.futureEventTypes) ? (
            <Tooltip content="Есть события в будущих неделях (выбранных типов)" placement="bottom" size="s">
              <GlassTag variant="subtle" size="xs">→</GlassTag>
            </Tooltip>
          ) : null}
        </td>
        <AreaCell areaId={row.areaId} areaTitle={areaTitle} areaColor={areaColor} onToggleArea={onToggleArea} />
        <td className={`${css.td} ${css.colTask}`}>
          <div
            className={`${css.rowMain} ${css.treeNodeCard}`}
            style={{ paddingLeft: `calc(var(--tree-indent) * ${row.depth + 1})` }}
          >
            <TaskCardLink
              task={taskRow.task}
              onClick={(e) => onTaskOpen(taskRow.taskId, e)}
              className={css.taskCell}
              variant="text"
            />
            <div className={css.rowActions} onClick={(e) => e.stopPropagation()}>
              <Tooltip content="Просмотреть" placement="top">
                <GlassButton variant="subtle" size="xs" className={css.rowActionButton} onClick={(e) => onTaskOpen(taskRow.taskId, e)} aria-label="Просмотреть задачу">
                  <EyeIcon className="icon-m" />
                </GlassButton>
              </Tooltip>
              <Tooltip content="Копировать ссылку" placement="top">
                <GlassButton variant="subtle" size="xs" className={css.rowActionButton} onClick={copyTaskLink} aria-label="Копировать ссылку">
                  <LinkIcon className="icon-m" />
                </GlassButton>
              </Tooltip>
            </div>
          </div>
        </td>
      </tr>
    );
  }
);
