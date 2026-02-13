import React from 'react';
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
import { ActivityList } from '../activities/ActivityList';
import { useEvents } from '../activities/useEvents';
import { useEntityFormModal } from '../../hooks';
import { CONFIRM_UNSAVED_CHANGES, CONFIRM_RETURN_TO_VIEW, getConfirmDeleteConfig } from '../../constants/confirm-modals';
import css from '../../styles/modal.module.css';
import formCss from '../../styles/modal-form.module.css';
import { formatDateTime } from '../../utils/date';
import type { GroupResponse, GroupCreateRequest, GroupUpdateRequest, AreaResponse } from '../../types';
import type { ModalSize } from '../../types/modal-size';

export interface GroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: GroupCreateRequest | GroupUpdateRequest, groupId?: string) => Promise<void>;
  /** Колбэк при удалении записи (мягкое удаление) */
  onDelete?: (id: string) => Promise<void>;
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
  onDelete,
  group = null,
  areas,
  title = 'Группа',
  size = 'medium',
  defaultAreaId,
}) => {
  const modal = useEntityFormModal<GroupCreateRequest>({
    isOpen,
    entity: group,
    getInitialData: () =>
      group
        ? { title: group.title, description: group.description || '', areaId: group.areaId }
        : {
            title: '',
            description: '',
            areaId: defaultAreaId || (areas.length > 0 ? areas[0].id : ''),
          },
    deps: [group, areas, defaultAreaId],
    onClose,
    onSave: (data) => onSave(data, group?.id),
    onDelete,
    validate: (data) => Boolean(data.title?.trim() && data.areaId),
  });

  const {
    formData,
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

  const groupEvents = useEvents('group', group?.id);
  const isViewMode = Boolean(group && !isEditMode);

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
            {isViewMode ? 'Группа' : group ? 'Редактирование группы' : 'Создание группы'}
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
                {group && onDelete && (
                  <ModalDeleteButton onClick={handleDeleteRequest} disabled={isLoading} />
                )}
              </>
            ) : (
              <>
                {group && (
                  <ModalCancelButton onClick={handleReturnToView} disabled={isLoading} />
                )}
                <ModalSaveButton
                  onClick={handleSave}
                  disabled={!hasChanges || !formData.title.trim() || !formData.areaId || isLoading}
                />
                {group && onDelete && (
                  <ModalDeleteButton onClick={handleDeleteRequest} disabled={isLoading} />
                )}
              </>
            )}
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
                {!isViewMode && fieldChanges.areaId && (
                  <ModalResetFieldButton
                    onClick={() => handleResetField('areaId')}
                    className={formCss.resetButton}
                  />
                )}
              </div>
              <div className={formCss.fieldContainer}>
                {isViewMode ? (
                  <div className={formCss.fieldValueReadonly}>
                    {areas.find(a => a.id === formData.areaId)?.title ?? '—'}
                  </div>
                ) : (
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
                )}
              </div>
            </div>

            {/* Поле названия */}
            <div className={formCss.fieldGroup}>
              <div className={formCss.fieldHeader}>
                <label className={formCss.fieldLabel}>
                  Название группы *
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
                    placeholder="Введите название группы"
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
                    placeholder="Введите описание группы"
                    rows={4}
                    disabled={isLoading}
                    fullWidth
                  />
                )}
              </div>
            </div>

            {/* Метаданные (только в режиме редактирования) */}
            {group && (
              <div className={formCss.readonlyMeta}>
                <div className={formCss.readonlyMetaTitle}>Информация</div>
                {group.ownerUserName && (
                  <div className={formCss.readonlyMetaRow}>
                    <span className={formCss.readonlyMetaLabel}>Владелец</span>
                    <span className={formCss.readonlyMetaValue}>{group.ownerUserName}</span>
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
            {group && (
              <ActivityList
                events={groupEvents.events}
                loading={groupEvents.loading}
                error={groupEvents.error}
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
        {...getConfirmDeleteConfig('группу')}
      />
    </Modal>
  );
};
