/**
 * Статусы задач
 */
export enum TaskStatus {
  /**
   * Новая
   */
  New = 1,
  
  /**
   * В ожидании
   */
  Pending = 2,
  
  /**
   * В работе
   */
  InProgress = 3,
  
  /**
   * Закрыта
   */
  Closed = 4,
  
  /**
   * Отменена
   */
  Cancelled = 5,
}

/**
 * Получить текстовое представление статуса
 */
export function getTaskStatusText(status: TaskStatus): string {
  switch (status) {
    case TaskStatus.New:
      return 'Новая';
    case TaskStatus.Pending:
      return 'В ожидании';
    case TaskStatus.InProgress:
      return 'В работе';
    case TaskStatus.Closed:
      return 'Закрыта';
    case TaskStatus.Cancelled:
      return 'Отменена';
    default:
      return 'Неизвестно';
  }
}

/**
 * Получить цвет для статуса
 */
export function getTaskStatusColor(status: TaskStatus): string {
  switch (status) {
    case TaskStatus.New:
      return '#3b82f6'; // blue-500
    case TaskStatus.Pending:
      return '#f59e0b'; // amber-500
    case TaskStatus.InProgress:
      return '#10b981'; // emerald-500
    case TaskStatus.Closed:
      return '#6b7280'; // gray-500
    case TaskStatus.Cancelled:
      return '#ef4444'; // red-500
    default:
      return '#6b7280'; // gray-500
  }
}

/**
 * Получить все статусы для селекта
 */
export function getTaskStatusOptions() {
  return [
    { value: TaskStatus.New, label: getTaskStatusText(TaskStatus.New) },
    { value: TaskStatus.Pending, label: getTaskStatusText(TaskStatus.Pending) },
    { value: TaskStatus.InProgress, label: getTaskStatusText(TaskStatus.InProgress) },
    { value: TaskStatus.Closed, label: getTaskStatusText(TaskStatus.Closed) },
    { value: TaskStatus.Cancelled, label: getTaskStatusText(TaskStatus.Cancelled) },
  ];
}
