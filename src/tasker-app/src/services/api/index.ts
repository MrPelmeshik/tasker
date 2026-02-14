// Экспорт базовых утилит
export { BaseApiClient } from './base';
export { loginRequest, registerRequest, getCurrentUser, updateProfile, logoutRequest } from './auth';

// Экспорт API клиентов
export { areaApi, AreaApiClient } from './areas';
export { folderApi, FolderApiClient } from './folders';
export * from './tasks';
export * from './events';

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

// Экспорт отдельных функций из folders
export { 
  fetchFolders, 
  fetchFolderById, 
  createFolder, 
  updateFolder, 
  deleteFolder, 
  fetchRootFoldersByArea, 
  fetchChildFolders 
} from './folders';

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
  fetchTaskSummaryByFolder,
  fetchTaskSummaryByAreaRoot,
  fetchWeeklyTasks,
  fetchTasksWithActivities,
  getMonday,
  getMondayIso
} from './tasks';

export {
  type TaskWithActivitiesFilter,
  dateRangeFromWeek,
  buildTaskWithActivitiesFilter,
} from './filters';

export {
  createEventForTask,
  EventTypeActivity,
  fetchEventsByTask,
  fetchEventsByArea,
} from './events';

// Экспорт типов
export type {
  TaskWeeklyActivity,
  TaskDayActivity,
  TaskWithActivitiesFilterRequest,
  TaskWithActivitiesResponse,
  TaskWithActivitiesPagedResponse,
} from '../../types/api';
