/**
 * Типы для открытия сущностей по deep link (openEntityByDeepLink).
 * Колбэки модалок приведены к сигнатурам, используемым при открытии по ссылке (mode: 'edit').
 */

import type React from 'react';
import type {
  AreaResponse,
  AreaCreateRequest,
  AreaUpdateRequest,
  FolderResponse,
  FolderCreateRequest,
  FolderUpdateRequest,
  TaskResponse,
  TaskCreateRequest,
  TaskUpdateRequest,
} from '../../../../types/api';
import type { AreaShortCard, FolderSummary, TaskSummary } from '../../../../types';
import type { EntityType } from '../../../../utils/entity-links';

/** Область для селекта в модалке папки */
export interface AreaOption {
  id: string;
  title: string;
  description?: string;
}

/** Область для селекта в модалке задачи */
export interface AreaOptionShort {
  id: string;
  title: string;
}

/** Колбэк открытия модалки области (режим редактирования) */
export type OpenAreaModalFn = (
  area: AreaResponse,
  mode: 'edit',
  onSave: (data: AreaCreateRequest | AreaUpdateRequest) => Promise<void>,
  onDelete?: (id: string) => Promise<void>
) => void;

/** Колбэк открытия модалки папки (режим редактирования) */
export type OpenFolderModalFn = (
  folder: FolderResponse,
  mode: 'edit',
  areas: AreaOption[],
  onSave: (data: FolderCreateRequest | FolderUpdateRequest, folderId?: string) => Promise<void>,
  onDelete?: (id: string) => Promise<void>
) => void;

/** Колбэк открытия модалки задачи (режим редактирования) */
export type OpenTaskModalFn = (
  task: TaskResponse,
  mode: 'edit',
  onSave: (data: TaskCreateRequest | TaskUpdateRequest, taskId?: string) => Promise<void>,
  onDelete?: (id: string) => Promise<void>,
  defaultFolderId?: string,
  defaultAreaId?: string,
  areas?: AreaOptionShort[]
) => void;

/** Параметры открытия сущности по deep link */
export interface OpenEntityByDeepLinkParams {
  entityType: EntityType;
  entityId: string;
  areas: AreaShortCard[];
  foldersByArea: Map<string, FolderSummary[]>;
  foldersByParent: Map<string, FolderSummary[]>;
  tasksByArea: Map<string, TaskSummary[]>;
  tasksByFolder: Map<string, TaskSummary[]>;
  setExpandedAreas: React.Dispatch<React.SetStateAction<Set<string>>>;
  setExpandedFolders: React.Dispatch<React.SetStateAction<Set<string>>>;
  loadAreaContent: (areaId: string) => Promise<unknown>;
  loadFolderContent: (folderId: string, areaId: string) => Promise<unknown>;
  openAreaModal: OpenAreaModalFn;
  openFolderModal: OpenFolderModalFn;
  openTaskModal: OpenTaskModalFn;
  showError: (error: unknown) => void;
  handleAreaSave: (data: AreaCreateRequest | AreaUpdateRequest) => Promise<void>;
  handleAreaDelete: (id: string) => Promise<void>;
  handleFolderSave: (data: FolderCreateRequest | FolderUpdateRequest, folderId?: string) => Promise<void>;
  handleFolderDelete: (id: string) => Promise<void>;
  handleTaskSave: (data: TaskCreateRequest | TaskUpdateRequest, taskId?: string) => Promise<void>;
  handleTaskDelete: (id: string) => Promise<void>;
}
