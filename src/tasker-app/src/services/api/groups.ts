import { BaseApiClient } from './base';
import { apiFetch } from './client';
import type { 
  GroupResponse, 
  GroupCreateRequest, 
  GroupUpdateRequest,
  GroupCreateResponse,
  GroupSummaryResponse
} from '../../types';

// API клиент для работы с группами
export class GroupApiClient {
  private baseClient: BaseApiClient<GroupResponse, GroupCreateRequest, GroupUpdateRequest>;

  constructor() {
    this.baseClient = new BaseApiClient<GroupResponse, GroupCreateRequest, GroupUpdateRequest>('group');
  }

  // Делегируем все методы базовому клиенту, кроме create
  async getAll(): Promise<GroupResponse[]> {
    return this.baseClient.getAll();
  }

  async getById(id: string): Promise<GroupResponse | null> {
    return this.baseClient.getById(id);
  }

  async update(id: string, data: GroupUpdateRequest): Promise<void> {
    return this.baseClient.update(id, data);
  }

  async delete(id: string): Promise<void> {
    return this.baseClient.delete(id);
  }

  // Специальный метод create для возврата GroupCreateResponse
  async create(data: GroupCreateRequest): Promise<GroupCreateResponse> {
    return apiFetch<GroupCreateResponse>(`/group/create`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Дополнительные методы специфичные для групп
  async getActiveGroups(): Promise<GroupResponse[]> {
    const groups = await this.getAll();
    return groups.filter(group => group.isActive);
  }

  // Получить группы по области
  async getGroupsByArea(areaId: string): Promise<GroupResponse[]> {
    const groups = await this.getAll();
    return groups.filter(group => group.areaId === areaId);
  }

  // Получить активные группы по области
  async getActiveGroupsByArea(areaId: string): Promise<GroupResponse[]> {
    const groups = await this.getGroupsByArea(areaId);
    return groups.filter(group => group.isActive);
  }

  // Получить группы по создателю
  async getGroupsByCreator(creatorUserId: string): Promise<GroupResponse[]> {
    const groups = await this.getAll();
    return groups.filter(group => group.creatorUserId === creatorUserId);
  }

  // Получить активные группы по создателю
  async getActiveGroupsByCreator(creatorUserId: string): Promise<GroupResponse[]> {
    const groups = await this.getGroupsByCreator(creatorUserId);
    return groups.filter(group => group.isActive);
  }

  // Получить краткие карточки групп по области для Tree виджета
  async getGroupShortCardByAreaForTree(areaId: string): Promise<GroupSummaryResponse[]> {
    return apiFetch<GroupSummaryResponse[]>(`/group/getGroupShortCardByArea/${areaId}`);
  }
}

// Экспорт экземпляра для использования
export const groupApi = new GroupApiClient();

// Экспорт отдельных функций для совместимости
export const fetchGroups = () => groupApi.getAll();
export const fetchGroupById = (id: string) => groupApi.getById(id);
export const createGroup = (data: GroupCreateRequest) => groupApi.create(data);
export const updateGroup = (id: string, data: GroupUpdateRequest) => groupApi.update(id, data);
export const deleteGroup = (id: string) => groupApi.delete(id);
export const fetchActiveGroups = () => groupApi.getActiveGroups();
export const fetchGroupsByArea = (areaId: string) => groupApi.getGroupsByArea(areaId);
export const fetchActiveGroupsByArea = (areaId: string) => groupApi.getActiveGroupsByArea(areaId);
export const fetchGroupsByCreator = (creatorUserId: string) => groupApi.getGroupsByCreator(creatorUserId);
export const fetchActiveGroupsByCreator = (creatorUserId: string) => groupApi.getActiveGroupsByCreator(creatorUserId);
export const fetchGroupShortCardByAreaForTree = (areaId: string) => groupApi.getGroupShortCardByAreaForTree(areaId);
