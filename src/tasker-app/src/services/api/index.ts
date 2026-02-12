// Экспорт базовых утилит
export { BaseApiClient, apiUtils } from './base';

// Экспорт API клиентов
export { areaApi, AreaApiClient } from './areas';
export { groupApi, GroupApiClient } from './groups';
export * from './tasks';
export * from './events';

// Экспорт функций для совместимости
export * from './areas-groups';

// Экспорт отдельных функций из areas
export { 
  fetchAreas, 
  fetchAreaById, 
  createArea, 
  updateArea, 
  deleteArea, 
  fetchActiveAreas, 
  fetchAreasByOwner, 
  fetchAreaShortCard 
} from './areas';

// Экспорт отдельных функций из groups
export { 
  fetchGroups, 
  fetchGroupById, 
  createGroup, 
  updateGroup, 
  deleteGroup, 
  fetchActiveGroups, 
  fetchGroupsByArea, 
  fetchActiveGroupsByArea, 
  fetchGroupsByOwner, 
  fetchActiveGroupsByOwner, 
  fetchGroupShortCardByAreaForTree 
} from './groups';

// Экспорт отдельных функций из tasks
export { 
  taskApi,
  TaskApiClient
} from './tasks';

export {
  fetchTasks,
  fetchTaskById,
  createTask,
  updateTask,
  deleteTask,
  fetchActiveTasks,
  fetchTasksByGroup,
  fetchActiveTasksByGroup,
  fetchTasksByOwner,
  fetchActiveTasksByOwner,
  fetchTaskSummaryByGroup,
  fetchWeeklyTasks,
  getMonday,
  getMondayIso
} from './tasks';

export {
  createEventForTask,
  EventTypeActivity,
  fetchEventsByTask,
  fetchEventsByGroup,
  fetchEventsByArea,
} from './events';

// Экспорт типов
export type {
  TaskWeeklyActivity,
  TaskDayActivity
} from '../../types/api';
