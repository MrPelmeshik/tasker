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
import css from '../../styles/modal.module.css';
import formCss from '../../styles/modal-form.module.css';
import type { TaskResponse, TaskCreateRequest, TaskUpdateRequest, GroupResponse } from '../../types';
import type { ModalSize } from '../../types/modal-size';

export interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: TaskCreateRequest | TaskUpdateRequest, taskId?: string) => Promise<void>;
  task?: TaskResponse | null; // null для создания новой задачи
  groups: GroupResponse[];
  title?: string;
  size?: ModalSize;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  task = null,
  groups,
  title = 'Задача',
  size = 'medium',
}) => {
  const [formData, setFormData] = useState<TaskCreateRequest>({
    title: '',
    description: '',
    groupId: '',
  });
  const [originalData, setOriginalData] = useState<TaskCreateRequest>({
    title: '',
    description: '',
    groupId: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [fieldChanges, setFieldChanges] = useState<Record<string, boolean>>({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Инициализация данных при открытии модального окна
  useEffect(() => {
    if (isOpen) {
      const initialData = task ? {
        title: task.title,
        description: task.description || '',
        groupId: task.groupId,
      } : {
        title: '',
        description: '',
        groupId: groups.length > 0 ? groups[0].id : '',
      };
      
      setFormData(initialData);
      setOriginalData(initialData);
      setFieldChanges({});
    }
  }, [isOpen, task, groups]);

  // Проверка изменений в полях
  const hasChanges = Object.values(fieldChanges).some(hasChange => hasChange);
  const hasUnsavedChanges = hasChanges;

  const handleFieldChange = (field: keyof TaskCreateRequest, value: string) => {
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
            {task ? 'Редактирование задачи' : 'Создание задачи'}
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
            <GlassButton
              variant="primary"
              size="xs"
              onClick={handleSave}
              disabled={!hasChanges || !formData.title.trim() || !formData.groupId || isLoading}
            >
              <SaveIcon />
            </GlassButton>
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
                {fieldChanges.groupId && (
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
              </div>
            </div>

            {/* Поле названия */}
            <div className={formCss.fieldGroup}>
              <div className={formCss.fieldHeader}>
                <label className={formCss.fieldLabel}>
                  Название задачи *
                </label>
                {fieldChanges.title && (
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
                <GlassInput
                  value={formData.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('title', e.target.value)}
                  placeholder="Введите название задачи"
                  disabled={isLoading}
                  fullWidth
                />
              </div>
            </div>

            {/* Поле описания */}
            <div className={formCss.fieldGroup}>
              <div className={formCss.fieldHeader}>
                <label className={formCss.fieldLabel}>
                  Описание
                </label>
                {fieldChanges.description && (
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
                <GlassTextarea
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleFieldChange('description', e.target.value)}
                  placeholder="Введите описание задачи"
                  rows={4}
                  disabled={isLoading}
                  fullWidth
                />
              </div>
            </div>
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
    </Modal>
  );
};
