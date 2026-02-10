import { BaseApiClient } from './base';
import { apiFetch } from './client';
import type { 
  AreaResponse, 
  AreaCreateRequest, 
  AreaUpdateRequest,
  AreaShortCardResponse
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

  // Получить области с фильтрацией по создателю
  async getAreasByCreator(creatorUserId: string): Promise<AreaResponse[]> {
    const areas = await this.getAll();
    return areas.filter(area => area.creatorUserId === creatorUserId);
  }

  // Получить краткие карточки областей для Tree виджета
  async getAreaShortCard(): Promise<AreaShortCardResponse[]> {
    const cards = await apiFetch<Array<AreaShortCardResponse & { groupCount?: number }>>(`/area/getAreaShortCard`);

    return cards.map(card => ({
      ...card,
      groupsCount: card.groupsCount ?? card.groupCount ?? 0,
    }));
  }
}

// Экспорт экземпляра для использования
export const areaApi = new AreaApiClient();

// Экспорт отдельных функций для совместимости
export const fetchAreas = () => areaApi.getAll();
export const fetchAreaById = (id: string) => areaApi.getById(id);
export const createArea = (data: AreaCreateRequest) => areaApi.create(data);
export const updateArea = (id: string, data: AreaUpdateRequest) => areaApi.update(id, data);
export const fetchActiveAreas = () => areaApi.getActiveAreas();
export const fetchAreasByCreator = (creatorUserId: string) => areaApi.getAreasByCreator(creatorUserId);
export const fetchAreaShortCard = () => areaApi.getAreaShortCard();
