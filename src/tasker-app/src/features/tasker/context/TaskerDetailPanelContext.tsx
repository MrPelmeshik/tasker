import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { GlassButton } from '../../../components/ui/GlassButton';
import { CloseIcon, FoldVerticalIcon, UnfoldVerticalIcon } from '../../../components/icons';
import { AreaModal } from '../../../components/areas/AreaModal';
import { FolderModal } from '../../../components/folders/FolderModal';
import { TaskModal } from '../../../components/tasks/TaskModal';
import { ActivityModal } from '../../../components/activities/ActivityModal';
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
  EventResponse,
  EventUpdateRequest,
} from '../../../types/api';
import type { ActivityFormData } from '../../../components/activities/ActivityModal';
import type { ModalSize } from '../../../types/modal-size';
import css from '../../../styles/tasker-detail-panel.module.css';

type AreaState = {
  isOpen: boolean;
  area: AreaResponse | null;
  onSave: ((data: AreaCreateRequest | AreaUpdateRequest) => Promise<void>) | null;
  onDelete: ((id: string) => Promise<void>) | null;
  size: ModalSize;
};
type FolderState = {
  isOpen: boolean;
  folder: FolderResponse | null;
  areas: Array<{ id: string; title: string; description?: string }>;
  onSave: ((data: FolderCreateRequest | FolderUpdateRequest, folderId?: string) => Promise<void>) | null;
  onDelete: ((id: string) => Promise<void>) | null;
  areaId?: string;
  parentFolderId?: string | null;
  size: ModalSize;
};
type TaskState = {
  isOpen: boolean;
  task: TaskResponse | null;
  onSave: ((data: TaskCreateRequest | TaskUpdateRequest, taskId?: string) => Promise<void>) | null;
  onDelete: ((id: string) => Promise<void>) | null;
  defaultFolderId?: string;
  defaultAreaId?: string;
  areas?: Array<{ id: string; title: string }>;
  size: ModalSize;
};
type ActivityState = {
  isOpen: boolean;
  task: TaskResponse | null;
  date: string | null;
  onSave: ((data: ActivityFormData) => Promise<void>) | null;
  onOpenTaskDetails: (() => void) | null;
  onSaveEdit: ((eventId: string, data: EventUpdateRequest) => Promise<void>) | null;
  onDeleteEvent: ((event: EventResponse) => Promise<void>) | null;
};

const initArea: AreaState = { isOpen: false, area: null, onSave: null, onDelete: null, size: 'medium' };
const initFolder: FolderState = { isOpen: false, folder: null, areas: [], onSave: null, onDelete: null, size: 'medium' };
const initTask: TaskState = { isOpen: false, task: null, onSave: null, onDelete: null, size: 'medium' };
const initActivity: ActivityState = { isOpen: false, task: null, date: null, onSave: null, onOpenTaskDetails: null, onSaveEdit: null, onDeleteEvent: null };

export interface TaskerDetailPanelApi {
  openAreaModal: (
    area: AreaResponse | null,
    mode: 'create' | 'edit',
    onSave: (data: AreaCreateRequest | AreaUpdateRequest) => Promise<void>,
    onDelete?: (id: string) => Promise<void>,
    size?: ModalSize
  ) => void;
  openFolderModal: (
    folder: FolderResponse | null,
    mode: 'create' | 'edit',
    areas: Array<{ id: string; title: string; description?: string }>,
    onSave: (data: FolderCreateRequest | FolderUpdateRequest, folderId?: string) => Promise<void>,
    onDelete?: (id: string) => Promise<void>,
    areaId?: string,
    parentFolderId?: string | null,
    size?: ModalSize
  ) => void;
  openTaskModal: (
    task: TaskResponse | null,
    mode: 'create' | 'edit',
    onSave: (data: TaskCreateRequest | TaskUpdateRequest, taskId?: string) => Promise<void>,
    onDelete?: (id: string) => Promise<void>,
    defaultFolderId?: string,
    defaultAreaId?: string,
    areas?: Array<{ id: string; title: string }>,
    size?: ModalSize
  ) => void;
  openActivityModal: (
    task: TaskResponse,
    date: string,
    onSave: (data: ActivityFormData) => Promise<void>,
    onOpenTaskDetails: () => void,
    onSaveEdit?: (eventId: string, data: EventUpdateRequest) => Promise<void>,
    onDeleteEvent?: (event: EventResponse) => Promise<void>
  ) => void;
  closeAreaModal: () => void;
  closeFolderModal: () => void;
  closeTaskModal: () => void;
  closeActivityModal: () => void;
  closePanel: () => void;
  toggleCollapse: () => void;
  isPanelOpen: boolean;
  isCollapsed: boolean;
  areaState: AreaState;
  folderState: FolderState;
  taskState: TaskState;
  activityState: ActivityState;
}

