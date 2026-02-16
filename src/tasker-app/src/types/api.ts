/**
 * Barrel-файл: обратная совместимость через re-export всех типов API.
 * Модули: types/api/{common,area,folder,task,activity}.ts
 */

export type {
  ApiResponse,
  BaseEntity,
  CreateRequest,
  UpdateRequest,
} from './api/common';

export type {
  AreaCreateRequest,
  AreaUpdateRequest,
  AreaResponse,
  AreaRole,
  AddAreaMemberRequest,
  AreaMemberResponse,
  AreaShortCardResponse,
} from './api/area';

export type {
  FolderCreateRequest,
  FolderUpdateRequest,
  FolderResponse,
  FolderSummaryResponse,
} from './api/folder';

export type {
  TaskCreateRequest,
  TaskUpdateRequest,
  TaskResponse,
  TaskCreateResponse,
  TaskSummaryResponse,
  TaskWeeklyActivity,
  TaskDayActivity,
  TaskWithActivitiesFilterRequest,
  TaskWithActivitiesResponse,
  TaskWithActivitiesPagedResponse,
} from './api/task';

export type {
  EventType,
  EventCreateRequest,
  EventCreateResponse,
  EventUpdateRequest,
  EventMessage,
  EventResponse,
} from './api/activity';
