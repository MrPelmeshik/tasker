export interface Area {
  id: string;
  title: string;
  description?: string;
  creatorUserId: string;
  createdAt: string;
  deactivatedAt?: string;
  isActive: boolean;
  updatedAt: string;
  customColor?: string; // Hex цвет для кастомной окраски карточки
}

export interface Group {
  id: string;
  title: string;
  description?: string;
  areaId: string;
  creatorUserId: string;
  createdAt: string;
  deactivatedAt?: string;
  isActive: boolean;
  updatedAt: string;
  customColor?: string; // Hex цвет для кастомной окраски карточки
}

export interface AreaWithGroups extends Area {
  groups: Group[];
}

// Типы для Tree виджета
export interface AreaShortCard {
  id: string;
  title: string;
  description?: string;
  groupsCount: number;
  customColor?: string; // Hex цвет для кастомной окраски карточки
}

export interface GroupSummary {
  id: string;
  title: string;
  description?: string;
  areaId: string;
  tasksCount: number;
  customColor?: string; // Hex цвет для кастомной окраски карточки
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  groupId: string;
  status: number; // TaskStatus enum value
  creatorUserId: string;
  createdAt: string;
  deactivatedAt?: string;
  isActive: boolean;
  updatedAt: string;
  customColor?: string; // Hex цвет для кастомной окраски карточки
}

export interface TaskSummary {
  id: string;
  title: string;
  description?: string;
  status: number; // TaskStatus enum value
  customColor?: string; // Hex цвет для кастомной окраски карточки
}