import { apiFetch } from './client';
import type { EventCreateRequest, EventCreateResponse, EventResponse } from '../../types/api';

/** EventType.ACTIVITY = 5 */
export const EventTypeActivity = 5;

/** Создать активность для задачи */
export async function createEventForTask(data: EventCreateRequest): Promise<EventCreateResponse> {
  return apiFetch<EventCreateResponse>(`/event/addByTask`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/** Получить список событий по задаче */
export async function fetchEventsByTask(taskId: string, init?: RequestInit): Promise<EventResponse[]> {
  return apiFetch<EventResponse[]>(`/event/byTask/${taskId}`, init);
}

/** Получить список событий по области */
export async function fetchEventsByArea(areaId: string, init?: RequestInit): Promise<EventResponse[]> {
  return apiFetch<EventResponse[]>(`/event/byArea/${areaId}`, init);
}