const TaskerDetailPanelContext = createContext<TaskerDetailPanelApi | undefined>(undefined);

export const useTaskerDetailPanel = (): TaskerDetailPanelApi => {
  const ctx = useContext(TaskerDetailPanelContext);
  if (!ctx) throw new Error('useTaskerDetailPanel must be used within TaskerDetailPanelProvider');
  return ctx;
};

export const TaskerDetailPanelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [areaState, setAreaState] = useState<AreaState>(initArea);
  const [folderState, setFolderState] = useState<FolderState>(initFolder);
  const [taskState, setTaskState] = useState<TaskState>(initTask);
  const [activityState, setActivityState] = useState<ActivityState>(initActivity);

  const clearStates = useCallback(() => {
    setAreaState(initArea);
    setFolderState(initFolder);
    setTaskState(initTask);
    setActivityState(initActivity);
  }, []);

  const activatePanel = useCallback(() => {
    setIsPanelOpen(true);
    setIsCollapsed(false);
  }, []);

  const closePanel = useCallback(() => {
    setIsPanelOpen(false);
    setIsCollapsed(false);
    clearStates();
  }, [clearStates]);

  const openAreaModal = useCallback<TaskerDetailPanelApi['openAreaModal']>((area, _mode, onSave, onDelete, size = 'medium') => {
    clearStates();
    setAreaState({ isOpen: true, area, onSave, onDelete: onDelete ?? null, size });
    activatePanel();
  }, [activatePanel, clearStates]);

  const openFolderModal = useCallback<TaskerDetailPanelApi['openFolderModal']>((folder, _mode, areas, onSave, onDelete, areaId, parentFolderId, size = 'medium') => {
    clearStates();
    setFolderState({ isOpen: true, folder, areas, onSave, onDelete: onDelete ?? null, areaId, parentFolderId, size });
    activatePanel();
  }, [activatePanel, clearStates]);

  const openTaskModal = useCallback<TaskerDetailPanelApi['openTaskModal']>((task, _mode, onSave, onDelete, defaultFolderId, defaultAreaId, areas, size = 'medium') => {
    clearStates();
    setTaskState({ isOpen: true, task, onSave, onDelete: onDelete ?? null, defaultFolderId, defaultAreaId, areas, size });
    activatePanel();
  }, [activatePanel, clearStates]);

  const openActivityModal = useCallback<TaskerDetailPanelApi['openActivityModal']>((task, date, onSave, onOpenTaskDetails, onSaveEdit, onDeleteEvent) => {
    clearStates();
    setActivityState({ isOpen: true, task, date, onSave, onOpenTaskDetails, onSaveEdit: onSaveEdit ?? null, onDeleteEvent: onDeleteEvent ?? null });
    activatePanel();
  }, [activatePanel, clearStates]);

  const closeAreaModal = useCallback(() => setAreaState(initArea), []);
  const closeFolderModal = useCallback(() => setFolderState(initFolder), []);
  const closeTaskModal = useCallback(() => setTaskState(initTask), []);
  const closeActivityModal = useCallback(() => setActivityState(initActivity), []);
  const toggleCollapse = useCallback(() => setIsCollapsed((prev) => !prev), []);

  const value = useMemo<TaskerDetailPanelApi>(() => ({
    openAreaModal,
    openFolderModal,
    openTaskModal,
    openActivityModal,
    closeAreaModal,
    closeFolderModal,
    closeTaskModal,
    closeActivityModal,
    closePanel,
    toggleCollapse,
    isPanelOpen,
    isCollapsed,
    areaState,
    folderState,
    taskState,
    activityState,
  }), [
    openAreaModal,
    openFolderModal,
    openTaskModal,
    openActivityModal,
    closeAreaModal,
    closeFolderModal,
    closeTaskModal,
    closeActivityModal,
    closePanel,
    toggleCollapse,
    isPanelOpen,
    isCollapsed,
    areaState,
    folderState,
    taskState,
    activityState,
  ]);

  return <TaskerDetailPanelContext.Provider value={value}>{children}</TaskerDetailPanelContext.Provider>;
};

