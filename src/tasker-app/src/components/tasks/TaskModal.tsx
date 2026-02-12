import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { ConfirmModal } from '../common/ConfirmModal';
import { GlassButton } from '../ui/GlassButton';
import { GlassInput } from '../ui/GlassInput';
import { GlassTextarea } from '../ui/GlassTextarea';
import { GlassSelect } from '../ui';
import { XIcon } from '../icons/XIcon';
import { SaveIcon } from '../icons/SaveIcon';
import { ResetIcon } from '../icons/ResetIcon';
import { EditIcon } from '../icons/EditIcon';
import { DeleteIcon } from '../icons/DeleteIcon';
import { TaskStatusBadge } from '../ui/TaskStatusBadge';
import { ActivityList } from '../activities/ActivityList';
import { useEvents } from '../activities/useEvents';
import css from '../../styles/modal.module.css';
import formCss from '../../styles/modal-form.module.css';
import type { TaskResponse, TaskCreateRequest, TaskUpdateRequest, GroupResponse } from '../../types';
import { TaskStatus, getTaskStatusOptions } from '../../types';
import type { ModalSize } from '../../types/modal-size';

/// Форматирование ISO-даты в формат дд.мм.гг чч:мм
function formatDateTime(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = String(d.getFullYear()).slice(-2);
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}.${mm}.${yy} ${hh}:${min}`;
}

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
  defaultAreaId?: string; // ID области по умолчанию для создания (для будущего расширения)
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
}) => {
  const [formData, setFormData] = useState<TaskCreateRequest>({
    title: '',
    description: '',
    groupId: '',
    status: TaskStatus.New,
  });
  const [originalData, setOriginalData] = useState<TaskCreateRequest>({
    title: '',
    description: '',
    groupId: '',
    status: TaskStatus.New,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [fieldChanges, setFieldChanges] = useState<Record<string, boolean>>({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  /** Подтверждение возврата к просмотру при несохранённых изменениях */
  const [showReturnToViewConfirm, setShowReturnToViewConfirm] = useState(false);
  /** Подтверждение удаления записи */
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  /** Режим просмотра (false) vs редактирования (true). По умолчанию просмотр для существующей сущности. */
  const [isEditMode, setIsEditMode] = useState(true);

  const taskEvents = useEvents('task', task?.id);

  /** Режим просмотра: только для существующей задачи и когда не в edit mode */
  const isViewMode = Boolean(task && !isEditMode);

  // Инициализация данных и режима при открытии модального окна
  useEffect(() => {
    if (isOpen) {
      const initialData = task ? {
        title: task.title,
        description: task.description || '',
        groupId: task.groupId,
        status: task.status || TaskStatus.New,
      } : {
        title: '',
        description: '',
        groupId: defaultGroupId || (groups.length > 0 ? groups[0].id : ''),
        status: TaskStatus.New,
      };
      
      setFormData(initialData);
      setOriginalData(initialData);
      setFieldChanges({});
      /** Создание — сразу edit; существующая задача — по умолчанию просмотр */
      setIsEditMode(!task);
    }
  }, [isOpen, task, groups, defaultGroupId]);

  // Проверка изменений в полях
  const hasChanges = Object.values(fieldChanges).some(hasChange => hasChange);
  const hasUnsavedChanges = hasChanges;

  const handleFieldChange = (field: keyof TaskCreateRequest, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Проверяем, изменилось ли поле относительно оригинального значения
    const hasChanged = value !== originalData[field];
    setFieldChanges(prev => ({ ...prev, [field]: hasChanged }));
  };

  const handleResetField = (field: keyof TaskCreateRequest) => {
    const originalValue = originalData[field];
    setFormData(prev => ({ ...prev, [field]: originalValue }));
    setFieldChanges(prev => ({ ...prev, [field]: false }));
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.groupId) return;
    
    setIsLoading(true);
    try {
      // Передаем данные и ID задачи отдельно
      const taskId = task ? task.id : undefined;
      await onSave(formData, taskId);
      onClose();
    } catch (error) {
      console.error('Ошибка сохранения задачи:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      setShowConfirmModal(true);
    } else {
      onClose();
    }
  };

  const handleConfirmSave = async () => {
    setShowConfirmModal(false);
    await handleSave();
  };

  const handleConfirmDiscard = () => {
    setShowConfirmModal(false);
    onClose();
  };

  const handleConfirmCancel = () => {
    setShowConfirmModal(false);
  };

  /** Возврат к режиму просмотра (только для существующей задачи) */
  const handleReturnToView = () => {
    if (hasUnsavedChanges) {
      setShowReturnToViewConfirm(true);
    } else {
      setIsEditMode(false);
    }
  };

  const handleConfirmReturnToView = () => {
    setShowReturnToViewConfirm(false);
    setFormData(originalData);
    setFieldChanges({});
    setIsEditMode(false);
  };

  /** Запрос на удаление — показать подтверждение */
  const handleDeleteRequest = () => {
    setShowDeleteConfirm(true);
  };

  /** Подтверждённое удаление */
  const handleConfirmDelete = async () => {
    if (!task?.id || !onDelete) return;
    setShowDeleteConfirm(false);
    setIsLoading(true);
    try {
      await onDelete(task.id);
      onClose();
    } catch (error) {
      console.error('Ошибка удаления задачи:', error);
    } finally {
      setIsLoading(false);
    }
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
            <GlassButton
              variant="subtle"
              size="xs"
              onClick={handleClose}
              disabled={isLoading}
            >
              <XIcon />
            </GlassButton>
            {isViewMode ? (
              <>
                <GlassButton
                  variant="primary"
                  size="xs"
                  onClick={() => setIsEditMode(true)}
                  disabled={isLoading}
                >
                  <EditIcon />
                </GlassButton>
                {task && onDelete && (
                  <GlassButton
                    variant="danger"
                    size="xs"
                    onClick={handleDeleteRequest}
                    disabled={isLoading}
                  >
                    <DeleteIcon />
                  </GlassButton>
                )}
              </>
            ) : (
              <>
                {task && (
                  <GlassButton
                    variant="subtle"
                    size="xs"
                    onClick={handleReturnToView}
                    disabled={isLoading}
                  >
                    Отмена
                  </GlassButton>
                )}
                <GlassButton
                  variant="primary"
                  size="xs"
                  onClick={handleSave}
                  disabled={!hasChanges || !formData.title.trim() || !formData.groupId || isLoading}
                >
                  <SaveIcon />
                </GlassButton>
                {task && onDelete && (
                  <GlassButton
                    variant="danger"
                    size="xs"
                    onClick={handleDeleteRequest}
                    disabled={isLoading}
                  >
                    <DeleteIcon />
                  </GlassButton>
                )}
              </>
            )}
          </div>
        </div>
        
        <div className={css.modalBody}>
          <div className={formCss.formContainer}>
            {/* Поле группы */}
            <div className={formCss.fieldGroup}>
              <div className={formCss.fieldHeader}>
                <label className={formCss.fieldLabel}>
                  Группа *
                </label>
                {!isViewMode && fieldChanges.groupId && (
                  <GlassButton
                    variant="subtle"
                    size="xxs"
                    onClick={() => handleResetField('groupId')}
                    className={formCss.resetButton}
                  >
                    <ResetIcon />
                  </GlassButton>
                )}
              </div>
              <div className={formCss.fieldContainer}>
                {isViewMode ? (
                  <div className={formCss.fieldValueReadonly}>
                    {groups.find(g => g.id === formData.groupId)?.title ?? '—'}
                  </div>
                ) : (
                  <GlassSelect
                    value={formData.groupId}
                    onChange={(value) => handleFieldChange('groupId', value)}
                    options={[
                      { value: '', label: 'Выберите группу' },
                      ...groups.map((group) => ({
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
                  <GlassButton
                    variant="subtle"
                    size="xxs"
                    onClick={() => handleResetField('title')}
                    className={formCss.resetButton}
                  >
                    <ResetIcon />
                  </GlassButton>
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
                  <GlassButton
                    variant="subtle"
                    size="xxs"
                    onClick={() => handleResetField('status')}
                    className={formCss.resetButton}
                  >
                    <ResetIcon />
                  </GlassButton>
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
                  <GlassButton
                    variant="subtle"
                    size="xxs"
                    onClick={() => handleResetField('description')}
                    className={formCss.resetButton}
                  >
                    <ResetIcon />
                  </GlassButton>
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
                {task.creatorUserName && (
                  <div className={formCss.readonlyMetaRow}>
                    <span className={formCss.readonlyMetaLabel}>Автор</span>
                    <span className={formCss.readonlyMetaValue}>{task.creatorUserName}</span>
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
        title="Несохраненные изменения"
        message="У вас есть несохраненные изменения. Что вы хотите сделать?"
        confirmText="Сохранить"
        cancelText="Отмена"
        discardText="Не сохранять"
        showDiscard={true}
      />
      <ConfirmModal
        isOpen={showReturnToViewConfirm}
        onClose={() => setShowReturnToViewConfirm(false)}
        onConfirm={handleConfirmReturnToView}
        onCancel={() => setShowReturnToViewConfirm(false)}
        title="Вернуться к просмотру"
        message="Есть несохранённые изменения. Вернуться к просмотру без сохранения?"
        confirmText="Да"
        cancelText="Нет"
      />
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        title="Удалить задачу"
        message="Вы уверены, что хотите удалить эту задачу? Запись будет деактивирована и скрыта из списков."
        confirmText="Удалить"
        cancelText="Отмена"
        variant="danger"
      />
    </Modal>
  );
};
