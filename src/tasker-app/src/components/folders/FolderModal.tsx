import React, { useEffect, useState } from 'react';
import { Modal } from '../common/Modal';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  GlassButton,
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
import { Tooltip } from '../ui/Tooltip';
import { LinkIcon } from '../icons/LinkIcon';
import { buildEntityUrl } from '../../utils/entity-links';
import { useEntityFormModal } from '../../hooks';
import { useToast } from '../../context';
import { CONFIRM_UNSAVED_CHANGES, CONFIRM_RETURN_TO_VIEW, getConfirmDeleteConfig } from '../../constants/confirm-modals';
import css from '../../styles/modal.module.css';
import formCss from '../../styles/modal-form.module.css';
import { formatDateTime } from '../../utils/date';
import { fetchChildFolders } from '../../services/api';
import type { FolderResponse, FolderCreateRequest, FolderUpdateRequest } from '../../types/api';
import type { ModalSize } from '../../types/modal-size';

export interface FolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: FolderCreateRequest | FolderUpdateRequest, folderId?: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  folder?: FolderResponse | null;
  /** Области для выбора (минимум id, title) */
  areas: Array<{ id: string; title: string; description?: string }>;
  title?: string;
  size?: ModalSize;
  defaultAreaId?: string;
  defaultParentFolderId?: string | null;
}

