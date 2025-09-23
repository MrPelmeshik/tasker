import type { Area, Group, AreaWithGroups } from '../../types/area-group';
import { areaApi } from './areas';
import { groupApi } from './groups';
import type { AreaResponse, GroupResponse } from '../../types/api';

// Функции для работы с областями (используют новый API)
export async function fetchAreas(): Promise<Area[]> {
  const areas = await areaApi.getAll();
  return areas.map((area: AreaResponse) => ({
    id: area.id,
    title: area.title,
    description: area.description,
    creatorUserId: area.creatorUserId,
    isActive: area.isActive,
    createdAt: area.createdAt,
    updatedAt: area.updatedAt,
    deactivatedAt: area.deactivatedAt,
  }));
}

export async function fetchGroupsByArea(areaId: string): Promise<Group[]> {
  const groups = await groupApi.getGroupsByArea(areaId);
  return groups.map((group: GroupResponse) => ({
    id: group.id,
    title: group.title,
    description: group.description,
    areaId: group.areaId,
    creatorUserId: group.creatorUserId,
    isActive: group.isActive,
    createdAt: group.createdAt,
    updatedAt: group.updatedAt,
    deactivatedAt: group.deactivatedAt,
  }));
}

export async function fetchAreasWithGroups(): Promise<AreaWithGroups[]> {
  const [areas, groups] = await Promise.all([
    areaApi.getAll(),
    groupApi.getAll()
  ]);

  return areas.map((area: AreaResponse) => ({
    id: area.id,
    title: area.title,
    description: area.description,
    creatorUserId: area.creatorUserId,
    isActive: area.isActive,
    createdAt: area.createdAt,
    updatedAt: area.updatedAt,
    deactivatedAt: area.deactivatedAt,
    groups: groups
      .filter((group: GroupResponse) => group.areaId === area.id)
      .map((group: GroupResponse) => ({
        id: group.id,
        title: group.title,
        description: group.description,
        areaId: group.areaId,
        creatorUserId: group.creatorUserId,
        isActive: group.isActive,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
        deactivatedAt: group.deactivatedAt,
      }))
  }));
}

// Дополнительные функции для работы с областями и группами
export async function fetchActiveAreas(): Promise<Area[]> {
  const areas = await areaApi.getActiveAreas();
  return areas.map((area: AreaResponse) => ({
    id: area.id,
    title: area.title,
    description: area.description,
    creatorUserId: area.creatorUserId,
    isActive: area.isActive,
    createdAt: area.createdAt,
    updatedAt: area.updatedAt,
    deactivatedAt: area.deactivatedAt,
  }));
}

export async function fetchActiveGroupsByArea(areaId: string): Promise<Group[]> {
  const groups = await groupApi.getActiveGroupsByArea(areaId);
  return groups.map((group: GroupResponse) => ({
    id: group.id,
    title: group.title,
    description: group.description,
    areaId: group.areaId,
    creatorUserId: group.creatorUserId,
    isActive: group.isActive,
    createdAt: group.createdAt,
    updatedAt: group.updatedAt,
    deactivatedAt: group.deactivatedAt,
  }));
}
