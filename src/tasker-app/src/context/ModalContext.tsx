import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AreaModal } from '../components/areas/AreaModal';
import { GroupModal } from '../components/groups/GroupModal';
import { TaskModal } from '../components/tasks/TaskModal';
import type { AreaResponse, GroupResponse, TaskResponse, AreaCreateRequest, AreaUpdateRequest, GroupCreateRequest, GroupUpdateRequest, TaskCreateRequest, TaskUpdateRequest } from '../types/api';
import type { ModalSize } from '../types/modal-size';

interface ModalContextType {
  openAreaModal: (area: AreaResponse | null, mode: 'create' | 'edit', onSave: (data: AreaCreateRequest | AreaUpdateRequest) => Promise<void>, size?: ModalSize) => void;
  openGroupModal: (group: GroupResponse | null, mode: 'create' | 'edit', areas: AreaResponse[], onSave: (data: GroupCreateRequest | GroupUpdateRequest, groupId?: string) => Promise<void>, areaId?: string, size?: ModalSize) => void;
  openTaskModal: (task: TaskResponse | null, mode: 'create' | 'edit', groups: GroupResponse[], onSave: (data: TaskCreateRequest | TaskUpdateRequest, taskId?: string) => Promise<void>, groupId?: string, areaId?: string, size?: ModalSize) => void;
  closeAreaModal: () => void;
  closeGroupModal: () => void;
  closeTaskModal: () => void;
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
    size: ModalSize;
  }>({ isOpen: false, area: null, mode: 'create', onSave: null, size: 'medium' });

  const [groupModal, setGroupModal] = useState<{
    isOpen: boolean;
    group: GroupResponse | null;
    mode: 'create' | 'edit';
    areas: AreaResponse[];
    onSave: ((data: GroupCreateRequest | GroupUpdateRequest, groupId?: string) => Promise<void>) | null;
    areaId?: string;
    size: ModalSize;
  }>({ isOpen: false, group: null, mode: 'create', areas: [], onSave: null, size: 'medium' });

  const [taskModal, setTaskModal] = useState<{
    isOpen: boolean;
    task: TaskResponse | null;
    mode: 'create' | 'edit';
    groups: GroupResponse[];
    onSave: ((data: TaskCreateRequest | TaskUpdateRequest, taskId?: string) => Promise<void>) | null;
    groupId?: string;
    areaId?: string;
    size: ModalSize;
  }>({ isOpen: false, task: null, mode: 'create', groups: [], onSave: null, size: 'medium' });

  const openAreaModal = (area: AreaResponse | null, mode: 'create' | 'edit', onSave: (data: AreaCreateRequest | AreaUpdateRequest) => Promise<void>, size: ModalSize = 'medium') => {
    setAreaModal({ isOpen: true, area, mode, onSave, size });
  };

  const openGroupModal = (group: GroupResponse | null, mode: 'create' | 'edit', areas: AreaResponse[], onSave: (data: GroupCreateRequest | GroupUpdateRequest, groupId?: string) => Promise<void>, areaId?: string, size: ModalSize = 'medium') => {
    setGroupModal({ isOpen: true, group, mode, areas, onSave, areaId, size });
  };

  const openTaskModal = (task: TaskResponse | null, mode: 'create' | 'edit', groups: GroupResponse[], onSave: (data: TaskCreateRequest | TaskUpdateRequest, taskId?: string) => Promise<void>, groupId?: string, areaId?: string, size: ModalSize = 'medium') => {
    setTaskModal({ isOpen: true, task, mode, groups, onSave, groupId, areaId, size });
  };

  const closeAreaModal = () => {
    setAreaModal({ isOpen: false, area: null, mode: 'create', onSave: null, size: 'medium' });
  };

  const closeGroupModal = () => {
    setGroupModal({ isOpen: false, group: null, mode: 'create', areas: [], onSave: null, size: 'medium' });
  };

  const closeTaskModal = () => {
    setTaskModal({ isOpen: false, task: null, mode: 'create', groups: [], onSave: null, size: 'medium' });
  };

  return (
    <ModalContext.Provider value={{ openAreaModal, openGroupModal, openTaskModal, closeAreaModal, closeGroupModal, closeTaskModal }}>
      {children}
      
      {/* Модальные окна на уровне приложения */}
      <AreaModal
        isOpen={areaModal.isOpen}
        onClose={closeAreaModal}
        onSave={areaModal.onSave || (() => Promise.resolve())}
        area={areaModal.area}
        title={areaModal.mode === 'create' ? 'Создание области' : 'Редактирование области'}
        size={areaModal.size}
      />

      <GroupModal
        isOpen={groupModal.isOpen}
        onClose={closeGroupModal}
        onSave={groupModal.onSave || (() => Promise.resolve())}
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
        task={taskModal.task}
        groups={taskModal.groups}
        title={taskModal.mode === 'create' ? 'Создание задачи' : 'Редактирование задачи'}
        size={taskModal.size}
        defaultGroupId={taskModal.groupId}
        defaultAreaId={taskModal.areaId}
      />
    </ModalContext.Provider>
  );
};
