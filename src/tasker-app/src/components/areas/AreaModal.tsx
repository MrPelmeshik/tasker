import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { ConfirmModal } from '../common/ConfirmModal';
import { GlassButton } from '../ui/GlassButton';
import { GlassInput } from '../ui/GlassInput';
import { GlassTextarea } from '../ui/GlassTextarea';
import { XIcon } from '../icons/XIcon';
import { SaveIcon } from '../icons/SaveIcon';
import { ResetIcon } from '../icons/ResetIcon';
import { EditIcon } from '../icons/EditIcon';
import { ActivityList } from '../activities/ActivityList';
import { useEvents } from '../activities/useEvents';
import css from '../../styles/modal.module.css';
import formCss from '../../styles/modal-form.module.css';
import type { AreaResponse, AreaCreateRequest, AreaUpdateRequest } from '../../types';
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

export interface AreaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AreaCreateRequest | AreaUpdateRequest) => Promise<void>;
  area?: AreaResponse | null; // null для создания новой области
  title?: string;
  size?: ModalSize;
}

export const AreaModal: React.FC<AreaModalProps> = ({
  isOpen,
  onClose,
  onSave,
  area = null,
  title = 'Область',
  size = 'medium',
}) => {
  const [formData, setFormData] = useState<AreaCreateRequest>({
    title: '',
    description: '',
  });
  const [originalData, setOriginalData] = useState<AreaCreateRequest>({
    title: '',
    description: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [fieldChanges, setFieldChanges] = useState<Record<string, boolean>>({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  /** Подтверждение возврата к просмотру при несохранённых изменениях */
  const [showReturnToViewConfirm, setShowReturnToViewConfirm] = useState(false);
  /** Режим просмотра (false) vs редактирования (true). По умолчанию просмотр для существующей сущности. */
  const [isEditMode, setIsEditMode] = useState(true);

  const areaEvents = useEvents('area', area?.id);

  /** Режим просмотра: только для существующей области и когда не в edit mode */
  const isViewMode = Boolean(area && !isEditMode);

  // Инициализация данных и режима при открытии модального окна
  useEffect(() => {
    if (isOpen) {
      const initialData = area ? {
        title: area.title,
        description: area.description || '',
      } : {
        title: '',
        description: '',
      };
      
      setFormData(initialData);
      setOriginalData(initialData);
      setFieldChanges({});
      /** Создание — сразу edit; существующая область — по умолчанию просмотр */
      setIsEditMode(!area);
    }
  }, [isOpen, area]);

  // Проверка изменений в полях
  const hasChanges = Object.values(fieldChanges).some(hasChange => hasChange);
  const hasUnsavedChanges = hasChanges;

  const handleFieldChange = (field: keyof AreaCreateRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Проверяем, изменилось ли поле относительно оригинального значения
    const hasChanged = value !== originalData[field];
    setFieldChanges(prev => ({ ...prev, [field]: hasChanged }));
  };

  const handleResetField = (field: keyof AreaCreateRequest) => {
    const originalValue = originalData[field];
    setFormData(prev => ({ ...prev, [field]: originalValue }));
    setFieldChanges(prev => ({ ...prev, [field]: false }));
  };

  const handleSave = async () => {
    if (!formData.title.trim()) return;
    
    setIsLoading(true);
    try {
      // Добавляем ID для режима редактирования
      const dataToSave = area ? { ...formData, id: area.id } : formData;
      await onSave(dataToSave);
      onClose();
    } catch (error) {
      console.error('Ошибка сохранения области:', error);
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

  /** Возврат к режиму просмотра (только для существующей области) */
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
            {isViewMode ? 'Область' : area ? 'Редактирование области' : 'Создание области'}
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
              <GlassButton
                variant="primary"
                size="xs"
                onClick={() => setIsEditMode(true)}
                disabled={isLoading}
              >
                <EditIcon />
                Редактировать
              </GlassButton>
            ) : (
              <>
                {area && (
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
                  disabled={!hasChanges || !formData.title.trim() || isLoading}
                >
                  <SaveIcon />
                </GlassButton>
              </>
            )}
          </div>
        </div>
        
        <div className={css.modalBody}>
          <div className={formCss.formContainer}>
            {/* Поле названия */}
            <div className={formCss.fieldGroup}>
              <div className={formCss.fieldHeader}>
                <label className={formCss.fieldLabel}>
                  Название области *
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
                    placeholder="Введите название области"
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
                    placeholder="Введите описание области"
                    rows={4}
                    disabled={isLoading}
                    fullWidth
                  />
                )}
              </div>
            </div>

            {/* Метаданные (только в режиме редактирования) */}
            {area && (
              <div className={formCss.readonlyMeta}>
                <div className={formCss.readonlyMetaTitle}>Информация</div>
                {area.creatorUserName && (
                  <div className={formCss.readonlyMetaRow}>
                    <span className={formCss.readonlyMetaLabel}>Автор</span>
                    <span className={formCss.readonlyMetaValue}>{area.creatorUserName}</span>
                  </div>
                )}
                {area.createdAt && (
                  <div className={formCss.readonlyMetaRow}>
                    <span className={formCss.readonlyMetaLabel}>Дата создания</span>
                    <span className={formCss.readonlyMetaValue}>{formatDateTime(area.createdAt)}</span>
                  </div>
                )}
                {area.updatedAt && (
                  <div className={formCss.readonlyMetaRow}>
                    <span className={formCss.readonlyMetaLabel}>Дата обновления</span>
                    <span className={formCss.readonlyMetaValue}>{formatDateTime(area.updatedAt)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Цепочка активностей (только в режиме редактирования) */}
            {area && (
              <ActivityList
                events={areaEvents.events}
                loading={areaEvents.loading}
                error={areaEvents.error}
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
    </Modal>
  );
};
