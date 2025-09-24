// Экспорт базовых утилит
export { BaseApiClient, apiUtils } from './base';

// Экспорт API клиентов
export { areaApi, AreaApiClient } from './areas';
export { groupApi, GroupApiClient } from './groups';
export * from './tasks';

// Экспорт функций для совместимости
export * from './areas-groups';

// Экспорт отдельных функций из areas
export { 
  fetchAreas, 
  fetchAreaById, 
  createArea, 
  updateArea, 
  fetchActiveAreas, 
  fetchAreasByCreator, 
  fetchAreaShortCard 
} from './areas';

// Экспорт отдельных функций из groups
export { 
  fetchGroups, 
  fetchGroupById, 
  createGroup, 
  updateGroup, 
  fetchActiveGroups, 
  fetchGroupsByArea, 
  fetchActiveGroupsByArea, 
  fetchGroupsByCreator, 
  fetchActiveGroupsByCreator, 
  fetchGroupShortCardByAreaForTree 
} from './groups';

// Типы экспортируются через главный index.ts
