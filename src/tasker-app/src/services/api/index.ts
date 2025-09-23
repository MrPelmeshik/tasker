// Экспорт базовых утилит
export { BaseApiClient, apiUtils } from './base';

// Экспорт API клиентов
export { areaApi, AreaApiClient } from './areas';
export { groupApi, GroupApiClient } from './groups';

// Экспорт функций для совместимости
export * from './areas-groups';

// Экспорт типов
export * from '../../types/api';
