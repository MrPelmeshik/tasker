import { buildWeekDates, getWeekEndIso } from '../../../utils/week';
import type { TaskWithActivitiesFilterRequest } from '../../../types/api';
import type { TaskStatus } from '../../../types/task-status';

/**
 * Фильтр для получения задач с активностями
 */
export interface TaskWithActivitiesFilter {
  dateFrom: string;
  dateTo: string;
  statuses?: TaskStatus[];
  includeTasksWithActivitiesInRange?: boolean;
  page?: number;
  limit?: number;
}

/**
 * Вычисляет dateFrom и dateTo по ISO-дате понедельника
 * @param weekStartIso ISO-строка понедельника (YYYY-MM-DD)
 */
export function dateRangeFromWeek(weekStartIso: string): { dateFrom: string; dateTo: string } {
  const dates = buildWeekDates(weekStartIso);
  return {
    dateFrom: dates[0] ?? weekStartIso,
    dateTo: getWeekEndIso(weekStartIso),
  };
}

/**
 * Собирает объект фильтра для API.
 * В результат включаются только переданные поля (page/limit только если указаны).
 */
export function buildTaskWithActivitiesFilter(
  options: TaskWithActivitiesFilter
): TaskWithActivitiesFilterRequest {
  const result: TaskWithActivitiesFilterRequest = {
    dateFrom: options.dateFrom,
    dateTo: options.dateTo,
  };
  if (options.statuses !== undefined && options.statuses.length > 0) {
    result.statuses = options.statuses;
  }
  if (options.includeTasksWithActivitiesInRange !== undefined) {
    result.includeTasksWithActivitiesInRange = options.includeTasksWithActivitiesInRange;
  }
  if (options.page !== undefined) {
    result.page = options.page;
  }
  if (options.limit !== undefined) {
    result.limit = options.limit;
  }
  return result;
}
