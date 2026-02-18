import React, { useCallback, useRef, useState } from 'react';
import type { TaskScheduleResponse } from '../../../../types/api';
import { updateSchedule, deleteSchedule } from '../../../../services/api';
import {
  getEntryPosition, pixelToTime, snapPixel, snapStep,
  DAY_START_HOUR, TOTAL_HOURS, SNAP_MINUTES,
  type OverlapInfo,
} from './calendarUtils';
import { hexToRgb } from '../../../../utils/color';
import { XIcon } from '../../../../components/icons';
import { ConfirmModal } from '../../../../components/common/ConfirmModal';
import css from '../../../../styles/task-calendar.module.css';

type DragMode = 'move' | 'resize-top' | 'resize-bottom' | 'resize-right';

export interface CalendarScheduleEntryProps {
  entry: TaskScheduleResponse;
  dayDate: Date;
  overlap: OverlapInfo;
  weekDays: Date[];
  hourHeight: number;
  gridRef: React.RefObject<HTMLDivElement | null>;
  onClickEntry: (taskId: string) => void;
  onRefetch: () => void;
  onDragDayChange?: (targetDayIndex: number | null) => void;
  /** Вызывается при перетаскивании блока к краю — переключение недели */
  onEdgeDrag?: (direction: 'prev' | 'next', scheduleId: string, startAt: string, endAt: string) => void;
  /** Вызывается для обновления визуального состояния при перетаскивании (ghost) */
  onVisualChange?: (id: string | null, start?: Date, end?: Date) => void;
  /** Является ли этот блок (или его часть) под курсором */
  isHovered?: boolean;
  /** Обработчик наведения */
  onHover?: (taskId: string | null) => void;
}

const EDGE_THRESHOLD = 40; // px от края для переключения недели
const EDGE_DEBOUNCE = 600; // ms перед переключением

