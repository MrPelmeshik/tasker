import { apiFetch } from './client';
import type { EventCreateRequest, EventCreateResponse } from '../../types/api';

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
