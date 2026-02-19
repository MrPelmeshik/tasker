// Типы для Folder API

export interface FolderCreateRequest {
  title: string;
  description?: string;
  areaId: string;
  parentFolderId?: string | null;
  /** Цвет папки (hex). Необязателен — если не задан, используется цвет области. */
  color?: string | null;
}

export interface FolderUpdateRequest {
  title: string;
  description?: string;
  areaId: string;
  parentFolderId?: string | null;
  /** Цвет папки (hex). Необязателен — если не задан, используется цвет области. */
  color?: string | null;
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
  /** Цвет папки (hex). Если не задан — используется цвет области. */
  customColor?: string | null;
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
  /** Цвет папки (hex). Если не задан — используется цвет области. */
  customColor?: string | null;
}
