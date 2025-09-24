import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { ConfirmModal } from '../common/ConfirmModal';
import { GlassButton } from '../ui/GlassButton';
import { GlassInput } from '../ui/GlassInput';
import { GlassTextarea } from '../ui/GlassTextarea';
import { GlassSelect } from '../ui/GlassSelect';
import { XIcon } from '../icons/XIcon';
import { SaveIcon } from '../icons/SaveIcon';
import { ResetIcon } from '../icons/ResetIcon';
import css from '../../styles/modal.module.css';
import formCss from '../../styles/modal-form.module.css';
import type { GroupResponse, GroupCreateRequest, GroupUpdateRequest, AreaResponse } from '../../types/api';

export interface GroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: GroupCreateRequest | GroupUpdateRequest) => Promise<void>;
  group?: GroupResponse | null; // null для создания новой группы
  areas: AreaResponse[];
  title?: string;
}

export const GroupModal: React.FC<GroupModalProps> = ({
  isOpen,
  onClose,
  onSave,
  group = null,
  areas,
  title = 'Группа',
}) => {
  const [formData, setFormData] = useState<GroupCreateRequest>({
    title: '',
    description: '',
    areaId: '',
  });
  const [originalData, setOriginalData] = useState<GroupCreateRequest>({
    title: '',
    description: '',
    areaId: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [fieldChanges, setFieldChanges] = useState<Record<string, boolean>>({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Инициализация данных при открытии модального окна
  useEffect(() => {
    if (isOpen) {
      const initialData = group ? {
        title: group.title,
        description: group.description || '',
        areaId: group.areaId,
      } : {
        title: '',
        description: '',
        areaId: areas.length > 0 ? areas[0].id : '',
      };
      
      setFormData(initialData);
      setOriginalData(initialData);
      setFieldChanges({});
    }
  }, [isOpen, group, areas]);

  // Проверка изменений в полях
  const hasChanges = Object.values(fieldChanges).some(hasChange => hasChange);
  const hasUnsavedChanges = hasChanges;

  const handleFieldChange = (field: keyof GroupCreateRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Проверяем, изменилось ли поле относительно оригинального значения
    const hasChanged = value !== originalData[field];
    setFieldChanges(prev => ({ ...prev, [field]: hasChanged }));
  };

  const handleResetField = (field: keyof GroupCreateRequest) => {
    const originalValue = originalData[field];
    setFormData(prev => ({ ...prev, [field]: originalValue }));
    setFieldChanges(prev => ({ ...prev, [field]: false }));
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.areaId) return;
    
    setIsLoading(true);
    try {
      // Добавляем ID и areaId для режима редактирования
      const dataToSave = group ? { ...formData, id: group.id, areaId: group.areaId } : formData;
      await onSave(dataToSave);
      onClose();
    } catch (error) {
      console.error('Ошибка сохранения группы:', error);
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
    >
      <div className={css.modalContent}>
        <div className={css.modalHeader}>
          <h3 className={css.modalTitle}>
            {group ? 'Редактирование группы' : 'Создание группы'}
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
              disabled={!hasChanges || !formData.title.trim() || !formData.areaId || isLoading}
            >
              <SaveIcon />
            </GlassButton>
          </div>
        </div>
        
        <div className={css.modalBody}>
          <div className={formCss.formContainer}>
            {/* Поле области */}
            <div className={formCss.fieldGroup}>
              <label className={formCss.fieldLabel}>
                Область *
              </label>
              <div className={formCss.fieldContainer}>
                <GlassSelect
                  value={formData.areaId}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFieldChange('areaId', e.target.value)}
                  disabled={isLoading || !!group} // Нельзя менять область при редактировании
                >
                  <option value="">Выберите область</option>
                  {areas.map((area) => (
                    <option key={area.id} value={area.id}>
                      {area.title}
                    </option>
                  ))}
                </GlassSelect>
                {fieldChanges.areaId && !group && (
                  <GlassButton
                    variant="subtle"
                    size="xxs"
                    onClick={() => handleResetField('areaId')}
                    className={formCss.resetButton}
                  >
                    <ResetIcon />
                  </GlassButton>
                )}
              </div>
            </div>

            {/* Поле названия */}
            <div className={formCss.fieldGroup}>
              <label className={formCss.fieldLabel}>
                Название группы *
              </label>
              <div className={formCss.fieldContainer}>
                <GlassInput
                  value={formData.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('title', e.target.value)}
                  placeholder="Введите название группы"
                  disabled={isLoading}
                />
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
            </div>

            {/* Поле описания */}
            <div className={formCss.fieldGroup}>
              <label className={formCss.fieldLabel}>
                Описание
              </label>
              <div className={formCss.fieldContainer}>
                <GlassTextarea
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleFieldChange('description', e.target.value)}
                  placeholder="Введите описание группы"
                  rows={4}
                  disabled={isLoading}
                />
                {fieldChanges.description && (
                  <GlassButton
                    variant="subtle"
                    size="xxs"
                    onClick={() => handleResetField('description')}
                    className={formCss.resetButtonTextarea}
                  >
                    <ResetIcon />
                  </GlassButton>
                )}
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
