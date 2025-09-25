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
}

export interface GroupSummaryResponse {
  id: string;
  title: string;
  description?: string;
  tasksCount: number;
}

// Типы для Task API
export interface TaskCreateRequest {
  title: string;
  description?: string;
  groupId: string;
}

export interface TaskUpdateRequest {
  title: string;
  description?: string;
  groupId: string;
}

export interface TaskResponse {
  id: string;
  title: string;
  description?: string;
  groupId: string;
  creatorUserId: string;
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