export const FolderModal: React.FC<FolderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  folder = null,
  areas,
  title = 'Папка',
  size = 'medium',
  defaultAreaId,
  defaultParentFolderId = null,
}) => {
  const [parentFolderOptions, setParentFolderOptions] = useState<Array<{ value: string; label: string }>>([]);
  const { addSuccess } = useToast();

  const handleCopyLink = () => {
    if (!folder?.id) return;
    navigator.clipboard.writeText(buildEntityUrl('folder', folder.id)).then(
      () => addSuccess('Ссылка скопирована'),
      () => {}
    );
  };
  const [loadingParents, setLoadingParents] = useState(false);

  const modal = useEntityFormModal<FolderCreateRequest & { parentFolderId?: string | null }>({
    isOpen,
    entity: folder,
    getInitialData: () => {
      const pid = folder?.parentFolderId ?? defaultParentFolderId ?? null;
      return folder
        ? { title: folder.title, description: folder.description || '', areaId: folder.areaId, parentFolderId: pid == null ? '' : pid }
        : {
            title: '',
            description: '',
            areaId: defaultAreaId || (areas.length > 0 ? areas[0].id : ''),
            parentFolderId: pid == null ? '' : pid,
          };
    },
    deps: [folder, areas, defaultAreaId, defaultParentFolderId],
    onClose,
    onSave: async (data) => {
      const pid = (data.parentFolderId === '' || data.parentFolderId == null) ? null : data.parentFolderId;
      await onSave({ ...data, parentFolderId: pid }, folder?.id);
    },
    onDelete,
    validate: (data) => Boolean(data.title?.trim() && data.areaId),
  });

  const { formData, fieldChanges, handleFieldChange, handleResetField, hasChanges, hasUnsavedChanges, showConfirmModal, showReturnToViewConfirm, showDeleteConfirm, handleClose, handleConfirmSave, handleConfirmDiscard, handleConfirmCancel, handleReturnToView, handleConfirmReturnToView, handleDeleteRequest, handleConfirmDelete, dismissReturnToViewConfirm, dismissDeleteConfirm, handleSave, isEditMode, setIsEditMode, isLoading } = modal;

  useEffect(() => {
    if (!isOpen || !formData.areaId) {
      setParentFolderOptions([{ value: '', label: 'Без папки (корень области)' }]);
      return;
    }
    let cancelled = false;
    setLoadingParents(true);
    const load = async () => {
      try {
        const opts: Array<{ value: string; label: string }> = [{ value: '', label: 'Без папки (корень области)' }];
        const addNested = async (parentId: string | null, prefix: string) => {
          const children = await fetchChildFolders(parentId, formData.areaId);
          for (const f of children) {
            if (f.id !== folder?.id) {
              opts.push({ value: f.id, label: `${prefix}${f.title}` });
              await addNested(f.id, `${prefix}${f.title} / `);
            }
          }
        };
        await addNested(null, '');
        if (!cancelled) setParentFolderOptions(opts);
      } catch {
        if (!cancelled) setParentFolderOptions([{ value: '', label: 'Без папки (корень области)' }]);
      } finally {
        if (!cancelled) setLoadingParents(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [isOpen, formData.areaId, folder?.id]);

  const isViewMode = Boolean(folder && !isEditMode);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} hasUnsavedChanges={hasUnsavedChanges} size={size}>
      <div className={css.modalContent}>
        <div className={css.modalHeader}>
          <h3 className={css.modalTitle}>
            {isViewMode ? 'Папка' : folder ? 'Редактирование папки' : 'Создание папки'}
          </h3>
          <div className={css.modalActions}>
            <ModalCloseButton onClick={handleClose} disabled={isLoading} />
            {folder?.id && (
              <Tooltip content="Копировать ссылку" placement="bottom">
                <GlassButton variant="subtle" size="m" onClick={handleCopyLink} disabled={isLoading} aria-label="Копировать ссылку">
                  <LinkIcon style={{ width: 18, height: 18 }} />
                </GlassButton>
              </Tooltip>
            )}
            {isViewMode ? (
              <>
                <ModalEditButton variant="primary" onClick={() => setIsEditMode(true)} disabled={isLoading} />
                {folder && onDelete && <ModalDeleteButton onClick={handleDeleteRequest} disabled={isLoading} />}
              </>
            ) : (
              <>
                {folder && <ModalCancelButton onClick={handleReturnToView} disabled={isLoading} />}
                <ModalSaveButton
                  onClick={handleSave}
                  disabled={!hasChanges || !formData.title.trim() || !formData.areaId || isLoading}
                />
                {folder && onDelete && <ModalDeleteButton onClick={handleDeleteRequest} disabled={isLoading} />}
              </>
            )}
          </div>
        </div>
        <div className={css.modalBody}>
          <div className={formCss.formContainer}>
            <div className={formCss.fieldGroup}>
              <div className={formCss.fieldHeader}>
                <label className={formCss.fieldLabel}>Область *</label>
                {!isViewMode && fieldChanges.areaId && (
                  <ModalResetFieldButton onClick={() => handleResetField('areaId')} className={formCss.resetButton} />
                )}
              </div>
              <div className={formCss.fieldContainer}>
                {isViewMode ? (
                  <div className={formCss.fieldValueReadonly}>
                    {areas.find((a) => a.id === formData.areaId)?.title ?? '—'}
                  </div>
                ) : (
                  <GlassSelect
                    value={formData.areaId}
                    onChange={(value) => handleFieldChange('areaId', value)}
                    options={[
                      { value: '', label: 'Выберите область' },
                      ...areas.map((a) => ({ value: a.id, label: a.title })),
                    ]}
                    disabled={isLoading}
                    fullWidth
                  />
                )}
              </div>
            </div>
            <div className={formCss.fieldGroup}>
              <div className={formCss.fieldHeader}>
                <label className={formCss.fieldLabel}>Родительская папка</label>
                {!isViewMode && fieldChanges.parentFolderId && (
                  <ModalResetFieldButton onClick={() => handleResetField('parentFolderId')} className={formCss.resetButton} />
                )}
              </div>
              <div className={formCss.fieldContainer}>
                {isViewMode ? (
                  <div className={formCss.fieldValueReadonly}>
                    {formData.parentFolderId
                      ? parentFolderOptions.find((o) => o.value === formData.parentFolderId)?.label ?? '—'
                      : 'Без папки (корень области)'}
                  </div>
                ) : (
                  <GlassSelect
                    value={formData.parentFolderId === '' || formData.parentFolderId == null ? '' : formData.parentFolderId}
                    onChange={(value) => handleFieldChange('parentFolderId', value)}
                    options={parentFolderOptions}
                    disabled={isLoading || loadingParents}
                    fullWidth
                  />
                )}
              </div>
            </div>
            <div className={formCss.fieldGroup}>
              <div className={formCss.fieldHeader}>
                <label className={formCss.fieldLabel}>Название папки *</label>
                {!isViewMode && fieldChanges.title && (
                  <ModalResetFieldButton onClick={() => handleResetField('title')} className={formCss.resetButton} />
                )}
              </div>
              <div className={formCss.fieldContainer}>
                {isViewMode ? (
                  <div className={formCss.fieldValueReadonly}>{formData.title || '—'}</div>
                ) : (
                  <GlassInput
                    value={formData.title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('title', e.target.value)}
                    placeholder="Введите название папки"
                    disabled={isLoading}
                    fullWidth
                  />
                )}
              </div>
            </div>
            <div className={formCss.fieldGroup}>
              <div className={formCss.fieldHeader}>
                <label className={formCss.fieldLabel}>Описание</label>
                {!isViewMode && fieldChanges.description && (
                  <ModalResetFieldButton onClick={() => handleResetField('description')} className={formCss.resetButton} />
                )}
              </div>
              <div className={formCss.fieldContainer}>
                {isViewMode ? (
                  <div className={formCss.fieldValueReadonlyMultiline}>{formData.description || '—'}</div>
                ) : (
                  <GlassTextarea
                    value={formData.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleFieldChange('description', e.target.value)}
                    placeholder="Введите описание папки"
                    rows={4}
                    disabled={isLoading}
                    fullWidth
                  />
                )}
              </div>
            </div>
            {folder && (
              <div className={formCss.readonlyMeta}>
                <div className={formCss.readonlyMetaTitle}>Информация</div>
                {folder.ownerUserName && (
                  <div className={formCss.readonlyMetaRow}>
                    <span className={formCss.readonlyMetaLabel}>Владелец</span>
                    <span className={formCss.readonlyMetaValue}>{folder.ownerUserName}</span>
                  </div>
                )}
                {folder.createdAt && (
                  <div className={formCss.readonlyMetaRow}>
                    <span className={formCss.readonlyMetaLabel}>Дата создания</span>
                    <span className={formCss.readonlyMetaValue}>{formatDateTime(folder.createdAt)}</span>
                  </div>
                )}
                {folder.updatedAt && (
                  <div className={formCss.readonlyMetaRow}>
                    <span className={formCss.readonlyMetaLabel}>Дата обновления</span>
                    <span className={formCss.readonlyMetaValue}>{formatDateTime(folder.updatedAt)}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <ConfirmModal isOpen={showConfirmModal} onClose={handleConfirmCancel} onConfirm={handleConfirmSave} onCancel={handleConfirmCancel} onDiscard={handleConfirmDiscard} {...CONFIRM_UNSAVED_CHANGES} />
      <ConfirmModal isOpen={showReturnToViewConfirm} onClose={dismissReturnToViewConfirm} onConfirm={handleConfirmReturnToView} onCancel={dismissReturnToViewConfirm} {...CONFIRM_RETURN_TO_VIEW} />
      <ConfirmModal isOpen={showDeleteConfirm} onClose={dismissDeleteConfirm} onConfirm={handleConfirmDelete} onCancel={dismissDeleteConfirm} {...getConfirmDeleteConfig('папку')} />
    </Modal>
  );
};
