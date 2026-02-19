import React from 'react';
import { Modal } from '../common/Modal';
import { EntityConfirmModals } from '../common/EntityConfirmModals';
import { GlassInput, GlassSelect, ColorPicker } from '../ui';
import { MarkdownEditor } from '../ui/MarkdownEditor/MarkdownEditor';
import { MarkdownViewer } from '../ui/MarkdownViewer/MarkdownViewer';
import { EntityMetaBlock } from '../common/EntityMetaBlock';
import { EntityModalHeader } from '../common/EntityModalHeader';
import { EntityFormField } from '../common/EntityFormField';
import { useEntityFormModal, useFolderOptions, useCopyEntityLink } from '../../hooks';
import css from '../../styles/modal.module.css';
import formCss from '../../styles/modal-form.module.css';
import { formatDateTime } from '../../utils/date';
import type { FolderResponse, FolderCreateRequest, FolderUpdateRequest } from '../../types/api';
import type { ModalSize } from '../../types/modal-size';
import { HierarchyTree } from '../../features/tasker/widgets/Tree/HierarchyTree';
import { AttachmentList } from '../attachments/AttachmentList';
import { EntityType, attachmentApi } from '../../services/api/attachment.api';

export interface FolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: FolderCreateRequest | FolderUpdateRequest, folderId?: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  folder?: FolderResponse | null;
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
  const { copyLink: handleCopyLink } = useCopyEntityLink('folder', folder?.id);

  const modal = useEntityFormModal<FolderCreateRequest & { parentFolderId?: string | null }>({
    isOpen,
    entity: folder,
    getInitialData: () => {
      const pid = folder?.parentFolderId ?? defaultParentFolderId ?? null;
      return folder
        ? { title: folder.title, description: folder.description || '', areaId: folder.areaId, parentFolderId: pid == null ? '' : pid, color: folder.customColor ?? '' }
        : {
          title: '',
          description: '',
          areaId: defaultAreaId || (areas.length > 0 ? areas[0].id : ''),
          parentFolderId: pid == null ? '' : pid,
          color: '',
        };
    },
    deps: [folder, areas, defaultAreaId, defaultParentFolderId],
    onClose,
    onSave: async (data) => {
      const pid = (data.parentFolderId === '' || data.parentFolderId == null) ? null : data.parentFolderId;
      await onSave({ ...data, parentFolderId: pid, color: data.color || null }, folder?.id);
    },
    onDelete,
    validate: (data) => Boolean(data.title?.trim() && data.areaId),
  });

  const { formData, fieldChanges, handleFieldChange, handleResetField, hasChanges, hasUnsavedChanges, showConfirmModal, showReturnToViewConfirm, showDeleteConfirm, handleClose, handleConfirmSave, handleConfirmDiscard, handleConfirmCancel, handleReturnToView, handleConfirmReturnToView, handleDeleteRequest, handleConfirmDelete, dismissReturnToViewConfirm, dismissDeleteConfirm, handleSave, isEditMode, setIsEditMode, isLoading } = modal;

  // Transactional attachments
  const [uploadedAttachmentIds, setUploadedAttachmentIds] = React.useState<Set<string>>(new Set());

  const handleUploadSuccess = (id: string) => {
    setUploadedAttachmentIds(prev => new Set(prev).add(id));
  };

  const cleanupAttachments = async () => {
    if (uploadedAttachmentIds.size > 0) {
      for (const id of Array.from(uploadedAttachmentIds)) {
        try {
          await attachmentApi.delete(id);
        } catch (e) {
          console.error('Error cleaning up attachment', id, e);
        }
      }
      setUploadedAttachmentIds(new Set());
    }
  };

  // Overwrite handleClose to include cleanup
  const safeHandleClose = async () => {
    if (hasUnsavedChanges || uploadedAttachmentIds.size > 0) {
      if (window.confirm('Есть несохраненные изменения. Закрыть без сохранения?')) {
        await cleanupAttachments();
        handleClose();
      }
    } else {
      handleClose();
    }
  };

  // Overwrite handleSave to clear tracking
  const safeHandleSave = async () => {
    await handleSave();
    setUploadedAttachmentIds(new Set());
  };

  const { options: parentFolderOptions, loading: loadingParents } = useFolderOptions(formData.areaId, {
    enabled: isOpen,
    excludeFolderId: folder?.id,
  });

  const isViewMode = Boolean(folder && !isEditMode);

  return (
    <Modal isOpen={isOpen} onClose={safeHandleClose} hasUnsavedChanges={hasUnsavedChanges} size={size}>
      <div className={css.modalContent}>
        <EntityModalHeader
          title={isViewMode ? 'Папка' : folder ? 'Редактирование папки' : 'Создание папки'}
          isViewMode={isViewMode}
          hasEntity={!!folder?.id}
          showDeleteInViewMode={!!(folder && onDelete)}
          showDeleteInEditMode={!!(folder && onDelete)}
          onCopyLink={handleCopyLink}
          onEdit={() => setIsEditMode(true)}
          onDelete={handleDeleteRequest}
          onCancel={handleReturnToView}
          onSave={safeHandleSave}
          onClose={safeHandleClose}
          isLoading={isLoading}
          saveDisabled={(!hasChanges && uploadedAttachmentIds.size === 0) || !formData.title.trim() || !formData.areaId}
        />
        <div className={css.modalBody}>
          <div className={formCss.formContainer}>
            <EntityFormField
              label="Название папки *"
              hasChange={fieldChanges.title}
              onReset={() => handleResetField('title')}
              isViewMode={isViewMode}
              viewContent={<div className={formCss.fieldValueReadonly}>{formData.title || '—'}</div>}
              editContent={
                <GlassInput
                  value={formData.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('title', e.target.value)}
                  placeholder="Введите название папки"
                  disabled={isLoading}
                  fullWidth
                  variant="subtle"
                />
              }
            />

            <div className={formCss.fieldRow}>
              <EntityFormField
                label="Область *"
                hasChange={fieldChanges.areaId}
                onReset={() => handleResetField('areaId')}
                isViewMode={isViewMode}
                viewContent={<div className={formCss.fieldValueReadonly}>{areas.find((a) => a.id === formData.areaId)?.title ?? '—'}</div>}
                editContent={
                  <GlassSelect
                    value={formData.areaId}
                    onChange={(value) => handleFieldChange('areaId', value)}
                    options={[{ value: '', label: 'Выберите область' }, ...areas.map((a) => ({ value: a.id, label: a.title }))]}
                    disabled={isLoading}
                    fullWidth
                    variant="subtle"
                  />
                }
              />
              <EntityFormField
                label="Родительская папка"
                hasChange={fieldChanges.parentFolderId}
                onReset={() => handleResetField('parentFolderId')}
                isViewMode={isViewMode}
                viewContent={
                  <div className={formCss.fieldValueReadonly}>
                    {formData.parentFolderId
                      ? parentFolderOptions.find((o) => o.value === formData.parentFolderId)?.label ?? '—'
                      : 'Корень области'}
                  </div>
                }
                editContent={
                  <GlassSelect
                    value={formData.parentFolderId === '' || formData.parentFolderId == null ? '' : formData.parentFolderId}
                    onChange={(value) => handleFieldChange('parentFolderId', value)}
                    options={parentFolderOptions}
                    disabled={isLoading || loadingParents}
                    fullWidth
                    variant="subtle"
                  />
                }
              />
            </div>

            <EntityFormField
              label="Описание"
              hasChange={fieldChanges.description}
              onReset={() => handleResetField('description')}
              isViewMode={isViewMode}
              viewContent={<MarkdownViewer value={formData.description} />}
              editContent={
                <MarkdownEditor
                  value={formData.description}
                  onChange={(val) => handleFieldChange('description', val)}
                  placeholder="Введите описание папки"
                  rows={4}
                  disabled={isLoading}
                  maxLength={10000}
                />
              }
            />

            <EntityFormField
              label="Цвет"
              hasChange={fieldChanges.color}
              onReset={() => handleResetField('color')}
              isViewMode={isViewMode}
              viewContent={
                formData.color ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      width: 16,
                      height: 16,
                      borderRadius: 4,
                      backgroundColor: formData.color,
                      border: '1px solid rgba(255,255,255,0.2)',
                      flexShrink: 0,
                    }} />
                    <span>{formData.color}</span>
                  </div>
                ) : (
                  <div className={formCss.fieldValueReadonly}>Наследуется от области</div>
                )
              }
              editContent={
                <ColorPicker
                  value={formData.color || undefined}
                  onChange={(hex) => handleFieldChange('color', hex)}
                  onClear={() => handleFieldChange('color', '')}
                  disabled={isLoading}
                  showHexInput
                />
              }
            />

            {folder && (
              <div style={{ marginBottom: 16 }}>
                <AttachmentList
                  entityId={folder.id}
                  entityType={EntityType.FOLDER}
                  isEditMode={isEditMode}
                  onUploadSuccess={handleUploadSuccess}
                />
              </div>
            )}
            {folder && (
              <EntityMetaBlock
                ownerUserName={folder.ownerUserName}
                createdAt={folder.createdAt}
                updatedAt={folder.updatedAt}
                formatDateTime={formatDateTime}
              />
            )}

            {folder && (
              <div>
                <h3 className={formCss.sectionTitle}>Структура</h3>
                <div style={{
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 8,
                  minHeight: 200,
                  maxHeight: 500,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <HierarchyTree root={{ type: 'folder', id: folder.id, areaId: folder.areaId }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <EntityConfirmModals
        showConfirmModal={showConfirmModal}
        onConfirmSave={handleConfirmSave}
        onConfirmCancel={handleConfirmCancel}
        onConfirmDiscard={handleConfirmDiscard}
        showReturnToViewConfirm={showReturnToViewConfirm}
        onDismissReturnToView={dismissReturnToViewConfirm}
        onConfirmReturnToView={handleConfirmReturnToView}
        showDeleteConfirm={showDeleteConfirm}
        onDismissDelete={dismissDeleteConfirm}
        onConfirmDelete={handleConfirmDelete}
        isLoading={isLoading}
        entityNameForDelete="папку"
      />
    </Modal>
  );
};
