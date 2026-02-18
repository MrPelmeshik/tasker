import { useMemo } from 'react';
import { useWeekSchedules } from '../../../../hooks/useSchedules';
import type { TaskScheduleResponse } from '../../../../types/api';
import { getWeekDays, toDateIso, computeOverlapLayout, HOUR_HEIGHT, type OverlapInfo } from './calendarUtils';

export interface DaySchedules {
  date: Date;
  dateIso: string;
  entries: TaskScheduleResponse[];
  overlapMap: Map<string, OverlapInfo>;
}

/**
 * Хук загрузки и группировки расписаний за неделю по дням.
 */
export function useCalendarData(weekStartIso: string, hourHeight: number = HOUR_HEIGHT) {
  const { schedules, loading, error, refetch } = useWeekSchedules(weekStartIso);

  const days = useMemo(() => getWeekDays(weekStartIso), [weekStartIso]);

  const daySchedules: DaySchedules[] = useMemo(() => {
    return days.map((date) => {
      const dateIso = toDateIso(date);
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const entries = schedules.filter((s) => {
        const start = new Date(s.startAt);
        const end = new Date(s.endAt);
        return start < dayEnd && end > dayStart;
      });

      const overlapMap = computeOverlapLayout(entries, date, hourHeight);

      return { date, dateIso, entries, overlapMap };
    });
  }, [days, schedules, hourHeight]);

  return { daySchedules, days, loading, error, refetch };
}