export const CalendarScheduleEntry: React.FC<CalendarScheduleEntryProps> = ({
  entry,
  dayDate,
  overlap,
  weekDays,
  hourHeight,
  gridRef,
  onClickEntry,
  onRefetch,
  onDragDayChange,
  onEdgeDrag,
  onVisualChange,
  isHovered,
  onHover,
}) => {
  const startAt = new Date(entry.startAt);
  const endAt = new Date(entry.endAt);
  const { top, height } = getEntryPosition(startAt, endAt, dayDate, hourHeight);

  const [interacting, setInteracting] = useState(false);
  const [offsetTop, setOffsetTop] = useState(top);
  const [offsetHeight, setOffsetHeight] = useState(height);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const dragRef = useRef<{
    startY: number;
    origTop: number;
    origHeight: number;
    mode: DragMode;
    targetDayIndex: number;
    edgeTimer: ReturnType<typeof setTimeout> | null;
    edgeTriggered: boolean;
  } | null>(null);
  const posRef = useRef({ top, height });
  const didDrag = useRef(false);
  const currentDayIndex = weekDays.findIndex((d) => d.getTime() === dayDate.getTime());

  /** Минимальная высота блока в пикселях (1 шаг snap) */
  const minHeight = snapStep(hourHeight);

  const handleClick = (e: React.MouseEvent) => {
    if (didDrag.current) return;
    e.stopPropagation();
    onClickEntry(entry.taskId);
  };

  /** Открыть модал подтверждения удаления */
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmOpen(true);
  };

  /** Подтвердить удаление */
  const handleDeleteConfirm = async () => {
    setConfirmOpen(false);
    await deleteSchedule(entry.id);
    onRefetch();
  };

  const getDayIndexFromX = useCallback((clientX: number): number => {
    if (!gridRef.current) return currentDayIndex;
    const columns = gridRef.current.querySelectorAll<HTMLElement>(`.${css.dayColumn}`);
    for (let i = 0; i < columns.length; i++) {
      const rect = columns[i].getBoundingClientRect();
      if (clientX >= rect.left && clientX <= rect.right) return i;
    }
    if (columns.length > 0) {
      const firstRect = columns[0].getBoundingClientRect();
      if (clientX < firstRect.left) return -1;
      return 7;
    }
    return currentDayIndex;
  }, [gridRef, currentDayIndex]);

  const isInsideCalendar = useCallback((clientX: number, clientY: number): boolean => {
    if (!gridRef.current) return false;
    const rect = gridRef.current.getBoundingClientRect();
    return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
  }, [gridRef]);

  const getEdgeDirection = useCallback((clientX: number): 'prev' | 'next' | null => {
    if (!gridRef.current) return null;
    const columns = gridRef.current.querySelectorAll<HTMLElement>(`.${css.dayColumn}`);
    if (columns.length === 0) return null;
    const firstRect = columns[0].getBoundingClientRect();
    const lastRect = columns[columns.length - 1].getBoundingClientRect();
    if (clientX < firstRect.left + EDGE_THRESHOLD) return 'prev';
    if (clientX > lastRect.right - EDGE_THRESHOLD) return 'next';
    return null;
  }, [gridRef]);

  const commitChanges = useCallback(async (targetDayIdx: number, mode?: DragMode) => {
    const { top: newTop, height: newHeight } = posRef.current;

    // Вычисляем время на целевом дне
    const startMinutes = pixelToTime(newTop, hourHeight);
    const endMinutes = pixelToTime(newTop + newHeight, hourHeight);

    const clampedIdx = Math.max(0, Math.min(targetDayIdx, weekDays.length - 1));
    const targetDay = weekDays[clampedIdx] ?? dayDate;

    // Новое время начала в рамках целевого дня
    const newTargetStart = new Date(targetDay);
    newTargetStart.setHours(DAY_START_HOUR, 0, 0, 0);
    newTargetStart.setMinutes(newTargetStart.getMinutes() + startMinutes);

    // Новое время конца в рамках целевого дня
    const newTargetEnd = new Date(targetDay);
    newTargetEnd.setHours(DAY_START_HOUR, 0, 0, 0);
    newTargetEnd.setMinutes(newTargetEnd.getMinutes() + endMinutes);

    let finalStart = startAt;
    let finalEnd = endAt;

    if (mode === 'resize-top') {
      // Меняется только начало
      finalStart = newTargetStart;
      // Если конец был дальше текущего дня, сохраняем его
      if (endAt > newTargetEnd) {
        finalEnd = endAt;
      } else {
        finalEnd = newTargetEnd;
      }
    } else if (mode === 'resize-bottom') {
      // Меняется только конец
      finalEnd = newTargetEnd;
      // Если начало было раньше текущего дня, сохраняем его
      if (startAt < newTargetStart) {
        finalStart = startAt;
      } else {
        finalStart = newTargetStart;
      }
    } else if (mode === 'resize-right') {
      // Меняется только ДЕНЬ конца, время конца сохраняется (или берется из текущей высоты?)
      // Логика: мы перетащили на targetDay. Значит endAt должен стать targetDay + (время конца по высоте блока).
      // Но высота блока не менялась визуально по Y, значит время конца то же.

      // Берем targetDay, но время из endAt (оригинального) или из текущего визуального end?
      // Визуально мы не меняли высоту, значит endMinutes те же, что и были.
      // ИЛИ: мы просто продлили до targetDay с тем же временем.

      const newEndDate = new Date(targetDay);
      // Сохраняем часы/минуты оригинального конца, если они не выходят за рамки дня?
      // Или берем текущее визуальное положение низа?
      // Визуальное положение низа (pixelToTime) отражает время на ЭТОМ дне.
      newEndDate.setHours(DAY_START_HOUR, 0, 0, 0);
      newEndDate.setMinutes(newEndDate.getMinutes() + endMinutes);

      finalEnd = newEndDate;

      // Если дата начала позже нового конца, что делать? (ресайз влево, "инверсия")
      // В текущей реализации мы не меняем startAt.
      if (startAt > finalEnd) {
        // Мы перетащили конец влево за начало.
        // Можно либо запретить, либо поменять местами (сделать startAt = finalEnd, endAt = startAt).
        // Проще ограничить: finalEnd = max(startAt + minDuration, finalEnd)
        if (finalEnd < startAt) {
          finalEnd = new Date(startAt.getTime() + 15 * 60000); // +15 мин минимум
        }
      }
    } else {
      // Move - сдвигаем всё событие на дельту
      // Определяем "визуальное начало" этого куска на исходном дне, за который схватили
      const currentDayStart = new Date(dayDate);
      currentDayStart.setHours(DAY_START_HOUR, 0, 0, 0);

      const originalVisualStart = startAt < currentDayStart ? currentDayStart : startAt;
      const delta = newTargetStart.getTime() - originalVisualStart.getTime();

      finalStart = new Date(startAt.getTime() + delta);
      finalEnd = new Date(endAt.getTime() + delta);
    }

    if (finalStart.getTime() !== startAt.getTime() || finalEnd.getTime() !== endAt.getTime()) {
      await updateSchedule(entry.id, {
        startAt: finalStart.toISOString(),
        endAt: finalEnd.toISOString(),
      });
      onRefetch();
    }
  }, [weekDays, dayDate, startAt, endAt, entry.id, onRefetch, hourHeight]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, mode: DragMode) => {
      e.stopPropagation();
      e.preventDefault();
      didDrag.current = false;
      setInteracting(true);
      dragRef.current = {
        startY: e.clientY,
        origTop: top,
        origHeight: height,
        mode,
        targetDayIndex: currentDayIndex,
        edgeTimer: null,
        edgeTriggered: false,
      };
      posRef.current = { top, height };
      const target = e.currentTarget as HTMLElement;
      target.setPointerCapture(e.pointerId);

      const clearEdgeTimer = () => {
        if (dragRef.current?.edgeTimer) {
          clearTimeout(dragRef.current.edgeTimer);
          dragRef.current.edgeTimer = null;
        }
      };

      const maxPixel = TOTAL_HOURS * hourHeight;

      const onMove = (ev: PointerEvent) => {
        if (!dragRef.current || dragRef.current.edgeTriggered) return;
        didDrag.current = true;
        const diff = ev.clientY - dragRef.current.startY;

        if (dragRef.current.mode === 'move') {
          const rawTop = dragRef.current.origTop + diff;
          const snappedTop = snapPixel(rawTop, hourHeight);
          // Для multi-day блоков origHeight может быть огромным (весь видимый отрезок на дне),
          // поэтому ограничиваем только по minHeight — итоговый сдвиг вычисляется как delta в commitChanges
          const clampedTop = Math.max(0, Math.min(snappedTop, maxPixel - minHeight));
          posRef.current = { top: clampedTop, height: dragRef.current.origHeight };
          setOffsetTop(clampedTop);
          setOffsetHeight(dragRef.current.origHeight);

          const dayIdx = getDayIndexFromX(ev.clientX);
          const clampedIdx = Math.max(0, Math.min(dayIdx, 6));
          if (clampedIdx !== dragRef.current.targetDayIndex) {
            dragRef.current.targetDayIndex = clampedIdx;
            onDragDayChange?.(clampedIdx);
          }

          // Calculate phantom times
          const startMinutes = pixelToTime(clampedTop, hourHeight);
          const targetDay = weekDays[clampedIdx] ?? dayDate;

          const ns = new Date(targetDay);
          ns.setHours(DAY_START_HOUR, 0, 0, 0);
          ns.setMinutes(ns.getMinutes() + startMinutes);

          const duration = endAt.getTime() - startAt.getTime();
          const ne = new Date(ns.getTime() + duration);

          onVisualChange?.(entry.id, ns, ne);

          // Определение края для переключения недели
          const edgeDir = getEdgeDirection(ev.clientX);
          if (edgeDir && onEdgeDrag) {
            if (!dragRef.current.edgeTimer) {
              dragRef.current.edgeTimer = setTimeout(() => {
                if (!dragRef.current) return;
                dragRef.current.edgeTriggered = true;
                const { top: curTop, height: curHeight } = posRef.current;
                const sMin = pixelToTime(curTop, hourHeight);
                const eMin = pixelToTime(curTop + curHeight, hourHeight);
                const baseDay = edgeDir === 'prev' ? weekDays[0] : weekDays[6];
                const targetDay = new Date(baseDay);
                targetDay.setDate(targetDay.getDate() + (edgeDir === 'prev' ? -1 : 1));
                const ns = new Date(targetDay);
                ns.setHours(DAY_START_HOUR, 0, 0, 0);
                ns.setMinutes(ns.getMinutes() + sMin);
                const ne = new Date(targetDay);
                ne.setHours(DAY_START_HOUR, 0, 0, 0);
                ne.setMinutes(ne.getMinutes() + eMin);

                target.removeEventListener('pointermove', onMove);
                target.removeEventListener('pointerup', onUp);
                target.removeEventListener('pointercancel', onUp);
                setInteracting(false);
                onDragDayChange?.(null);
                onVisualChange?.(null);

                onEdgeDrag(edgeDir, entry.id, ns.toISOString(), ne.toISOString());
              }, EDGE_DEBOUNCE);
            }
          } else {
            clearEdgeTimer();
          }
        } else if (dragRef.current.mode === 'resize-bottom') {
          const rawHeight = dragRef.current.origHeight + diff;
          const snappedBottom = snapPixel(dragRef.current.origTop + rawHeight, hourHeight);
          const newHeight = Math.max(minHeight, Math.min(snappedBottom - dragRef.current.origTop, maxPixel - dragRef.current.origTop));
          posRef.current = { top: dragRef.current.origTop, height: newHeight };
          setOffsetTop(dragRef.current.origTop);
          setOffsetHeight(newHeight);

          // Track target day index
          const dayIdx = getDayIndexFromX(ev.clientX);
          const clampedIdx = Math.max(0, Math.min(dayIdx, 6));
          if (clampedIdx !== dragRef.current.targetDayIndex) {
            dragRef.current.targetDayIndex = clampedIdx;
            onDragDayChange?.(clampedIdx);
          }

          // Calculate phantom times
          const targetDay = weekDays[clampedIdx] ?? dayDate;
          const endMinutes = pixelToTime(dragRef.current.origTop + newHeight, hourHeight);

          const targetEnd = new Date(targetDay);
          targetEnd.setHours(DAY_START_HOUR, 0, 0, 0);
          targetEnd.setMinutes(targetEnd.getMinutes() + endMinutes);

          let projectedEnd = targetEnd;
          if (projectedEnd < startAt) {
            projectedEnd = new Date(startAt.getTime() + 15 * 60000);
          }

          onVisualChange?.(entry.id, startAt, projectedEnd);
        } else if (dragRef.current.mode === 'resize-right') {
          // Горизонтальный ресайз (изменение дня окончания)
          const dayIdx = getDayIndexFromX(ev.clientX);
          const clampedIdx = Math.max(0, Math.min(dayIdx, 6));
          if (clampedIdx !== dragRef.current.targetDayIndex) {
            dragRef.current.targetDayIndex = clampedIdx;
            onDragDayChange?.(clampedIdx);
          }

          // Calculate phantom times
          const targetDay = weekDays[clampedIdx] ?? dayDate;

          const origEndHours = endAt.getHours();
          const origEndMinutes = endAt.getMinutes();

          const pe = new Date(targetDay);
          pe.setHours(origEndHours, origEndMinutes, 0, 0);

          let projectedEnd = pe;
          if (projectedEnd < startAt) {
            projectedEnd = new Date(startAt.getTime() + 15 * 60000);
          }

          onVisualChange?.(entry.id, startAt, projectedEnd);
        } else {
          // resize-top
          const rawTop = dragRef.current.origTop + diff;
          const snappedTop = snapPixel(rawTop, hourHeight);
          const origBottom = dragRef.current.origTop + dragRef.current.origHeight;
          const maxTop = origBottom - minHeight;
          const newTop = Math.max(0, Math.min(snappedTop, maxTop));
          const newHeight = origBottom - newTop;
          posRef.current = { top: newTop, height: newHeight };
          setOffsetTop(newTop);
          setOffsetHeight(newHeight);

          // Track target day index
          const dayIdx = getDayIndexFromX(ev.clientX);
          const clampedIdx = Math.max(0, Math.min(dayIdx, 6));
          if (clampedIdx !== dragRef.current.targetDayIndex) {
            dragRef.current.targetDayIndex = clampedIdx;
            onDragDayChange?.(clampedIdx);
          }

          // Calculate phantom times
          const targetDay = weekDays[clampedIdx] ?? dayDate;
          const startMinutes = pixelToTime(newTop, hourHeight);

          const ps = new Date(targetDay);
          ps.setHours(DAY_START_HOUR, 0, 0, 0);
          ps.setMinutes(ps.getMinutes() + startMinutes);

          let projectedStart = ps;
          const projectedEnd = endAt; // Preserve original end

          if (projectedStart > projectedEnd) {
            projectedStart = new Date(projectedEnd.getTime() - 15 * 60000);
          }

          onVisualChange?.(entry.id, projectedStart, projectedEnd);
        }
      };

      const onUp = async (ev: PointerEvent) => {
        clearEdgeTimer();
        target.removeEventListener('pointermove', onMove);
        target.removeEventListener('pointerup', onUp);
        target.removeEventListener('pointercancel', onUp);
        const targetDayIdx = dragRef.current?.targetDayIndex ?? currentDayIndex;
        const edgeTriggered = dragRef.current?.edgeTriggered ?? false;

        // Save mode before clearing ref
        const mode = dragRef.current?.mode;

        dragRef.current = null;
        setInteracting(false);
        onDragDayChange?.(null);
        onVisualChange?.(null); // Clear ghost

        if (edgeTriggered) return;
        if (!didDrag.current) return;

        if (!isInsideCalendar(ev.clientX, ev.clientY)) return;

        await commitChanges(targetDayIdx, mode);
      };

      target.addEventListener('pointermove', onMove);
      target.addEventListener('pointerup', onUp);
      target.addEventListener('pointercancel', onUp);
    },
    [top, height, currentDayIndex, weekDays, hourHeight, minHeight, commitChanges, getDayIndexFromX, getEdgeDirection, isInsideCalendar, onDragDayChange, onEdgeDrag, entry.id],
  );

  const isMultiDay = startAt.getDate() !== endAt.getDate() || startAt.getMonth() !== endAt.getMonth();

  const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
  const dateOptions: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', ...timeOptions };

  const startTime = startAt.toLocaleTimeString('ru-RU', isMultiDay ? dateOptions : timeOptions);
  const endTime = endAt.toLocaleTimeString('ru-RU', isMultiDay ? dateOptions : timeOptions);

  // Overlap layout — размещение в колонках
  // Используем box-sizing: border-box (уже добавлено в CSS)
  const GAP = 2; // Отступ между колонками
  const MARGIN_X = 2; // Отступ от краев основной колонки дня

  // Доступная ширина с учетом внешних отступов
  const availableWidth = `(100% - ${MARGIN_X * 2}px)`;
  // Суммарный объем отступов между колонками
  const totalGapWidth = `(${overlap.totalColumns - 1} * ${GAP}px)`;

  const colWidth = overlap.totalColumns > 1
    ? `calc((${availableWidth} - ${totalGapWidth}) / ${overlap.totalColumns})`
    : `calc(100% - ${MARGIN_X * 2}px)`;

  const colLeft = `calc(${MARGIN_X}px + (${availableWidth} - ${totalGapWidth}) / ${overlap.totalColumns} * ${overlap.column} + ${overlap.column * GAP}px)`;

  const style: React.CSSProperties = {
    top: `${interacting ? offsetTop : top}px`,
    height: `${interacting ? offsetHeight : height}px`,
    cursor: interacting ? 'grabbing' : 'grab',
    left: colLeft,
    width: colWidth,
    opacity: interacting ? 0 : 1, // Hide original item during drag
  };

  if (entry.areaColor) {
    (style as Record<string, string>)['--card-custom-color'] = entry.areaColor;
    (style as Record<string, string>)['--card-custom-color-rgb'] = hexToRgb(entry.areaColor);
  }

  return (
    <>
      <div
        className={`${css.scheduleEntry}${isHovered ? ` ${css.scheduleEntryHovered}` : ''}`}
        style={style}
        onClick={handleClick}
        onPointerDown={(e) => handlePointerDown(e, 'move')}
        onMouseEnter={() => onHover?.(entry.taskId)}
        onMouseLeave={() => onHover?.(null)}
      >
        <div
          className={css.resizeHandleTop}
          onPointerDown={(e) => { e.stopPropagation(); handlePointerDown(e, 'resize-top'); }}
        />
        <div className={css.scheduleTitle}>{entry.taskTitle}</div>
        <div className={css.scheduleTime}>{startTime} – {endTime}</div>
        <button
          className={css.deleteBtn}
          onClick={handleDeleteClick}
          onPointerDown={(e) => e.stopPropagation()}
          aria-label="Удалить"
        >
          <XIcon width={12} height={12} />
        </button>
        <div
          className={css.resizeHandle}
          onPointerDown={(e) => { e.stopPropagation(); handlePointerDown(e, 'resize-bottom'); }}
        />
        {/* Horizontal resize handle */}
        <div
          className={css.resizeHandleRight}
          onPointerDown={(e) => { e.stopPropagation(); handlePointerDown(e, 'resize-right'); }}
        />
      </div>

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmOpen(false)}
        title="Удаление записи"
        message="Удалить запись планирования?"
        confirmText="Удалить"
        cancelText="Отмена"
        variant="danger"
      />
    </>
  );
};
