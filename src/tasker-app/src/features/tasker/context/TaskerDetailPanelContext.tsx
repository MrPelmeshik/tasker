import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { GlassButton } from '../../../components/ui/GlassButton';
import { CloseIcon, FoldVerticalIcon, UnfoldVerticalIcon } from '../../../components/icons';
import { AreaDetailEditor } from '../../../components/areas/AreaModal';
import { FolderDetailEditor } from '../../../components/folders/FolderDetailEditor';
import { TaskDetailEditor } from '../../../components/tasks/TaskDetailEditor';
import { ActivityDetailEditor } from '../../../components/activities/ActivityDetailEditor';
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
import type { ActivityFormData } from '../../../components/activities/ActivityDetailEditor';
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
  onOpenTaskDetail: (() => void) | null;
  onSaveEdit: ((eventId: string, data: EventUpdateRequest) => Promise<void>) | null;
  onDeleteEvent: ((event: EventResponse) => Promise<void>) | null;
};

const initArea: AreaState = { isOpen: false, area: null, onSave: null, onDelete: null, size: 'medium' };
const initFolder: FolderState = { isOpen: false, folder: null, areas: [], onSave: null, onDelete: null, size: 'medium' };
const initTask: TaskState = { isOpen: false, task: null, onSave: null, onDelete: null, size: 'medium' };
const initActivity: ActivityState = { isOpen: false, task: null, date: null, onSave: null, onOpenTaskDetail: null, onSaveEdit: null, onDeleteEvent: null };

/** Заголовок и действия сущности в объединённой шапке панели */
export type DetailPanelChrome = { title: React.ReactNode; actions: React.ReactNode } | null;

export interface TaskerDetailPanelApi {
  openAreaDetail: (
    area: AreaResponse | null,
    mode: 'create' | 'edit',
    onSave: (data: AreaCreateRequest | AreaUpdateRequest) => Promise<void>,
    onDelete?: (id: string) => Promise<void>,
    size?: ModalSize
  ) => void;
  openFolderDetail: (
    folder: FolderResponse | null,
    mode: 'create' | 'edit',
    areas: Array<{ id: string; title: string; description?: string }>,
    onSave: (data: FolderCreateRequest | FolderUpdateRequest, folderId?: string) => Promise<void>,
    onDelete?: (id: string) => Promise<void>,
    areaId?: string,
    parentFolderId?: string | null,
    size?: ModalSize
  ) => void;
  openTaskDetail: (
    task: TaskResponse | null,
    mode: 'create' | 'edit',
    onSave: (data: TaskCreateRequest | TaskUpdateRequest, taskId?: string) => Promise<void>,
    onDelete?: (id: string) => Promise<void>,
    defaultFolderId?: string,
    defaultAreaId?: string,
    areas?: Array<{ id: string; title: string }>,
    size?: ModalSize
  ) => void;
  openActivityDetail: (
    task: TaskResponse,
    date: string,
    onSave: (data: ActivityFormData) => Promise<void>,
    onOpenTaskDetail: () => void,
    onSaveEdit?: (eventId: string, data: EventUpdateRequest) => Promise<void>,
    onDeleteEvent?: (event: EventResponse) => Promise<void>
  ) => void;
  closeAreaDetail: () => void;
  closeFolderDetail: () => void;
  closeTaskDetail: () => void;
  closeActivityDetail: () => void;
  closePanel: () => void;
  toggleCollapse: () => void;
  isPanelOpen: boolean;
  isCollapsed: boolean;
  areaDetail: AreaState;
  folderDetail: FolderState;
  taskDetail: TaskState;
  activityDetail: ActivityState;
  /** Заголовок и кнопки активного редактора в шапке панели */
  detailChrome: DetailPanelChrome;
  setDetailChrome: (value: DetailPanelChrome) => void;
  /**
   * Регистрирует обработчик «закрыть панель» (учёт несохранённых изменений).
   * Вызывать из редактора в панели; сбрасывать в cleanup.
   */
  registerDetailPanelCloseHandler: (handler: (() => void) | null) => void;
  /** Вызов из кнопки закрытия панели */
  requestDetailPanelClose: () => void;
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
  const [areaDetail, setAreaDetail] = useState<AreaState>(initArea);
  const [folderDetail, setFolderDetail] = useState<FolderState>(initFolder);
  const [taskDetail, setTaskDetail] = useState<TaskState>(initTask);
  const [activityDetail, setActivityDetail] = useState<ActivityState>(initActivity);
  const [detailChrome, setDetailChrome] = useState<DetailPanelChrome>(null);
  const detailPanelCloseRef = useRef<(() => void) | null>(null);

