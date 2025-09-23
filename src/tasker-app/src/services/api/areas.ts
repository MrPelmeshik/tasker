import { BaseApiClient } from './base';
import type { 
  AreaResponse, 
  AreaCreateRequest, 
  AreaUpdateRequest 
} from '../../types/api';

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
