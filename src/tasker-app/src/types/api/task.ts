// Типы для Task API

export interface TaskCreateRequest {
  title: string;
  description?: string;
  areaId: string;
  folderId?: string | null;
  status: number;
}

export interface TaskUpdateRequest {
  title: string;
  description?: string;
  areaId: string;
  folderId?: string | null;
  status: number;
}

export interface TaskResponse {
  id: string;
  title: string;
  description?: string;
  areaId: string;
  folderId?: string | null;
  status: number;
  ownerUserId: string;
  ownerUserName?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  deactivatedAt?: Date;
}

export interface TaskCreateResponse {
  taskId: string;
}

export interface TaskSummaryResponse {
  id: string;
  title: string;
  description?: string;
  status: number;
  areaId: string;
  folderId?: string | null;
  ownerUserName: string;
  createdAt: Date;
  updatedAt: Date;
}

// Типы для недельной активности задач
export interface TaskWeeklyActivity {
  taskId: string;
  taskName: string;
  carryWeeks: number;
  hasFutureActivities: boolean;
  days: TaskDayActivity[];
}

export interface TaskDayActivity {
  date: string;
  count: number;
  events?: { id: string; eventType: number }[];
}

/** Запрос на получение задач с активностями (отражение backend) */
export interface TaskWithActivitiesFilterRequest {
  dateFrom: string;
  dateTo: string;
  statuses?: number[];
  includeTasksWithActivitiesInRange?: boolean;
  page?: number;
  limit?: number;
}

/** Карточка задачи с активностями по дням для отображения в таблице */
export interface TaskWithActivitiesResponse {
  taskId: string;
  taskName: string;
  status: number;
  areaId: string;
  areaTitle?: string | null;
  folderId?: string | null;
  carryWeeks: number;
  hasFutureActivities: boolean;
  days: TaskDayActivity[];
  pastEventTypes: number[];
  futureEventTypes: number[];
}

/** Ответ со списком задач и метаданными пагинации */
export interface TaskWithActivitiesPagedResponse {
  items: TaskWithActivitiesResponse[];
  totalCount: number;
  page?: number | null;
  limit?: number | null;
}
