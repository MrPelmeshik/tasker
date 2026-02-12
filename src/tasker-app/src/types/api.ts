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
  creatorUserId: string;
  creatorUserName?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  deactivatedAt?: string;
}

// Типы для Group API
export interface GroupCreateRequest {
  title: string;
  description?: string;
  areaId: string;
}

export interface GroupUpdateRequest {
  title: string;
  description?: string;
  areaId: string;
}

export interface GroupResponse {
  id: string;
  title: string;
  description?: string;
  areaId: string;
  creatorUserId: string;
  creatorUserName?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  deactivatedAt?: string;
}

export interface GroupCreateResponse {
  groupId: string;
}

// Типы для Tree виджета
export interface AreaShortCardResponse {
  id: string;
  title: string;
  description?: string;
  groupsCount: number;
  creatorUserName: string;
  createdAt: string;
  updatedAt: string;
}

export interface GroupSummaryResponse {
  id: string;
  title: string;
  description?: string;
  areaId: string;
  tasksCount: number;
  creatorUserName: string;
  createdAt: string;
  updatedAt: string;
}

// Типы для Task API
export interface TaskCreateRequest {
  title: string;
  description?: string;
  groupId: string;
  status: number; // TaskStatus enum value
}

export interface TaskUpdateRequest {
  title: string;
  description?: string;
  groupId: string;
  status: number; // TaskStatus enum value
}

export interface TaskResponse {
  id: string;
  title: string;
  description?: string;
  groupId: string;
  status: number; // TaskStatus enum value
  creatorUserId: string;
  creatorUserName?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  deactivatedAt?: string;
}

export interface TaskCreateResponse {
  taskId: string;
}

export interface TaskSummaryResponse {
  id: string;
  title: string;
  description?: string;
  status: number; // TaskStatus enum value
  creatorUserName: string;
  createdAt: string;
  updatedAt: string;
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

// Типы для Events API (активности)
export type EventType = number; // 0=UNKNOWN, 1=CREATE, 2=UPDATE, 3=DELETE, 4=NOTE, 5=ACTIVITY

export interface EventCreateRequest {
  entityId: string;
  title: string;
  description?: string;
  eventType: EventType;
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
  creatorUserId: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  deactivatedAt?: string;
}

// Общие типы для CRUD операций
export interface BaseEntity {
  id: string;
  title: string;
  description?: string;
  creatorUserId: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  deactivatedAt?: string;
}

export interface CreateRequest {
  title: string;
  description?: string;
}

export interface UpdateRequest {
  title: string;
  description?: string;
}
