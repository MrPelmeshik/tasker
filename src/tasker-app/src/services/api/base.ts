import { apiFetch } from './client';
import type { ApiResponse, BaseEntity, CreateRequest, UpdateRequest } from '../../types';

// Универсальный базовый API клиент для CRUD операций
export class BaseApiClient<TEntity extends BaseEntity, TCreateRequest extends CreateRequest, TUpdateRequest extends UpdateRequest> {
  constructor(private endpoint: string) {}

  // Получить все записи
  async getAll(): Promise<TEntity[]> {
    return apiFetch<TEntity[]>(`/${this.endpoint}/getAll`);
  }

  // Получить запись по ID
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

  // Создать новую запись
  async create(data: TCreateRequest): Promise<TEntity> {
    return apiFetch<TEntity>(`/${this.endpoint}/create`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Обновить запись
  async update(id: string, data: TUpdateRequest): Promise<void> {
    await apiFetch<void>(`/${this.endpoint}/update/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Удалить запись (мягкое удаление — деактивация)
  async delete(id: string): Promise<void> {
    await apiFetch<void>(`/${this.endpoint}/delete/${id}`, {
      method: 'DELETE',
    });
  }

  // Универсальный метод для обработки ошибок API
  protected handleApiError(error: unknown): never {
    if (error instanceof Error) {
      // Пытаемся извлечь сообщение об ошибке из ответа
      try {
        const errorData = JSON.parse(error.message);
        throw new Error(errorData.message || error.message);
      } catch {
        throw new Error(error.message);
      }
    }
    throw new Error('Произошла неизвестная ошибка');
  }
}

// Утилиты для работы с API
export const apiUtils = {
  // Проверка успешности ответа
  isSuccessResponse: <T>(response: ApiResponse<T>): response is ApiResponse<T> => {
    return response.success === true;
  },

  // Извлечение данных из ответа
  extractData: <T>(response: ApiResponse<T>): T => {
    if (!apiUtils.isSuccessResponse(response)) {
      const message = 'message' in response ? (response as any).message : 'Ошибка API';
      throw new Error(message);
    }
    return response.data;
  },

  // Обработка ошибок HTTP
  handleHttpError: (status: number, message?: string): never => {
    switch (status) {
      case 400:
        throw new Error(message || 'Некорректный запрос');
      case 401:
        throw new Error('Необходима авторизация');
      case 403:
        throw new Error('Доступ запрещен');
      case 404:
        throw new Error('Ресурс не найден');
      case 500:
        throw new Error('Внутренняя ошибка сервера');
      default:
        throw new Error(message || `Ошибка HTTP ${status}`);
    }
  }
};
