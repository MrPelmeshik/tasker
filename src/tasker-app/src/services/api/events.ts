import { apiFetch } from './client';
import type { EventCreateRequest, EventCreateResponse, EventResponse, EventUpdateRequest } from '../../types/api';

/** EventType constants */
export const EventTypeCreate = 1;
export const EventTypeUpdate = 2;
export const EventTypeDelete = 3;
export const EventTypeNote = 4;
export const EventTypeActivity = 5;

export const AllEventTypes = [
  EventTypeCreate,
  EventTypeUpdate,
  EventTypeDelete,
  EventTypeNote,
  EventTypeActivity,
];

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

/** Обновить событие по идентификатору (частичное обновление) */
export async function updateEvent(eventId: string, data: EventUpdateRequest): Promise<void> {
  await apiFetch(`/event/${eventId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/** Мягко удалить событие по идентификатору */
export async function deleteEvent(eventId: string): Promise<void> {
  await apiFetch(`/event/${eventId}`, {
    method: 'DELETE',
  });
}
