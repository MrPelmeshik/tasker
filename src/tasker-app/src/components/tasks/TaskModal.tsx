import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  GlassInput,
  GlassTextarea,
  GlassSelect,
  ModalCloseButton,
  ModalCancelButton,
  ModalSaveButton,
  ModalDeleteButton,
  ModalEditButton,
  ModalResetFieldButton,
} from '../ui';
import { TaskStatusBadge } from '../ui/TaskStatusBadge';
import { ActivityList } from '../activities/ActivityList';
import { useEvents } from '../activities/useEvents';
import { useEntityFormModal } from '../../hooks';
import { useToast } from '../../context/ToastContext';
import { parseApiErrorMessage } from '../../utils/parse-api-error';
import { CONFIRM_UNSAVED_CHANGES, CONFIRM_RETURN_TO_VIEW, getConfirmDeleteConfig } from '../../constants/confirm-modals';
import css from '../../styles/modal.module.css';
import formCss from '../../styles/modal-form.module.css';
import type { TaskResponse, TaskCreateRequest, TaskUpdateRequest, GroupResponse } from '../../types';
import { TaskStatus, getTaskStatusOptions } from '../../types';
import type { ModalSize } from '../../types/modal-size';
import { fetchGroups } from '../../services/api';
import { formatDateTime } from '../../utils/date';

export interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: TaskCreateRequest | TaskUpdateRequest, taskId?: string) => Promise<void>;
  /** Колбэк при удалении записи (мягкое удаление) */
  onDelete?: (id: string) => Promise<void>;
  task?: TaskResponse | null; // null для создания новой задачи
  groups: GroupResponse[];
  title?: string;
  size?: ModalSize;
  defaultGroupId?: string; // ID группы по умолчанию для создания
  defaultAreaId?: string; // ID области по умолчанию для создания
  /** Список областей для селектора (при наличии — показывается выбор области) */
  areas?: Array<{ id: string; title: string }>;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  task = null,
  groups,
  title = 'Задача',
  size = 'medium',
  defaultGroupId,
  defaultAreaId,
  areas,
}) => {
  const { addError } = useToast();
  const [allGroups, setAllGroups] = useState<GroupResponse[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState<string>('');

  const modal = useEntityFormModal<TaskCreateRequest>({
    isOpen,
    entity: task,
    getInitialData: () =>
      task
        ? {
            title: task.title,
            description: task.description || '',
            groupId: task.groupId,
            status: task.status || TaskStatus.New,
          }
        : {
            title: '',
            description: '',
            groupId: defaultGroupId || (groups.length > 0 ? groups[0].id : ''),
            status: TaskStatus.New,
          },
    deps: [task, groups, defaultGroupId],
    onClose,
    onSave: (data) => onSave(data, task?.id),
    onDelete,
    validate: (data) => Boolean(data.title?.trim() && data.groupId),
    getExtraUnsavedChanges: ({ originalData: orig }) => {
      if (!areas?.length || !allGroups.length) return false;
      const origAreaId = allGroups.find(g => g.id === orig.groupId)?.areaId ?? defaultAreaId ?? '';
      return selectedAreaId !== origAreaId;
    },
  });

  const {
    formData,
    originalData,
    fieldChanges,
    handleFieldChange,
    handleResetField,
    hasChanges,
    hasUnsavedChanges,
    showConfirmModal,
    showReturnToViewConfirm,
    showDeleteConfirm,
    handleClose,
    handleConfirmSave,
    handleConfirmDiscard,
    handleConfirmCancel,
    handleReturnToView,
    handleConfirmReturnToView,
    handleDeleteRequest,
    handleConfirmDelete,
    dismissReturnToViewConfirm,
    dismissDeleteConfirm,
    handleSave,
    isEditMode,
    setIsEditMode,
    isLoading,
  } = modal;

  const taskEvents = useEvents('task', task?.id);
  const isViewMode = Boolean(task && !isEditMode);

  /** Загрузка всех групп при наличии areas */
  useEffect(() => {
    if (isOpen && areas && areas.length > 0) {
      fetchGroups()
        .then(setAllGroups)
        .catch((err) => {
          console.error('Ошибка загрузки групп:', err);
          setAllGroups([]);
          addError(parseApiErrorMessage(err));
        });
    }
  }, [isOpen, areas, addError]);

  /** Синхронизация selectedAreaId с группой */
  useEffect(() => {
    if (isOpen && areas && areas.length > 0 && allGroups.length > 0 && formData.groupId) {
      const areaOfGroup = allGroups.find(g => g.id === formData.groupId)?.areaId;
      if (areaOfGroup) setSelectedAreaId(areaOfGroup);
    } else if (isOpen && areas && areas.length > 0 && allGroups.length > 0 && !formData.groupId && defaultAreaId) {
      setSelectedAreaId(defaultAreaId);
    }
  }, [isOpen, areas, allGroups, formData.groupId, defaultAreaId]);

  const originalAreaId =
    areas && allGroups.length > 0
      ? (allGroups.find(g => g.id === originalData.groupId)?.areaId ?? defaultAreaId ?? '')
      : '';
  const groupsFiltered =
    areas && areas.length > 0 ? allGroups.filter(g => g.areaId === selectedAreaId) : groups;
  const areaChanged = Boolean(areas?.length && selectedAreaId !== originalAreaId);

  const handleAreaChange = (areaId: string) => {
    setSelectedAreaId(areaId);
    const firstGroup = allGroups.find(g => g.areaId === areaId);
    handleFieldChange('groupId', firstGroup?.id ?? '');
  };

  const handleResetArea = () => {
    setSelectedAreaId(originalAreaId);
    handleResetField('groupId');
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      hasUnsavedChanges={hasUnsavedChanges}
      size={size}
    >
      <div className={css.modalContent}>
        <div className={css.modalHeader}>
          <h3 className={css.modalTitle}>
            {isViewMode ? 'Задача' : task ? 'Редактирование задачи' : 'Создание задачи'}
          </h3>
          <div className={css.modalActions}>
            <ModalCloseButton onClick={handleClose} disabled={isLoading} />
            {isViewMode ? (
              <>
                <ModalEditButton
                  variant="primary"
                  onClick={() => setIsEditMode(true)}
                  disabled={isLoading}
                />
                {task && onDelete && (
                  <ModalDeleteButton onClick={handleDeleteRequest} disabled={isLoading} />
                )}
              </>
            ) : (
              <>
                {task && (
                  <ModalCancelButton onClick={handleReturnToView} disabled={isLoading} />
                )}
                <ModalSaveButton
                  onClick={handleSave}
                  disabled={!hasChanges || !formData.title.trim() || !formData.groupId || isLoading}
                />
                {task && onDelete && (
                  <ModalDeleteButton onClick={handleDeleteRequest} disabled={isLoading} />
                )}
              </>
            )}
          </div>
        </div>
        
        <div className={css.modalBody}>
          <div className={formCss.formContainer}>
            {/* Поле области (при наличии areas) */}
            {areas && areas.length > 0 && (
              <div className={formCss.fieldGroup}>
                <div className={formCss.fieldHeader}>
                  <label className={formCss.fieldLabel}>
                    Область *
                  </label>
                  {!isViewMode && areaChanged && (
                    <ModalResetFieldButton
                      onClick={handleResetArea}
                      className={formCss.resetButton}
                    />
                  )}
                </div>
                <div className={formCss.fieldContainer}>
                  {isViewMode ? (
                    <div className={formCss.fieldValueReadonly}>
                      {areas.find(a => a.id === selectedAreaId)?.title ?? '—'}
                    </div>
                  ) : (
                    <GlassSelect
                      value={selectedAreaId}
                      onChange={handleAreaChange}
                      options={[
                        { value: '', label: 'Выберите область' },
                        ...areas.map((area) => ({
                          value: area.id,
                          label: area.title
                        }))
                      ]}
                      disabled={isLoading}
                      fullWidth
                    />
                  )}
                </div>
              </div>
            )}

            {/* Поле группы */}
            <div className={formCss.fieldGroup}>
              <div className={formCss.fieldHeader}>
                <label className={formCss.fieldLabel}>
                  Группа *
                </label>
                {!isViewMode && fieldChanges.groupId && (
                  <ModalResetFieldButton
                    onClick={() => handleResetField('groupId')}
                    className={formCss.resetButton}
                  />
                )}
              </div>
              <div className={formCss.fieldContainer}>
                {isViewMode ? (
                  <div className={formCss.fieldValueReadonly}>
                    {(allGroups.length > 0 ? allGroups : groups).find(g => g.id === formData.groupId)?.title ?? '—'}
                  </div>
                ) : (
                  <GlassSelect
                    value={formData.groupId}
                    onChange={(value) => handleFieldChange('groupId', value)}
                    options={[
                      { value: '', label: groupsFiltered.length === 0 ? 'Нет групп в области' : 'Выберите группу' },
                      ...groupsFiltered.map((group) => ({
                        value: group.id,
                        label: group.title
                      }))
                    ]}
                    disabled={isLoading}
                    fullWidth
                  />
                )}
              </div>
            </div>

            {/* Поле названия */}
            <div className={formCss.fieldGroup}>
              <div className={formCss.fieldHeader}>
                <label className={formCss.fieldLabel}>
                  Название задачи *
                </label>
                {!isViewMode && fieldChanges.title && (
                  <ModalResetFieldButton
                    onClick={() => handleResetField('title')}
                    className={formCss.resetButton}
                  />
                )}
              </div>
              <div className={formCss.fieldContainer}>
                {isViewMode ? (
                  <div className={formCss.fieldValueReadonly}>
                    {formData.title || '—'}
                  </div>
                ) : (
                  <GlassInput
                    value={formData.title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('title', e.target.value)}
                    placeholder="Введите название задачи"
                    disabled={isLoading}
                    fullWidth
                  />
                )}
              </div>
            </div>

            {/* Поле статуса */}
            <div className={formCss.fieldGroup}>
              <div className={formCss.fieldHeader}>
                <label className={formCss.fieldLabel}>
                  Статус
                </label>
                {!isViewMode && fieldChanges.status && (
                  <ModalResetFieldButton
                    onClick={() => handleResetField('status')}
                    className={formCss.resetButton}
                  />
                )}
              </div>
              <div className={formCss.fieldContainer}>
                {isViewMode ? (
                  <div className={formCss.fieldValueReadonly} style={{ display: 'flex', alignItems: 'center' }}>
                    <TaskStatusBadge status={(formData.status ?? TaskStatus.New) as TaskStatus} size="s" />
                  </div>
                ) : (
                  <GlassSelect
                    value={formData.status?.toString() || TaskStatus.New.toString()}
                    onChange={(value) => handleFieldChange('status', parseInt(value))}
                    options={getTaskStatusOptions().map(option => ({
                      value: option.value.toString(),
                      label: option.label
                    }))}
                    disabled={isLoading}
                    fullWidth
                  />
                )}
              </div>
            </div>

            {/* Поле описания */}
            <div className={formCss.fieldGroup}>
              <div className={formCss.fieldHeader}>
                <label className={formCss.fieldLabel}>
                  Описание
                </label>
                {!isViewMode && fieldChanges.description && (
                  <ModalResetFieldButton
                    onClick={() => handleResetField('description')}
                    className={formCss.resetButton}
                  />
                )}
              </div>
              <div className={formCss.fieldContainer}>
                {isViewMode ? (
                  <div className={formCss.fieldValueReadonlyMultiline}>
                    {formData.description || '—'}
                  </div>
                ) : (
                  <GlassTextarea
                    value={formData.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleFieldChange('description', e.target.value)}
                    placeholder="Введите описание задачи"
                    rows={4}
                    disabled={isLoading}
                    fullWidth
                  />
                )}
              </div>
            </div>

            {/* Метаданные (только в режиме редактирования) */}
            {task && (
              <div className={formCss.readonlyMeta}>
                <div className={formCss.readonlyMetaTitle}>Информация</div>
                {task.ownerUserName && (
                  <div className={formCss.readonlyMetaRow}>
                    <span className={formCss.readonlyMetaLabel}>Владелец</span>
                    <span className={formCss.readonlyMetaValue}>{task.ownerUserName}</span>
                  </div>
                )}
                {task.createdAt && (
                  <div className={formCss.readonlyMetaRow}>
                    <span className={formCss.readonlyMetaLabel}>Дата создания</span>
                    <span className={formCss.readonlyMetaValue}>{formatDateTime(task.createdAt)}</span>
                  </div>
                )}
                {task.updatedAt && (
                  <div className={formCss.readonlyMetaRow}>
                    <span className={formCss.readonlyMetaLabel}>Дата обновления</span>
                    <span className={formCss.readonlyMetaValue}>{formatDateTime(task.updatedAt)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Цепочка активностей (только в режиме редактирования) */}
            {task && (
              <ActivityList
                events={taskEvents.events}
                loading={taskEvents.loading}
                error={taskEvents.error}
                headerTitle="История активностей"
                showTypeFilter={true}
                defaultExpanded={true}
              />
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={handleConfirmCancel}
        onConfirm={handleConfirmSave}
        onCancel={handleConfirmCancel}
        onDiscard={handleConfirmDiscard}
        {...CONFIRM_UNSAVED_CHANGES}
      />
      <ConfirmModal
        isOpen={showReturnToViewConfirm}
        onClose={dismissReturnToViewConfirm}
        onConfirm={handleConfirmReturnToView}
        onCancel={dismissReturnToViewConfirm}
        {...CONFIRM_RETURN_TO_VIEW}
      />
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={dismissDeleteConfirm}
        onConfirm={handleConfirmDelete}
        onCancel={dismissDeleteConfirm}
        {...getConfirmDeleteConfig('задачу')}
      />
    </Modal>
  );
};
