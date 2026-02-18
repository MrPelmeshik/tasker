import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useDroppable } from '@dnd-kit/core';
import type { DaySchedules } from './useCalendarData';
import { CalendarScheduleEntry } from './CalendarScheduleEntry';
import { DAY_START_HOUR, DAY_END_HOUR, TOTAL_HOURS, HOUR_HEIGHT, formatHour, formatDayHeader } from './calendarUtils';
import css from '../../../../styles/task-calendar.module.css';

export interface CalendarGridProps {
  daySchedules: DaySchedules[];
  weekDays: Date[];
  hourHeight: number;
  onClickEntry: (taskId: string) => void;
  onRefetch: () => void;
  onEdgeDrag?: (direction: 'prev' | 'next', scheduleId: string, startAt: string, endAt: string) => void;
}

const hours = Array.from({ length: DAY_END_HOUR - DAY_START_HOUR }, (_, i) => DAY_START_HOUR + i);

/** Один droppable слот часа */
const TimeSlotCell: React.FC<{ dateIso: string; hour: number }> = ({ dateIso, hour }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `calendar-slot-${dateIso}-${hour}`,
    data: { type: 'calendar-slot', date: dateIso, hour },
  });

  return (
    <div
      ref={setNodeRef}
      className={`${css.timeSlot}${isOver ? ` ${css.timeSlotOver}` : ''}`}
      data-date={dateIso}
      data-hour={hour}
    />
  );
};

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  daySchedules,
  weekDays,
  hourHeight,
  onClickEntry,
  onRefetch,
  onEdgeDrag,
}) => {
  const headerRef = useRef<HTMLDivElement | null>(null);
  const gridWrapperRef = useRef<HTMLDivElement | null>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [dragTargetDay, setDragTargetDay] = useState<number | null>(null);
  const [dragState, setDragState] = useState<{ id: string; start: Date; end: Date } | null>(null);
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);

  useEffect(() => {
    if (!headerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setHeaderHeight(entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height);
      }
    });
    ro.observe(headerRef.current);
    return () => ro.disconnect();
  }, []);

  const handleDragDayChange = useCallback((dayIndex: number | null) => {
    setDragTargetDay(dayIndex);
  }, []);

  const handleVisualChange = useCallback((id: string | null, start?: Date, end?: Date) => {
    if (!id || !start || !end) {
      setDragState(null);
    } else {
      setDragState({ id, start, end });
    }
  }, []);

  /** Общая высота колонки (все часы) */
  const columnHeight = TOTAL_HOURS * hourHeight;

  /** CSS-переменная для динамической высоты слотов */
  const gridStyle = { '--hour-height': `${hourHeight}px` } as React.CSSProperties;

  return (
    <div className={css.gridWrapper} ref={gridWrapperRef} style={gridStyle}>
      <div className={css.calendarGrid}>
        <div className={css.cornerCell} ref={headerRef} />
        {daySchedules.map((ds, i) => (
          <div
            key={ds.dateIso}
            className={`${css.dayHeader}${dragTargetDay === i ? ` ${css.dayHeaderHighlight}` : ''}`}
          >
            {formatDayHeader(ds.date)}
          </div>
        ))}

        {hours.map((hour) => (
          <React.Fragment key={hour}>
            <div className={css.timeLabel}>{formatHour(hour)}</div>
            {daySchedules.map((ds) => (
              <TimeSlotCell key={`${ds.dateIso}-${hour}`} dateIso={ds.dateIso} hour={hour} />
            ))}
          </React.Fragment>
        ))}
      </div>

      <div className={css.overlayContainer}>
        <div className={css.overlayGrid}>
          <div className={css.overlayCorner} style={{ height: headerHeight || undefined }} />
          {daySchedules.map((ds, i) => (
            <div key={ds.dateIso} className={css.dayColumn} style={{ height: columnHeight, gridRow: 2, gridColumn: i + 2 }}>
              {ds.entries.map((entry) => (
                <CalendarScheduleEntry
                  key={entry.id}
                  entry={entry}
                  dayDate={ds.date}
                  overlap={ds.overlapMap.get(entry.id) ?? { column: 0, totalColumns: 1 }}
                  weekDays={weekDays}
                  hourHeight={hourHeight}
                  gridRef={gridWrapperRef}
                  onClickEntry={onClickEntry}
                  onRefetch={onRefetch}
                  onDragDayChange={handleDragDayChange}
                  onEdgeDrag={onEdgeDrag}
                  onVisualChange={handleVisualChange}
                  isHovered={entry.taskId === hoveredTaskId}
                  onHover={setHoveredTaskId}
                />
              ))}
              {/* Ghost rendering */}
              {dragState && (
                <GhostEntry
                  dragState={dragState}
                  dayDate={ds.date}
                  hourHeight={hourHeight}
                  originalEntries={ds.entries}
                  overlapMap={ds.overlapMap}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/** Компонент-призрак для визуализации предполагаемого места приземления блока */
const GhostEntry: React.FC<{
  dragState: { id: string; start: Date; end: Date };
  dayDate: Date;
  hourHeight: number;
  originalEntries: any[];
  overlapMap: Map<string, any>;
}> = ({ dragState, dayDate, hourHeight }) => {
  const { start, end } = dragState;
  const dayStart = new Date(dayDate);
  dayStart.setHours(DAY_START_HOUR, 0, 0, 0);
  const dayEnd = new Date(dayDate);
  dayEnd.setHours(DAY_START_HOUR + TOTAL_HOURS, 0, 0, 0);

  // Проверяем пересечение призрака с этим днём
  if (end <= dayStart || start >= dayEnd) return null;

  // Ограничиваем start/end границами дня
  const visualStart = start < dayStart ? dayStart : start;
  const visualEnd = end > dayEnd ? dayEnd : end;

  // Используем разницу в миллисекундах от начала дня, чтобы корректно обработать 24:00
  // (setHours(24) переносит Date на следующий день, getHours() вернёт 0)
  const sH = (visualStart.getTime() - dayStart.getTime()) / 3600000;
  const eH = (visualEnd.getTime() - dayStart.getTime()) / 3600000;

  const top = sH * hourHeight;
  const height = (eH - sH) * hourHeight;

  if (height <= 0) return null;

  return (
    <div
      className={css.dragGhost}
      style={{
        top: `${top}px`,
        height: `${height}px`,
        left: 'var(--space-2)',
        width: 'calc(100% - var(--space-4))',
      }}
    />
  );
};
