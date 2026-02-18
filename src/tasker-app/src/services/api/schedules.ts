import { apiFetch } from './client';
import type { TaskScheduleCreateRequest, TaskScheduleUpdateRequest, TaskScheduleResponse } from '../../types/api';

export function createSchedule(data: TaskScheduleCreateRequest): Promise<TaskScheduleResponse> {
  return apiFetch<TaskScheduleResponse>('/taskSchedule/create', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateSchedule(id: string, data: TaskScheduleUpdateRequest): Promise<TaskScheduleResponse> {
  return apiFetch<TaskScheduleResponse>(`/taskSchedule/update/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteSchedule(id: string): Promise<void> {
  return apiFetch<void>(`/taskSchedule/delete/${id}`, {
    method: 'DELETE',
  });
}

export function fetchSchedulesByTask(taskId: string, init?: RequestInit): Promise<TaskScheduleResponse[]> {
  return apiFetch<TaskScheduleResponse[]>(`/taskSchedule/getByTaskId/byTask/${taskId}`, init);
}

export function fetchSchedulesByWeek(weekStartIso: string, init?: RequestInit): Promise<TaskScheduleResponse[]> {
  return apiFetch<TaskScheduleResponse[]>('/taskSchedule/getByWeek', {
    ...init,
    method: 'POST',
    body: JSON.stringify({ weekStartIso }),
  });
}
