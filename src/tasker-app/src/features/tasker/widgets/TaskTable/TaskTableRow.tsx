import React from 'react';
import { GlassButton, GlassTag, Tooltip } from '../../../../components';
import { FolderCardLink } from '../../../../components/folders';
import { TaskCardLink } from '../../../../components/tasks';
import { ChevronDownIcon } from '../../../../components/icons';
import { hexToRgb } from '../../../../utils/color';
import type { GroupedTaskRows } from './useTaskTableData';
import type { AggregatedTaskRowMetrics, TaskTableDisplayRow } from './taskTableHierarchy';
import { intensityClass } from './taskTableUtils';
import type { TaskRowTask } from './taskTableUtils';
import css from '../../../../styles/task-table.module.css';

type DayHeader = { date: string };

interface TaskTableRowProps {
  row: TaskTableDisplayRow;
  daysHeader: DayHeader[];
  groupMetaByAreaId: Map<string, GroupedTaskRows[number]>;
  hasRelevantHistory: (types: number[]) => boolean;
  renderEventTooltip: (events: { id: string; eventType: number }[]) => React.ReactNode;
  onToggleArea: (areaId: string) => void;
  onToggleFolder: (folderId: string) => void;
  onTaskDayClick: (task: TaskRowTask, date: string, e: React.MouseEvent) => void;
  onTaskOpen: (taskId: string, e: React.MouseEvent) => void;
}

function renderDayCells(
  daysHeader: DayHeader[],
  metrics: AggregatedTaskRowMetrics | null,
  clickable: boolean,
  renderEventTooltip: (events: { id: string; eventType: number }[]) => React.ReactNode,
  onDayClick?: (date: string, e: React.MouseEvent) => void
) {
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
}> = React.memo(({ areaId, areaTitle, areaColor, onToggleArea }) => (
  <td
    className={`${css.td} ${css.colArea} ${areaColor ? css.colAreaWithColor : ''}`}
    onClick={(e) => {
      e.stopPropagation();
      onToggleArea(areaId);
    }}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onToggleArea(areaId);
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
));

/**
 * <summary>
 * Отдельная строка таблицы активностей (область/папка/задача) с memo.
 * Вынесена как подготовка к последующей виртуализации tbody.
 * </summary>
 */
export const TaskTableRow: React.FC<TaskTableRowProps> = React.memo(
  ({ row, daysHeader, groupMetaByAreaId, hasRelevantHistory, renderEventTooltip, onToggleArea, onToggleFolder, onTaskDayClick, onTaskOpen }) => {
    const areaMeta = groupMetaByAreaId.get(row.areaId);
    const areaTitle = areaMeta?.areaTitle ?? (row.kind === 'area_collapsed' ? row.areaTitle : '—');
    const areaColor = areaMeta?.areaColor;

    if (row.kind === 'area_collapsed') {
      const m = row.metrics;
      return (
        <tr>
          <td className={`${css.td} ${css.colCarry}`}>
            {hasRelevantHistory(m.pastEventTypes) ? (
              <Tooltip content="Есть события в прошлых неделях (выбранных типов)" placement="bottom" size="s">
                <GlassTag variant="subtle" size="xs">←</GlassTag>
              </Tooltip>
            ) : null}
          </td>
          {renderDayCells(daysHeader, m, false, renderEventTooltip)}
          <td className={`${css.td} ${css.colFuture}`}>
            {hasRelevantHistory(m.futureEventTypes) ? (
              <Tooltip content="Есть события в будущих неделях (выбранных типов)" placement="bottom" size="s">
                <GlassTag variant="subtle" size="xs">→</GlassTag>
              </Tooltip>
            ) : null}
          </td>
          <AreaCell areaId={row.areaId} areaTitle={areaTitle} areaColor={areaColor} onToggleArea={onToggleArea} />
          <td className={`${css.td} ${css.colTask}`}>
            <span className={css.muted}>{areaTitle}</span>
            <span className={css.muted}> · свёрнуто</span>
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
        <tr>
          <td className={`${css.td} ${css.colCarry}`}>
            {m && hasRelevantHistory(m.pastEventTypes) ? (
              <Tooltip content="Есть события в прошлых неделях (выбранных типов)" placement="bottom" size="s">
                <GlassTag variant="subtle" size="xs">←</GlassTag>
              </Tooltip>
            ) : null}
          </td>
          {renderDayCells(daysHeader, m, false, renderEventTooltip)}
          <td className={`${css.td} ${css.colFuture}`}>
            {m && hasRelevantHistory(m.futureEventTypes) ? (
              <Tooltip content="Есть события в будущих неделях (выбранных типов)" placement="bottom" size="s">
                <GlassTag variant="subtle" size="xs">→</GlassTag>
              </Tooltip>
            ) : null}
          </td>
          <AreaCell areaId={row.areaId} areaTitle={areaTitle} areaColor={areaColor} onToggleArea={onToggleArea} />
          <td className={`${css.td} ${css.colTask}`}>
            <div className={css.folderRowInner} style={{ paddingLeft: `calc(var(--tree-indent) * ${row.depth + 1})` }}>
              <GlassButton
                type="button"
                variant="subtle"
                size="xs"
                className={css.folderChevronBtn}
                aria-expanded={expanded}
                aria-label={expanded ? 'Свернуть папку' : 'Развернуть папку'}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFolder(row.folderId);
                }}
              >
                <ChevronDownIcon width={14} height={14} className={expanded ? css.folderChevronExpanded : css.folderChevron} />
              </GlassButton>
              <FolderCardLink
                folder={{
                  id: row.folderId,
                  title: row.title,
                  tasksCount: row.tasksCount,
                  subfoldersCount: row.subfoldersCount,
                  customColor: row.customColor ?? undefined,
                }}
                style={folderStyle}
                dataCustomColor={!!row.customColor}
              />
            </div>
          </td>
        </tr>
      );
    }

    const taskRow = row.row;
    return (
      <tr>
        <td className={`${css.td} ${css.colCarry}`}>
          {hasRelevantHistory(taskRow.pastEventTypes) ? (
            <Tooltip content="Есть события в прошлых неделях (выбранных типов)" placement="bottom" size="s">
              <GlassTag variant="subtle" size="xs">←</GlassTag>
            </Tooltip>
          ) : null}
        </td>
        {renderDayCells(daysHeader, {
          days: taskRow.days,
          carryWeeks: taskRow.carryWeeks,
          hasFutureActivities: taskRow.hasFutureActivities,
          pastEventTypes: taskRow.pastEventTypes,
          futureEventTypes: taskRow.futureEventTypes,
        }, true, renderEventTooltip, (date, e) =>
          onTaskDayClick(taskRow.task, date, e)
        )}
        <td className={`${css.td} ${css.colFuture}`}>
          {hasRelevantHistory(taskRow.futureEventTypes) ? (
            <Tooltip content="Есть события в будущих неделях (выбранных типов)" placement="bottom" size="s">
              <GlassTag variant="subtle" size="xs">→</GlassTag>
            </Tooltip>
          ) : null}
        </td>
        <AreaCell areaId={row.areaId} areaTitle={areaTitle} areaColor={areaColor} onToggleArea={onToggleArea} />
        <td className={`${css.td} ${css.colTask}`}>
          <div style={{ paddingLeft: `calc(var(--tree-indent) * ${row.depth + 1})` }}>
            <TaskCardLink
              task={taskRow.task}
              onClick={(e) => onTaskOpen(taskRow.taskId, e)}
              className={css.taskCell}
              variant="text"
            />
          </div>
        </td>
      </tr>
    );
  }
);
