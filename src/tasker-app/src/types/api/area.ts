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
