import { apiFetch } from './client';
import type { BaseEntity, CreateRequest, UpdateRequest } from '../../types';

export class BaseApiClient<TEntity extends BaseEntity, TCreateRequest extends CreateRequest, TUpdateRequest extends UpdateRequest> {
  constructor(private endpoint: string) {}

  async getAll(init?: RequestInit): Promise<TEntity[]> {
    return apiFetch<TEntity[]>(`/${this.endpoint}/getAll`, init);
  }

  async getById(id: string): Promise<TEntity | null> {
    try {
      return await apiFetch<TEntity>(`/${this.endpoint}/getById/${id}`);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  async create(data: TCreateRequest): Promise<TEntity> {
    return apiFetch<TEntity>(`/${this.endpoint}/create`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async update(id: string, data: TUpdateRequest): Promise<void> {
    await apiFetch<void>(`/${this.endpoint}/update/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(id: string): Promise<void> {
    await apiFetch<void>(`/${this.endpoint}/delete/${id}`, {
      method: 'DELETE',
    });
  }
}
