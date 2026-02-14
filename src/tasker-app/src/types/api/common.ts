// Базовые типы для API

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
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
