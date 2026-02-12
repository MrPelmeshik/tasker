import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ActivityModal } from '../components/activities/ActivityModal';
import { AreaModal } from '../components/areas/AreaModal';
import { CabinetModal } from '../components/cabinet/CabinetModal';
import { GroupModal } from '../components/groups/GroupModal';
import { TaskModal } from '../components/tasks/TaskModal';
import type { AreaResponse, GroupResponse, TaskResponse, AreaCreateRequest, AreaUpdateRequest, GroupCreateRequest, GroupUpdateRequest, TaskCreateRequest, TaskUpdateRequest } from '../types/api';
import type { ActivityFormData } from '../components/activities/ActivityModal';
import type { ModalSize } from '../types/modal-size';

interface ModalContextType {
  openAreaModal: (area: AreaResponse | null, mode: 'create' | 'edit', onSave: (data: AreaCreateRequest | AreaUpdateRequest) => Promise<void>, onDelete?: (id: string) => Promise<void>, size?: ModalSize) => void;
  openGroupModal: (group: GroupResponse | null, mode: 'create' | 'edit', areas: AreaResponse[], onSave: (data: GroupCreateRequest | GroupUpdateRequest, groupId?: string) => Promise<void>, onDelete?: (id: string) => Promise<void>, areaId?: string, size?: ModalSize) => void;
  openTaskModal: (task: TaskResponse | null, mode: 'create' | 'edit', groups: GroupResponse[], onSave: (data: TaskCreateRequest | TaskUpdateRequest, taskId?: string) => Promise<void>, onDelete?: (id: string) => Promise<void>, groupId?: string, areaId?: string, size?: ModalSize) => void;
  openActivityModal: (task: TaskResponse, date: string, onSave: (data: ActivityFormData) => Promise<void>, onOpenTaskDetails: () => void) => void;
  openCabinetModal: () => void;
  closeAreaModal: () => void;
  closeGroupModal: () => void;
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

  const [groupModal, setGroupModal] = useState<{
    isOpen: boolean;
    group: GroupResponse | null;
    mode: 'create' | 'edit';
    areas: AreaResponse[];
    onSave: ((data: GroupCreateRequest | GroupUpdateRequest, groupId?: string) => Promise<void>) | null;
    onDelete: ((id: string) => Promise<void>) | null;
    areaId?: string;
    size: ModalSize;
  }>({ isOpen: false, group: null, mode: 'create', areas: [], onSave: null, onDelete: null, size: 'medium' });

  const [taskModal, setTaskModal] = useState<{
    isOpen: boolean;
    task: TaskResponse | null;
    mode: 'create' | 'edit';
    groups: GroupResponse[];
    onSave: ((data: TaskCreateRequest | TaskUpdateRequest, taskId?: string) => Promise<void>) | null;
    onDelete: ((id: string) => Promise<void>) | null;
    groupId?: string;
    areaId?: string;
    size: ModalSize;
  }>({ isOpen: false, task: null, mode: 'create', groups: [], onSave: null, onDelete: null, size: 'medium' });

  const [activityModal, setActivityModal] = useState<{
    isOpen: boolean;
    task: TaskResponse | null;
    date: string | null;
    onSave: ((data: ActivityFormData) => Promise<void>) | null;
    onOpenTaskDetails: (() => void) | null;
  }>({ isOpen: false, task: null, date: null, onSave: null, onOpenTaskDetails: null });

  const [cabinetModal, setCabinetModal] = useState<{ isOpen: boolean }>({ isOpen: false });

  const openAreaModal = (area: AreaResponse | null, mode: 'create' | 'edit', onSave: (data: AreaCreateRequest | AreaUpdateRequest) => Promise<void>, onDelete?: (id: string) => Promise<void>, size: ModalSize = 'medium') => {
    setAreaModal({ isOpen: true, area, mode, onSave, onDelete: onDelete ?? null, size });
  };

  const openGroupModal = (group: GroupResponse | null, mode: 'create' | 'edit', areas: AreaResponse[], onSave: (data: GroupCreateRequest | GroupUpdateRequest, groupId?: string) => Promise<void>, onDelete?: (id: string) => Promise<void>, areaId?: string, size: ModalSize = 'medium') => {
    setGroupModal({ isOpen: true, group, mode, areas, onSave, onDelete: onDelete ?? null, areaId, size });
  };

  const openTaskModal = (task: TaskResponse | null, mode: 'create' | 'edit', groups: GroupResponse[], onSave: (data: TaskCreateRequest | TaskUpdateRequest, taskId?: string) => Promise<void>, onDelete?: (id: string) => Promise<void>, groupId?: string, areaId?: string, size: ModalSize = 'medium') => {
    setTaskModal({ isOpen: true, task, mode, groups, onSave, onDelete: onDelete ?? null, groupId, areaId, size });
  };

  const openActivityModal = (task: TaskResponse, date: string, onSave: (data: ActivityFormData) => Promise<void>, onOpenTaskDetails: () => void) => {
    setActivityModal({ isOpen: true, task, date, onSave, onOpenTaskDetails });
  };

  const closeAreaModal = () => {
    setAreaModal({ isOpen: false, area: null, mode: 'create', onSave: null, onDelete: null, size: 'medium' });
  };

  const closeGroupModal = () => {
    setGroupModal({ isOpen: false, group: null, mode: 'create', areas: [], onSave: null, onDelete: null, size: 'medium' });
  };

  const closeTaskModal = () => {
    setTaskModal({ isOpen: false, task: null, mode: 'create', groups: [], onSave: null, onDelete: null, size: 'medium' });
  };

  const closeActivityModal = () => {
    setActivityModal({ isOpen: false, task: null, date: null, onSave: null, onOpenTaskDetails: null });
  };

  const openCabinetModal = () => {
    setCabinetModal({ isOpen: true });
  };

  const closeCabinetModal = () => {
    setCabinetModal({ isOpen: false });
  };

  return (
    <ModalContext.Provider value={{ openAreaModal, openGroupModal, openTaskModal, openActivityModal, openCabinetModal, closeAreaModal, closeGroupModal, closeTaskModal, closeActivityModal, closeCabinetModal }}>
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

      <GroupModal
        isOpen={groupModal.isOpen}
        onClose={closeGroupModal}
        onSave={groupModal.onSave || (() => Promise.resolve())}
        onDelete={groupModal.onDelete ?? undefined}
        group={groupModal.group}
        areas={groupModal.areas}
        title={groupModal.mode === 'create' ? 'Создание группы' : 'Редактирование группы'}
        size={groupModal.size}
        defaultAreaId={groupModal.areaId}
      />

      <TaskModal
        isOpen={taskModal.isOpen}
        onClose={closeTaskModal}
        onSave={taskModal.onSave || (() => Promise.resolve())}
        onDelete={taskModal.onDelete ?? undefined}
        task={taskModal.task}
        groups={taskModal.groups}
        title={taskModal.mode === 'create' ? 'Создание задачи' : 'Редактирование задачи'}
        size={taskModal.size}
        defaultGroupId={taskModal.groupId}
        defaultAreaId={taskModal.areaId}
      />

      {activityModal.task && (
        <ActivityModal
          isOpen={activityModal.isOpen}
          onClose={closeActivityModal}
          onSave={activityModal.onSave || (() => Promise.resolve())}
          task={activityModal.task}
          date={activityModal.date}
          onOpenTaskDetails={activityModal.onOpenTaskDetails || (() => {})}
        />
      )}

      <CabinetModal isOpen={cabinetModal.isOpen} onClose={closeCabinetModal} />
    </ModalContext.Provider>
  );
};
