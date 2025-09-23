export interface Area {
  id: string;
  title: string;
  description?: string;
  creatorUserId: string;
  createdAt: string;
  deactivatedAt?: string;
  isActive: boolean;
  updatedAt: string;
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
}

export interface AreaWithGroups extends Area {
  groups: Group[];
}
