import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ActivityModal } from '../components/activities/ActivityModal';
import { AreaModal } from '../components/areas/AreaModal';
import { CabinetModal } from '../components/cabinet/CabinetModal';
import { FolderModal } from '../components/folders/FolderModal';
import { TaskModal } from '../components/tasks/TaskModal';
import type { AreaResponse, FolderResponse, TaskResponse, AreaCreateRequest, AreaUpdateRequest, FolderCreateRequest, FolderUpdateRequest, TaskCreateRequest, TaskUpdateRequest } from '../types/api';
import type { ActivityFormData } from '../components/activities/ActivityModal';
import type { EventResponse, EventUpdateRequest } from '../types/api';
import type { ModalSize } from '../types/modal-size';

export interface ModalContextType {
  openAreaModal: (area: AreaResponse | null, mode: 'create' | 'edit', onSave: (data: AreaCreateRequest | AreaUpdateRequest) => Promise<void>, onDelete?: (id: string) => Promise<void>, size?: ModalSize) => void;
  openFolderModal: (folder: FolderResponse | null, mode: 'create' | 'edit', areas: Array<{ id: string; title: string; description?: string }>, onSave: (data: FolderCreateRequest | FolderUpdateRequest, folderId?: string) => Promise<void>, onDelete?: (id: string) => Promise<void>, areaId?: string, parentFolderId?: string | null, size?: ModalSize) => void;
  openTaskModal: (task: TaskResponse | null, mode: 'create' | 'edit', onSave: (data: TaskCreateRequest | TaskUpdateRequest, taskId?: string) => Promise<void>, onDelete?: (id: string) => Promise<void>, defaultFolderId?: string, defaultAreaId?: string, areas?: Array<{ id: string; title: string }>, size?: ModalSize) => void;
  openActivityModal: (
    task: TaskResponse,
    date: string,
    onSave: (data: ActivityFormData) => Promise<void>,
    onOpenTaskDetails: () => void,
    onSaveEdit?: (eventId: string, data: EventUpdateRequest) => Promise<void>,
    onDeleteEvent?: (event: EventResponse) => Promise<void>
  ) => void;
  openCabinetModal: () => void;
  closeAreaModal: () => void;
  closeFolderModal: () => void;
  closeTaskModal: () => void;
  closeActivityModal: () => void;
  closeCabinetModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

interface ModalProviderProps {
  children: ReactNode;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [areaModal, setAreaModal] = useState<{
    isOpen: boolean;
    area: AreaResponse | null;
    mode: 'create' | 'edit';
    onSave: ((data: AreaCreateRequest | AreaUpdateRequest) => Promise<void>) | null;
    onDelete: ((id: string) => Promise<void>) | null;
    size: ModalSize;
  }>({ isOpen: false, area: null, mode: 'create', onSave: null, onDelete: null, size: 'medium' });

  const [folderModal, setFolderModal] = useState<{
    isOpen: boolean;
    folder: FolderResponse | null;
    mode: 'create' | 'edit';
    areas: Array<{ id: string; title: string; description?: string }>;
    onSave: ((data: FolderCreateRequest | FolderUpdateRequest, folderId?: string) => Promise<void>) | null;
    onDelete: ((id: string) => Promise<void>) | null;
    areaId?: string;
    parentFolderId?: string | null;
    size: ModalSize;
  }>({ isOpen: false, folder: null, mode: 'create', areas: [], onSave: null, onDelete: null, size: 'medium' });

  const [taskModal, setTaskModal] = useState<{
    isOpen: boolean;
    task: TaskResponse | null;
    mode: 'create' | 'edit';
    onSave: ((data: TaskCreateRequest | TaskUpdateRequest, taskId?: string) => Promise<void>) | null;
    onDelete: ((id: string) => Promise<void>) | null;
    defaultFolderId?: string;
    defaultAreaId?: string;
    areas?: Array<{ id: string; title: string }>;
    size: ModalSize;
  }>({ isOpen: false, task: null, mode: 'create', onSave: null, onDelete: null, size: 'medium' });

  const [activityModal, setActivityModal] = useState<{
    isOpen: boolean;
    task: TaskResponse | null;
    date: string | null;
    onSave: ((data: ActivityFormData) => Promise<void>) | null;
    onOpenTaskDetails: (() => void) | null;
    onSaveEdit: ((eventId: string, data: EventUpdateRequest) => Promise<void>) | null;
    onDeleteEvent: ((event: EventResponse) => Promise<void>) | null;
  }>({ isOpen: false, task: null, date: null, onSave: null, onOpenTaskDetails: null, onSaveEdit: null, onDeleteEvent: null });

  const [cabinetModal, setCabinetModal] = useState<{ isOpen: boolean }>({ isOpen: false });

  const openAreaModal = (area: AreaResponse | null, mode: 'create' | 'edit', onSave: (data: AreaCreateRequest | AreaUpdateRequest) => Promise<void>, onDelete?: (id: string) => Promise<void>, size: ModalSize = 'medium') => {
    setAreaModal({ isOpen: true, area, mode, onSave, onDelete: onDelete ?? null, size });
  };