export const RightGlassDetailPanel: React.FC = () => {
  const {
    isPanelOpen,
    isCollapsed,
    toggleCollapse,
    closePanel,
    closeAreaModal,
    closeFolderModal,
    closeTaskModal,
    closeActivityModal,
    areaState,
    folderState,
    taskState,
    activityState,
  } = useTaskerDetailPanel();

  if (!isPanelOpen) return null;

  return (
    <aside className={`${css.detailPanel} ${isCollapsed ? css.collapsed : ''}`}>
      <div className={css.detailPanelHeader}>
        <span className={css.detailPanelTitle}>Детали</span>
        <div className={css.detailPanelActions}>
          <GlassButton variant="subtle" size="xs" onClick={toggleCollapse} aria-label={isCollapsed ? 'Развернуть панель' : 'Свернуть панель'}>
            {isCollapsed ? <UnfoldVerticalIcon className="icon-m" /> : <FoldVerticalIcon className="icon-m" />}
          </GlassButton>
          <GlassButton variant="subtle" size="xs" onClick={closePanel} aria-label="Закрыть панель">
            <CloseIcon className="icon-m" />
          </GlassButton>
        </div>
      </div>
      {!isCollapsed && (
        <div className={css.detailPanelBody}>
          <AreaModal isOpen={areaState.isOpen} onClose={closeAreaModal} onSave={areaState.onSave ?? (async () => {})} onDelete={areaState.onDelete ?? undefined} area={areaState.area} size={areaState.size} renderMode="inline" />
          <FolderModal isOpen={folderState.isOpen} onClose={closeFolderModal} onSave={folderState.onSave ?? (async () => {})} onDelete={folderState.onDelete ?? undefined} folder={folderState.folder} areas={folderState.areas} defaultAreaId={folderState.areaId} defaultParentFolderId={folderState.parentFolderId} size={folderState.size} renderMode="inline" />
          <TaskModal isOpen={taskState.isOpen} onClose={closeTaskModal} onSave={taskState.onSave ?? (async () => {})} onDelete={taskState.onDelete ?? undefined} task={taskState.task} defaultFolderId={taskState.defaultFolderId} defaultAreaId={taskState.defaultAreaId} areas={taskState.areas} size={taskState.size} renderMode="inline" />
          {activityState.task && (
            <ActivityModal isOpen={activityState.isOpen} onClose={closeActivityModal} onSave={activityState.onSave ?? (async () => {})} task={activityState.task} date={activityState.date} onOpenTaskDetails={activityState.onOpenTaskDetails ?? (() => {})} onSaveEdit={activityState.onSaveEdit ?? undefined} onDeleteEvent={activityState.onDeleteEvent ?? undefined} renderMode="inline" />
          )}
        </div>
      )}
    </aside>
  );
};
