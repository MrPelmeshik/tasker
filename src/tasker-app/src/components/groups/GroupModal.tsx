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
import { ActivityChain } from '../activities';
import css from '../../styles/modal.module.css';
import formCss from '../../styles/modal-form.module.css';
import type { GroupResponse, GroupCreateRequest, GroupUpdateRequest, AreaResponse } from '../../types';
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

export interface GroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: GroupCreateRequest | GroupUpdateRequest, groupId?: string) => Promise<void>;
  group?: GroupResponse | null; // null для создания новой группы
  areas: AreaResponse[];
  title?: string;
  size?: ModalSize;
  defaultAreaId?: string; // ID области по умолчанию для создания
}

export const GroupModal: React.FC<GroupModalProps> = ({
  isOpen,
  onClose,
  onSave,
  group = null,
  areas,
  title = 'Группа',
  size = 'medium',
  defaultAreaId,
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
        areaId: defaultAreaId || (areas.length > 0 ? areas[0].id : ''),
      };
      
      setFormData(initialData);
      setOriginalData(initialData);
      setFieldChanges({});
    }
  }, [isOpen, group, areas, defaultAreaId]);

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
      // Передаем данные и ID группы отдельно
      const groupId = group ? group.id : undefined;
      await onSave(formData, groupId);
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
      size={size}
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
              <div className={formCss.fieldHeader}>
                <label className={formCss.fieldLabel}>
                  Область *
                </label>
                {fieldChanges.areaId && (
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
              <div className={formCss.fieldContainer}>
                <GlassSelect
                  value={formData.areaId}
                  onChange={(value) => handleFieldChange('areaId', value)}
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
              </div>
            </div>

            {/* Поле названия */}
            <div className={formCss.fieldGroup}>
              <div className={formCss.fieldHeader}>
                <label className={formCss.fieldLabel}>
                  Название группы *
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
                  placeholder="Введите название группы"
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
                  placeholder="Введите описание группы"
                  rows={4}
                  disabled={isLoading}
                  fullWidth
                />
              </div>
            </div>

            {/* Метаданные (только в режиме редактирования) */}
            {group && (
              <div className={formCss.readonlyMeta}>
                <div className={formCss.readonlyMetaTitle}>Информация</div>
                {group.creatorUserName && (
                  <div className={formCss.readonlyMetaRow}>
                    <span className={formCss.readonlyMetaLabel}>Автор</span>
                    <span className={formCss.readonlyMetaValue}>{group.creatorUserName}</span>
                  </div>
                )}
                {group.createdAt && (
                  <div className={formCss.readonlyMetaRow}>
                    <span className={formCss.readonlyMetaLabel}>Дата создания</span>
                    <span className={formCss.readonlyMetaValue}>{formatDateTime(group.createdAt)}</span>
                  </div>
                )}
                {group.updatedAt && (
                  <div className={formCss.readonlyMetaRow}>
                    <span className={formCss.readonlyMetaLabel}>Дата обновления</span>
                    <span className={formCss.readonlyMetaValue}>{formatDateTime(group.updatedAt)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Цепочка активностей (только в режиме редактирования) */}
            {group && <ActivityChain entityType="group" entityId={group.id} />}
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
