export interface Area {
  id: string;
  title: string;
  description?: string;
  ownerUserId: string;
  createdAt: Date;
  deactivatedAt?: Date;
  isActive: boolean;
  updatedAt: Date;
  customColor?: string;
}

export interface Folder {
  id: string;
  title: string;
  description?: string;
  areaId: string;
  parentFolderId?: string | null;
  ownerUserId: string;
  createdAt: Date;
  deactivatedAt?: Date;
  isActive: boolean;
  updatedAt: Date;
  customColor?: string;
}

// Типы для Tree виджета
export interface AreaShortCard {
  id: string;
  title: string;
  description?: string;
  foldersCount: number;
  rootTasksCount: number;
  ownerUserName: string;
  createdAt: Date;
  updatedAt: Date;
  customColor?: string;
}

export interface FolderSummary {
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
  customColor?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  areaId: string;
  folderId?: string | null;
  status: number;
  ownerUserId: string;
  createdAt: Date;
  deactivatedAt?: Date;
  isActive: boolean;
  updatedAt: Date;
  customColor?: string;
}

export interface TaskSummary {
  id: string;
  title: string;
  description?: string;
  status: number;
  areaId: string;
  folderId?: string | null;
  ownerUserName: string;
  createdAt: Date;
  updatedAt: Date;
  customColor?: string;
}