  const clearStates = useCallback(() => {
    setAreaDetail(initArea);
    setFolderDetail(initFolder);
    setTaskDetail(initTask);
    setActivityDetail(initActivity);
  }, []);

  const activatePanel = useCallback(() => {
    setIsPanelOpen(true);
    setIsCollapsed(false);
    setDetailChrome(null);
    detailPanelCloseRef.current = null;
  }, []);

  const closePanel = useCallback(() => {
    setIsPanelOpen(false);
    setIsCollapsed(false);
    setDetailChrome(null);
    detailPanelCloseRef.current = null;
    clearStates();
  }, [clearStates]);

  const registerDetailPanelCloseHandler = useCallback((handler: (() => void) | null) => {
    detailPanelCloseRef.current = handler;
  }, []);

  const requestDetailPanelClose = useCallback(() => {
    const fn = detailPanelCloseRef.current;
    if (fn) {
      fn();
      return;
    }
    closePanel();
  }, [closePanel]);

  const openAreaDetail = useCallback<TaskerDetailPanelApi['openAreaDetail']>((area, _mode, onSave, onDelete, size = 'medium') => {
    clearStates();
    setAreaDetail({ isOpen: true, area, onSave, onDelete: onDelete ?? null, size });
    activatePanel();
  }, [activatePanel, clearStates]);

  const openFolderDetail = useCallback<TaskerDetailPanelApi['openFolderDetail']>((folder, _mode, areas, onSave, onDelete, areaId, parentFolderId, size = 'medium') => {
    clearStates();
    setFolderDetail({ isOpen: true, folder, areas, onSave, onDelete: onDelete ?? null, areaId, parentFolderId, size });
    activatePanel();
  }, [activatePanel, clearStates]);

  const openTaskDetail = useCallback<TaskerDetailPanelApi['openTaskDetail']>((task, _mode, onSave, onDelete, defaultFolderId, defaultAreaId, areas, size = 'medium') => {
    clearStates();
    setTaskDetail({ isOpen: true, task, onSave, onDelete: onDelete ?? null, defaultFolderId, defaultAreaId, areas, size });
    activatePanel();
  }, [activatePanel, clearStates]);

  const openActivityDetail = useCallback<TaskerDetailPanelApi['openActivityDetail']>((task, date, onSave, onOpenTaskDetail, onSaveEdit, onDeleteEvent) => {
    clearStates();
    setActivityDetail({ isOpen: true, task, date, onSave, onOpenTaskDetail, onSaveEdit: onSaveEdit ?? null, onDeleteEvent: onDeleteEvent ?? null });
    activatePanel();
  }, [activatePanel, clearStates]);

  const closeAreaDetail = useCallback(() => setAreaDetail(initArea), []);
  const closeFolderDetail = useCallback(() => setFolderDetail(initFolder), []);
  const closeTaskDetail = useCallback(() => setTaskDetail(initTask), []);
  const closeActivityDetail = useCallback(() => setActivityDetail(initActivity), []);
  const toggleCollapse = useCallback(() => setIsCollapsed((prev) => !prev), []);

