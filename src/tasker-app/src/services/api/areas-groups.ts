import type { Area, Group, AreaWithGroups } from '../../types/area-group';
import { getAreasWithGroups, mockAreas, mockGroups } from '../../data/mock-areas-groups';

export async function fetchAreas(): Promise<Area[]> {
  // Имитируем задержку API
  await new Promise(resolve => setTimeout(resolve, 200));
  return mockAreas;
}

export async function fetchGroupsByArea(areaId: string): Promise<Group[]> {
  // Имитируем задержку API
  await new Promise(resolve => setTimeout(resolve, 150));
  return mockGroups.filter(group => group.areaId === areaId);
}

export async function fetchAreasWithGroups(): Promise<AreaWithGroups[]> {
  // Имитируем задержку API
  await new Promise(resolve => setTimeout(resolve, 300));
  return getAreasWithGroups();
}
