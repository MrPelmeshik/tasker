// Базовые типы для API
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

// Типы для Area API
export interface AreaCreateRequest {
  title: string;
  description?: string;
}

export interface AreaUpdateRequest {
  title: string;
  description?: string;
}

export interface AreaResponse {
  id: string;
  title: string;
  description?: string;
  ownerUserId: string;
  ownerUserName?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  deactivatedAt?: Date;
}

/** Роли пользователей в области (соответствует backend AreaRole) */
export type AreaRole = 'Owner' | 'Administrator' | 'Executor' | 'Observer';

export interface AddAreaMemberRequest {
  userId?: string;
  login?: string;
  role: AreaRole;
}

export interface AreaMemberResponse {
  userId: string;
  userName: string;
  role: AreaRole;
}

// Типы для Folder API
export interface FolderCreateRequest {
  title: string;
  description?: string;
  areaId: string;
  parentFolderId?: string | null;
}

export interface FolderUpdateRequest {
  title: string;
  description?: string;
  areaId: string;
  parentFolderId?: string | null;
}

export interface FolderResponse {
  id: string;
  title: string;
  description?: string;
  areaId: string;
  parentFolderId?: string | null;
  ownerUserId: string;
  ownerUserName?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  deactivatedAt?: Date;
}

// Типы для Tree виджета
export interface AreaShortCardResponse {
  id: string;
  title: string;
  description?: string;
  foldersCount: number;
  rootTasksCount: number;
  ownerUserName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FolderSummaryResponse {
  id: string;
  title: string;
  description?: string;
  areaId: string;
  parentFolderId?: string | null;
  tasksCount: number;
  subfoldersCount: number;
  ownerUserName: string;
  createdAt: Date;
  updatedAt: Date;
}

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
  folderId?: string | null;
  carryWeeks: number;
  hasFutureActivities: boolean;
  days: TaskDayActivity[];
}

/** Ответ со списком задач и метаданными пагинации */
export interface TaskWithActivitiesPagedResponse {
  items: TaskWithActivitiesResponse[];
  totalCount: number;
  page?: number | null;
  limit?: number | null;
}

// Типы для Events API (активности)
export type EventType = number; // 0=UNKNOWN, 1=CREATE, 2=UPDATE, 3=DELETE, 4=NOTE, 5=ACTIVITY

export interface EventCreateRequest {
  entityId: string;
  title: string;
  description?: string;
  eventType: EventType;
  /** Дата события/активности (обязательное, ISO YYYY-MM-DD) */
  eventDate: string;
}

export interface EventCreateResponse {
  id: string;
}

/** Сообщение события в формате JSON (могут быть old/new, title/description, text и т.д.) */
export type EventMessage = Record<string, unknown> | null;

export interface EventResponse {
  id: string;
  title: string;
  message?: EventMessage;
  eventType: string;
  ownerUserId: string;
  createdAt: Date;
  /** Дата события/активности */
  eventDate: Date;
  updatedAt: Date;
  isActive: boolean;
  deactivatedAt?: Date;
}

// Общие типы для CRUD операций
export interface BaseEntity {
  id: string;
  title: string;
  description?: string;
  ownerUserId: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  deactivatedAt?: Date;
}

export interface CreateRequest {
  title: string;
  description?: string;
}

export interface UpdateRequest {
  title: string;
  description?: string;
}