  const value = useMemo<TaskerDetailPanelApi>(() => ({
    openAreaDetail,
    openFolderDetail,
    openTaskDetail,
    openActivityDetail,
    closeAreaDetail,
    closeFolderDetail,
    closeTaskDetail,
    closeActivityDetail,
    closePanel,
    toggleCollapse,
    isPanelOpen,
    isCollapsed,
    areaDetail,
    folderDetail,
    taskDetail,
    activityDetail,
    detailChrome,
    setDetailChrome,
    registerDetailPanelCloseHandler,
    requestDetailPanelClose,
  }), [
    openAreaDetail,
    openFolderDetail,
    openTaskDetail,
    openActivityDetail,
    closeAreaDetail,
    closeFolderDetail,
    closeTaskDetail,
    closeActivityDetail,
    closePanel,
    toggleCollapse,
    isPanelOpen,
    isCollapsed,
    areaDetail,
    folderDetail,
    taskDetail,
    activityDetail,
    detailChrome,
    registerDetailPanelCloseHandler,
    requestDetailPanelClose,
  ]);

  return <TaskerDetailPanelContext.Provider value={value}>{children}</TaskerDetailPanelContext.Provider>;
};

export const RightGlassDetailPanel: React.FC = () => {
  const {
    isPanelOpen,
    isCollapsed,
    toggleCollapse,
    closePanel,
    areaDetail,
    folderDetail,
    taskDetail,
    activityDetail,
    detailChrome,
    requestDetailPanelClose,
  } = useTaskerDetailPanel();

  if (!isPanelOpen) return null;

  return (
    <aside className={`${css.detailPanel} ${isCollapsed ? css.collapsed : ''}`}>
      <div className={css.detailPanelHeader}>
        {!isCollapsed && (
          <div className={css.detailPanelLead}>
            {detailChrome ? (
              <>
                <span className={css.detailEntityTitle}>{detailChrome.title}</span>
                <div className={css.detailEntityActions}>{detailChrome.actions}</div>
              </>
            ) : (
              <span className={css.detailPanelTitle}>Детали</span>
            )}
          </div>
        )}
        <div className={css.detailPanelActions}>
          <GlassButton variant="subtle" size="xs" onClick={toggleCollapse} aria-label={isCollapsed ? 'Развернуть панель' : 'Свернуть панель'}>
            {isCollapsed ? <UnfoldVerticalIcon className="icon-m" /> : <FoldVerticalIcon className="icon-m" />}
          </GlassButton>
          <GlassButton variant="subtle" size="xs" onClick={() => requestDetailPanelClose()} aria-label="Закрыть панель">
            <CloseIcon className="icon-m" />
          </GlassButton>
        </div>
      </div>
      {!isCollapsed && (
        <div className={css.detailPanelBody}>
          <AreaDetailEditor isOpen={areaDetail.isOpen} onClose={closePanel} onSave={areaDetail.onSave ?? (async () => {})} onDelete={areaDetail.onDelete ?? undefined} area={areaDetail.area} size={areaDetail.size} />
          <FolderDetailEditor isOpen={folderDetail.isOpen} onClose={closePanel} onSave={folderDetail.onSave ?? (async () => {})} onDelete={folderDetail.onDelete ?? undefined} folder={folderDetail.folder} areas={folderDetail.areas} defaultAreaId={folderDetail.areaId} defaultParentFolderId={folderDetail.parentFolderId} size={folderDetail.size} />
          <TaskDetailEditor isOpen={taskDetail.isOpen} onClose={closePanel} onSave={taskDetail.onSave ?? (async () => {})} onDelete={taskDetail.onDelete ?? undefined} task={taskDetail.task} defaultFolderId={taskDetail.defaultFolderId} defaultAreaId={taskDetail.defaultAreaId} areas={taskDetail.areas} size={taskDetail.size} />
          {activityDetail.task && (
            <ActivityDetailEditor isOpen={activityDetail.isOpen} onClose={closePanel} onSave={activityDetail.onSave ?? (async () => {})} task={activityDetail.task} date={activityDetail.date} onOpenTaskDetail={activityDetail.onOpenTaskDetail ?? (() => {})} onSaveEdit={activityDetail.onSaveEdit ?? undefined} onDeleteEvent={activityDetail.onDeleteEvent ?? undefined} />
          )}
        </div>
      )}
    </aside>
  );
};