  const openFolderModal = (folder: FolderResponse | null, mode: 'create' | 'edit', areas: Array<{ id: string; title: string; description?: string }>, onSave: (data: FolderCreateRequest | FolderUpdateRequest, folderId?: string) => Promise<void>, onDelete?: (id: string) => Promise<void>, areaId?: string, parentFolderId?: string | null, size: ModalSize = 'medium') => {
    setFolderModal({ isOpen: true, folder, mode, areas, onSave, onDelete: onDelete ?? null, areaId, parentFolderId, size });
  };

  const openTaskModal = (task: TaskResponse | null, mode: 'create' | 'edit', onSave: (data: TaskCreateRequest | TaskUpdateRequest, taskId?: string) => Promise<void>, onDelete?: (id: string) => Promise<void>, defaultFolderId?: string, defaultAreaId?: string, areas?: Array<{ id: string; title: string }>, size: ModalSize = 'medium') => {
    setTaskModal({ isOpen: true, task, mode, onSave, onDelete: onDelete ?? null, defaultFolderId, defaultAreaId, areas, size });
  };

  const openActivityModal = (
    task: TaskResponse,
    date: string,
    onSave: (data: ActivityFormData) => Promise<void>,
    onOpenTaskDetails: () => void,
    onSaveEdit?: (eventId: string, data: EventUpdateRequest) => Promise<void>,
    onDeleteEvent?: (event: EventResponse) => Promise<void>
  ) => {
    setActivityModal({ isOpen: true, task, date, onSave, onOpenTaskDetails, onSaveEdit: onSaveEdit ?? null, onDeleteEvent: onDeleteEvent ?? null });
  };

  const closeAreaModal = () => {
    setAreaModal({ isOpen: false, area: null, mode: 'create', onSave: null, onDelete: null, size: 'medium' });
  };

  const closeFolderModal = () => {
    setFolderModal({ isOpen: false, folder: null, mode: 'create', areas: [], onSave: null, onDelete: null, size: 'medium' });
  };

  const closeTaskModal = () => {
    setTaskModal({ isOpen: false, task: null, mode: 'create', onSave: null, onDelete: null, areas: undefined, size: 'medium' });
  };

  const closeActivityModal = () => {
    setActivityModal({ isOpen: false, task: null, date: null, onSave: null, onOpenTaskDetails: null, onSaveEdit: null, onDeleteEvent: null });
  };

  const openCabinetModal = () => {
    setCabinetModal({ isOpen: true });
  };

  const closeCabinetModal = () => {
    setCabinetModal({ isOpen: false });
  };

  return (
    <ModalContext.Provider value={{ openAreaModal, openFolderModal, openTaskModal, openActivityModal, openCabinetModal, closeAreaModal, closeFolderModal, closeTaskModal, closeActivityModal, closeCabinetModal }}>
      {children}
      
      {/* Модальные окна на уровне приложения */}
      <AreaModal
        isOpen={areaModal.isOpen}
        onClose={closeAreaModal}
        onSave={areaModal.onSave || (() => Promise.resolve())}
        onDelete={areaModal.onDelete ?? undefined}
        area={areaModal.area}
        title={areaModal.mode === 'create' ? 'Создание области' : 'Редактирование области'}
        size={areaModal.size}
      />

      <FolderModal
        isOpen={folderModal.isOpen}
        onClose={closeFolderModal}
        onSave={folderModal.onSave || (() => Promise.resolve())}
        onDelete={folderModal.onDelete ?? undefined}
        folder={folderModal.folder}
        areas={folderModal.areas}
        title={folderModal.mode === 'create' ? 'Создание папки' : 'Редактирование папки'}
        size={folderModal.size}
        defaultAreaId={folderModal.areaId}
        defaultParentFolderId={folderModal.parentFolderId}
      />

      <TaskModal
        isOpen={taskModal.isOpen}
        onClose={closeTaskModal}
        onSave={taskModal.onSave || (() => Promise.resolve())}
        onDelete={taskModal.onDelete ?? undefined}
        task={taskModal.task}
        title={taskModal.mode === 'create' ? 'Создание задачи' : 'Редактирование задачи'}
        size={taskModal.size}
        defaultFolderId={taskModal.defaultFolderId}
        defaultAreaId={taskModal.defaultAreaId}
        areas={taskModal.areas}
      />

      {activityModal.task && (
        <ActivityModal
          isOpen={activityModal.isOpen}
          onClose={closeActivityModal}
          onSave={activityModal.onSave || (() => Promise.resolve())}
          task={activityModal.task}
          date={activityModal.date}
          onOpenTaskDetails={activityModal.onOpenTaskDetails || (() => {})}
          onSaveEdit={activityModal.onSaveEdit ?? undefined}
          onDeleteEvent={activityModal.onDeleteEvent ?? undefined}
        />
      )}

      <CabinetModal isOpen={cabinetModal.isOpen} onClose={closeCabinetModal} />
    </ModalContext.Provider>
  );
};
