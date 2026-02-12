import { apiFetch } from './client';
import type { EventCreateRequest, EventCreateResponse, EventResponse } from '../../types/api';

/** EventType.ACTIVITY = 5 */
export const EventTypeActivity = 5;

/**
 * Создать активность для задачи
 * POST /api/event/addByTask
 */
export async function createEventForTask(data: EventCreateRequest): Promise<EventCreateResponse> {
  return apiFetch<EventCreateResponse>(`/event/addByTask`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Получить список событий по идентификатору задачи
 * GET /api/event/byTask/{taskId}
 */
export async function fetchEventsByTask(taskId: string): Promise<EventResponse[]> {
  return apiFetch<EventResponse[]>(`/event/byTask/${taskId}`);
}

/**
 * Получить список событий по идентификатору группы
 * GET /api/event/byGroup/{groupId}
 */
export async function fetchEventsByGroup(groupId: string): Promise<EventResponse[]> {
  return apiFetch<EventResponse[]>(`/event/byGroup/${groupId}`);
}

/**
 * Получить список событий по идентификатору области
 * GET /api/event/byArea/{areaId}
 */
export async function fetchEventsByArea(areaId: string): Promise<EventResponse[]> {
  return apiFetch<EventResponse[]>(`/event/byArea/${areaId}`);
}
