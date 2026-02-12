import { BaseApiClient } from './base';
import { apiFetch } from './client';
import type { 
  TaskResponse, 
  TaskCreateRequest, 
  TaskUpdateRequest, 
  TaskCreateResponse, 
  TaskSummaryResponse,
  TaskWeeklyActivity
} from '../../types/api';

// API клиент для работы с задачами
export class TaskApiClient {
  private baseClient: BaseApiClient<TaskResponse, TaskCreateRequest, TaskUpdateRequest>;

  constructor() {
    this.baseClient = new BaseApiClient<TaskResponse, TaskCreateRequest, TaskUpdateRequest>('task');
  }

  // Делегируем все методы базовому клиенту, кроме create
  async getAll(): Promise<TaskResponse[]> {
    return this.baseClient.getAll();
  }

  async getById(id: string): Promise<TaskResponse | null> {
    return this.baseClient.getById(id);
  }

  async update(id: string, data: TaskUpdateRequest): Promise<void> {
    return this.baseClient.update(id, data);
  }

  // Специальный метод create для возврата TaskCreateResponse
  async create(data: TaskCreateRequest): Promise<TaskCreateResponse> {
    return apiFetch<TaskCreateResponse>(`/task/create`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Дополнительные методы специфичные для задач
  async getActiveTasks(): Promise<TaskResponse[]> {
    const tasks = await this.getAll();
    return tasks.filter(task => task.isActive);
  }

  // Получить задачи по группе
  async getTasksByGroup(groupId: string): Promise<TaskResponse[]> {
    const tasks = await this.getAll();
    return tasks.filter(task => task.groupId === groupId);
  }

  // Получить активные задачи по группе
  async getActiveTasksByGroup(groupId: string): Promise<TaskResponse[]> {
    const tasks = await this.getTasksByGroup(groupId);
    return tasks.filter(task => task.isActive);
  }

  // Получить задачи по создателю
  async getTasksByCreator(creatorUserId: string): Promise<TaskResponse[]> {
    const tasks = await this.getAll();
    return tasks.filter(task => task.creatorUserId === creatorUserId);
  }

  // Получить активные задачи по создателю
  async getActiveTasksByCreator(creatorUserId: string): Promise<TaskResponse[]> {
    const tasks = await this.getTasksByCreator(creatorUserId);
    return tasks.filter(task => task.isActive);
  }

  // Получить краткие карточки задач по группе для Tree виджета
  async getTaskSummaryByGroup(groupId: string): Promise<TaskSummaryResponse[]> {
    return apiFetch<TaskSummaryResponse[]>(`/task/getTaskSummaryByGroup/${groupId}`);
  }

  // Получить недельную активность задач
  async getWeeklyTasks(params: { weekStartIso: string }): Promise<TaskWeeklyActivity[]> {
    // Преобразуем ISO дату в год и номер недели
    const date = new Date(params.weekStartIso + 'T00:00:00Z');
    const year = date.getFullYear();
    const weekNumber = this.getWeekNumber(date);
    
    const request = {
      year,
      weekNumber
    };
    
    return apiFetch<TaskWeeklyActivity[]>(`/task/getWeeklyActivity`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Получить номер недели по ISO 8601
  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }
}

// Экспорт экземпляра для использования
export const taskApi = new TaskApiClient();

// Экспорт отдельных функций для совместимости
export const fetchTasks = () => taskApi.getAll();
export const fetchTaskById = (id: string) => taskApi.getById(id);
export const createTask = (data: TaskCreateRequest) => taskApi.create(data);
export const updateTask = (id: string, data: TaskUpdateRequest) => taskApi.update(id, data);
export const fetchActiveTasks = () => taskApi.getActiveTasks();
export const fetchTasksByGroup = (groupId: string) => taskApi.getTasksByGroup(groupId);
export const fetchActiveTasksByGroup = (groupId: string) => taskApi.getActiveTasksByGroup(groupId);
export const fetchTasksByCreator = (creatorUserId: string) => taskApi.getTasksByCreator(creatorUserId);
export const fetchActiveTasksByCreator = (creatorUserId: string) => taskApi.getActiveTasksByCreator(creatorUserId);
export const fetchTaskSummaryByGroup = (groupId: string) => taskApi.getTaskSummaryByGroup(groupId);
export const fetchWeeklyTasks = (params: { weekStartIso: string }) => taskApi.getWeeklyTasks(params);

// Утилитарная функция для получения понедельника (в локальном времени)
export function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** ISO-строка понедельника по локальной дате (без смещения в UTC) */
export function getMondayIso(date: Date): string {
  const m = getMonday(date);
  const y = m.getFullYear();
  const mo = String(m.getMonth() + 1).padStart(2, '0');
  const day = String(m.getDate()).padStart(2, '0');
  return `${y}-${mo}-${day}`;
}