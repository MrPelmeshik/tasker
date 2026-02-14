import { BaseApiClient } from './base';
import { apiFetch } from './client';
import type {
  FolderCreateRequest,
  FolderUpdateRequest,
  FolderResponse,
  FolderSummaryResponse,
} from '../../types/api';

// API клиент для работы с папками
export class FolderApiClient {
  private baseClient: BaseApiClient<FolderResponse, FolderCreateRequest, FolderUpdateRequest>;

  constructor() {
    this.baseClient = new BaseApiClient<FolderResponse, FolderCreateRequest, FolderUpdateRequest>('folder');
  }

  async getAll(): Promise<FolderResponse[]> {
    return this.baseClient.getAll();
  }

  async getById(id: string): Promise<FolderResponse | null> {
    return this.baseClient.getById(id);
  }

  async create(data: FolderCreateRequest): Promise<FolderResponse> {
    return this.baseClient.create(data);
  }

  async update(id: string, data: FolderUpdateRequest): Promise<void> {
    return this.baseClient.update(id, data);
  }

  async delete(id: string): Promise<void> {
    return this.baseClient.delete(id);
  }

  async getRootByArea(areaId: string, init?: RequestInit): Promise<FolderSummaryResponse[]> {
    return apiFetch<FolderSummaryResponse[]>(`/folder/getRootByArea/root/${areaId}`, init);
  }

  async getByParent(parentFolderId: string | null, areaId: string, init?: RequestInit): Promise<FolderSummaryResponse[]> {
    const params = new URLSearchParams({ areaId });
    if (parentFolderId) params.set('parentFolderId', parentFolderId);
    return apiFetch<FolderSummaryResponse[]>(`/folder/getByParent/children?${params}`, init);
  }
}

export const folderApi = new FolderApiClient();

export const fetchFolders = () => folderApi.getAll();
export const fetchFolderById = (id: string) => folderApi.getById(id);
export const createFolder = (data: FolderCreateRequest) => folderApi.create(data);
export const updateFolder = (id: string, data: FolderUpdateRequest) => folderApi.update(id, data);
export const deleteFolder = (id: string) => folderApi.delete(id);
export const fetchRootFoldersByArea = (areaId: string, init?: RequestInit) => folderApi.getRootByArea(areaId, init);
export const fetchChildFolders = (parentFolderId: string | null, areaId: string, init?: RequestInit) =>
  folderApi.getByParent(parentFolderId, areaId, init);
