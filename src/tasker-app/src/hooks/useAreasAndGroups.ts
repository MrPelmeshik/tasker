import { useState, useEffect, useCallback } from 'react';
import { areaApi, groupApi } from '../services/api';
import type { AreaResponse, GroupResponse, AreaCreateRequest, AreaUpdateRequest, GroupCreateRequest, GroupUpdateRequest } from '../types/api';

// Хук для работы с областями
export function useAreas() {
  const [areas, setAreas] = useState<AreaResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAreas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await areaApi.getAll();
      setAreas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки областей');
    } finally {
      setLoading(false);
    }
  }, []);

  const createArea = useCallback(async (data: AreaCreateRequest) => {
    try {
      const newArea = await areaApi.create(data);
      setAreas(prev => [...prev, newArea]);
      return newArea;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка создания области');
      throw err;
    }
  }, []);

  const updateArea = useCallback(async (id: string, data: AreaUpdateRequest) => {
    try {
      await areaApi.update(id, data);
      setAreas(prev => prev.map(area => 
        area.id === id ? { ...area, ...data, updatedAt: new Date().toISOString() } : area
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка обновления области');
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchAreas();
  }, [fetchAreas]);

  return {
    areas,
    loading,
    error,
    fetchAreas,
    createArea,
    updateArea,
  };
}

// Хук для работы с группами
export function useGroups() {
  const [groups, setGroups] = useState<GroupResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await groupApi.getAll();
      setGroups(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки групп');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchGroupsByArea = useCallback(async (areaId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await groupApi.getGroupsByArea(areaId);
      setGroups(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки групп');
    } finally {
      setLoading(false);
    }
  }, []);

  const createGroup = useCallback(async (data: GroupCreateRequest) => {
    try {
      const result = await groupApi.create(data);
      // После создания получаем полную информацию о группе
      const newGroup = await groupApi.getById(result.groupId);
      if (newGroup) {
        setGroups(prev => [...prev, newGroup]);
      }
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка создания группы');
      throw err;
    }
  }, []);

  const updateGroup = useCallback(async (id: string, data: GroupUpdateRequest) => {
    try {
      await groupApi.update(id, data);
      setGroups(prev => prev.map(group => 
        group.id === id ? { ...group, ...data, updatedAt: new Date().toISOString() } : group
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка обновления группы');
      throw err;
    }
  }, []);

  return {
    groups,
    loading,
    error,
    fetchGroups,
    fetchGroupsByArea,
    createGroup,
    updateGroup,
  };
}

// Комбинированный хук для работы с областями и группами
export function useAreasAndGroups() {
  const areasHook = useAreas();
  const groupsHook = useGroups();

  const fetchAreasWithGroups = useCallback(async () => {
    await Promise.all([
      areasHook.fetchAreas(),
      groupsHook.fetchGroups()
    ]);
  }, [areasHook.fetchAreas, groupsHook.fetchGroups]);

  const getGroupsByArea = useCallback((areaId: string) => {
    return groupsHook.groups.filter(group => group.areaId === areaId);
  }, [groupsHook.groups]);

  const getActiveGroupsByArea = useCallback((areaId: string) => {
    return groupsHook.groups.filter(group => group.areaId === areaId && group.isActive);
  }, [groupsHook.groups]);

  return {
    // Areas
    areas: areasHook.areas,
    areasLoading: areasHook.loading,
    areasError: areasHook.error,
    createArea: areasHook.createArea,
    updateArea: areasHook.updateArea,
    
    // Groups
    groups: groupsHook.groups,
    groupsLoading: groupsHook.loading,
    groupsError: groupsHook.error,
    createGroup: groupsHook.createGroup,
    updateGroup: groupsHook.updateGroup,
    
    // Combined
    fetchAreasWithGroups,
    getGroupsByArea,
    getActiveGroupsByArea,
  };
}
