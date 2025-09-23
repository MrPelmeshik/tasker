// Базовые типы для API
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
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
