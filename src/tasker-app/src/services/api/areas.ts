import { BaseApiClient } from './base';
import { apiFetch } from './client';
import type { 
  AreaResponse, 
  AreaCreateRequest, 
  AreaUpdateRequest,
  AreaShortCardResponse,
  AreaMemberResponse,
  AddAreaMemberRequest
} from '../../types';

// API клиент для работы с областями
export class AreaApiClient extends BaseApiClient<AreaResponse, AreaCreateRequest, AreaUpdateRequest> {
  constructor() {
    super('area');
  }

  // Дополнительные методы специфичные для областей
  async getActiveAreas(): Promise<AreaResponse[]> {
    const areas = await this.getAll();
    return areas.filter(area => area.isActive);
  }

  // Получить области с фильтрацией по владельцу
  async getAreasByOwner(ownerUserId: string): Promise<AreaResponse[]> {
    const areas = await this.getAll();
    return areas.filter(area => area.ownerUserId === ownerUserId);
  }

  // Получить краткие карточки областей для Tree виджета
  async getAreaShortCard(): Promise<AreaShortCardResponse[]> {
    const cards = await apiFetch<Array<AreaShortCardResponse & { groupCount?: number }>>(`/area/getAreaShortCard`);

    return cards.map(card => ({
      ...card,
      groupsCount: card.groupsCount ?? card.groupCount ?? 0,
    }));
  }

  /** Получить список участников области */
  async getMembers(areaId: string): Promise<AreaMemberResponse[]> {
    return apiFetch<AreaMemberResponse[]>(`/area/GetMembers/${areaId}`);
  }

  /** Добавить участника в область (по email или userId) */
  async addMember(areaId: string, request: AddAreaMemberRequest): Promise<void> {
    await apiFetch<{ success: boolean; message: string }>(`/area/AddMember/${areaId}`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /** Удалить участника из области */
  async removeMember(areaId: string, userId: string): Promise<void> {
    await apiFetch<{ success: boolean; message: string }>(`/area/RemoveMember/${areaId}/${userId}`, {
      method: 'DELETE',
    });
  }
}

// Экспорт экземпляра для использования
export const areaApi = new AreaApiClient();

// Экспорт отдельных функций для совместимости
export const fetchAreas = () => areaApi.getAll();
export const fetchAreaById = (id: string) => areaApi.getById(id);
export const createArea = (data: AreaCreateRequest) => areaApi.create(data);
export const updateArea = (id: string, data: AreaUpdateRequest) => areaApi.update(id, data);
export const deleteArea = (id: string) => areaApi.delete(id);
export const fetchActiveAreas = () => areaApi.getActiveAreas();
export const fetchAreasByOwner = (ownerUserId: string) => areaApi.getAreasByOwner(ownerUserId);
export const fetchAreaShortCard = () => areaApi.getAreaShortCard();
export const fetchAreaMembers = (areaId: string) => areaApi.getMembers(areaId);
