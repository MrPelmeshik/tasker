import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GlassWidget, GlassButton } from '../../../../components';
import { TableIcon } from '../../../../components/icons';
import { Loader } from '../../../../components/ui/Loader';
import type { WidgetSizeProps } from '../../../../types';
import { useModal, useToast, useTaskUpdate } from '../../../../context';
import { useWeek } from '../../../../hooks';
import { formatDateOnly } from '../../../../utils/date';
import { getWeekEndIso } from '../../../../utils/week';
import { fetchTaskById, fetchAreaShortCard, updateTask, deleteTask, updateSchedule } from '../../../../services/api';
import { TOTAL_HOURS, HOUR_HEIGHT } from './calendarUtils';
import { useCalendarData } from './useCalendarData';
import { CalendarGrid } from './CalendarGrid';
import css from '../../../../styles/task-calendar.module.css';

/** Минимальная высота одного часового слота */
const MIN_HOUR_HEIGHT = 16;

export interface TaskCalendarProps extends WidgetSizeProps {
  onViewModeChange?: (mode: 'table') => void;
  refetchRef?: React.MutableRefObject<(() => void) | null>;
}

export const TaskCalendar: React.FC<TaskCalendarProps> = ({ colSpan, rowSpan, onViewModeChange, refetchRef }) => {
  const { weekStartIso, go, set: setWeekStart } = useWeek();
  const { openTaskModal } = useModal();
  const { showError } = useToast();
  const { subscribeToTaskUpdates } = useTaskUpdate();

  /** Динамическая высота часового слота, вычисляемая от доступной высоты */
  const gridContainerRef = useRef<HTMLDivElement | null>(null);
  const toolbarRef = useRef<HTMLDivElement | null>(null);
  const [hourHeight, setHourHeight] = useState(HOUR_HEIGHT);

  useEffect(() => {
    const container = gridContainerRef.current;
    if (!container) return;

    const compute = () => {
      const containerRect = container.getBoundingClientRect();
      // Высота заголовка дней (~32px) — берём из первого .dayHeader
      const headerEls = container.querySelectorAll('[class*="dayHeader"]');
      const headerH = headerEls.length > 0 ? headerEls[0].getBoundingClientRect().height : 32;
      const available = containerRect.height - headerH;
      const hh = Math.floor(Math.max(MIN_HOUR_HEIGHT, available / TOTAL_HOURS));
      setHourHeight(hh);
    };

    const ro = new ResizeObserver(() => compute());
    ro.observe(container);
    // Первый расчёт сразу
    compute();
    return () => ro.disconnect();
  }, []);

  const { daySchedules, days, loading, refetch } = useCalendarData(weekStartIso, hourHeight);

  useEffect(() => {
    if (refetchRef) refetchRef.current = refetch;
    return () => { if (refetchRef) refetchRef.current = null; };
  }, [refetchRef, refetch]);

  const refetchLatest = useRef(refetch);
  refetchLatest.current = refetch;

  useEffect(() => {
    return subscribeToTaskUpdates(() => {
      refetchLatest.current();
    });
  }, [subscribeToTaskUpdates]);

  const dateRangeLabel = `${formatDateOnly(weekStartIso)} – ${formatDateOnly(getWeekEndIso(weekStartIso))}`;

  const handleClickEntry = useCallback(async (taskId: string) => {
    try {
      const task = await fetchTaskById(taskId);
      if (!task) return;
      const areasData = await fetchAreaShortCard();
      const areas = areasData.map((a) => ({ id: a.id, title: a.title }));
      openTaskModal(
        task,
        'edit',
        async (data, id) => {
          if (!id) return;
          await updateTask(id, data);
          refetchLatest.current();
        },
        async (id) => {
          await deleteTask(id);
          refetchLatest.current();
        },
        undefined,
        undefined,
        areas,
      );
    } catch (e) {
      showError(e);
    }
  }, [openTaskModal, showError]);

  const handleEdgeDrag = useCallback(async (
    direction: 'prev' | 'next',
    scheduleId: string,
    startAt: string,
    endAt: string,
  ) => {
    try {
      await updateSchedule(scheduleId, { startAt, endAt });
      go(direction === 'prev' ? 'prev' : 'next');
    } catch (e) {
      showError(e);
    }
  }, [go, showError]);

  return (
    <GlassWidget colSpan={colSpan} rowSpan={rowSpan}>
      <div className={css.container}>
        <div className={css.toolbar} ref={toolbarRef}>
          <span className={css.weekLabel}>Неделя</span>
          <GlassButton size="s" variant="subtle" onClick={() => go('prev')}>Предыдущая</GlassButton>
          <GlassButton size="s" variant="subtle" onClick={() => go('current')}>Текущая</GlassButton>
          <GlassButton size="s" variant="subtle" onClick={() => go('next')}>Следующая</GlassButton>
          <div className={css.spacer} />
          <span className={css.muted}>{dateRangeLabel}</span>
          {onViewModeChange && (
            <GlassButton size="s" variant="subtle" onClick={() => onViewModeChange('table')} aria-label="Таблица">
              <TableIcon width={16} height={16} />
            </GlassButton>
          )}
        </div>

        <div className={css.gridArea} ref={gridContainerRef}>
          {loading ? (
            <div className={css.loaderWrap}>
              <Loader size="s" />
            </div>
          ) : (
            <CalendarGrid
              daySchedules={daySchedules}
              weekDays={days}
              hourHeight={hourHeight}
              onClickEntry={handleClickEntry}
              onRefetch={refetch}
              onEdgeDrag={handleEdgeDrag}
            />
          )}
        </div>
      </div>
    </GlassWidget>
  );
};
