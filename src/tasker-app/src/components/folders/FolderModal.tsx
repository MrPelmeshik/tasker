import React from 'react';
import { Modal } from '../common/Modal';
import { EntityConfirmModals } from '../common/EntityConfirmModals';
import { GlassInput, GlassSelect } from '../ui';
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

  const { options: parentFolderOptions, loading: loadingParents } = useFolderOptions(formData.areaId, {
    enabled: isOpen,
    excludeFolderId: folder?.id,
  });

  const isViewMode = Boolean(folder && !isEditMode);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} hasUnsavedChanges={hasUnsavedChanges} size={size}>
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
          onSave={handleSave}
          onClose={handleClose}
          isLoading={isLoading}
          saveDisabled={!hasChanges || !formData.title.trim() || !formData.areaId}
        />
        <div className={css.modalBody}>
          <div className={formCss.formContainer}>
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
                    : 'Без папки (корень области)'}
                </div>
              }
              editContent={
                <GlassSelect
                  value={formData.parentFolderId === '' || formData.parentFolderId == null ? '' : formData.parentFolderId}
                  onChange={(value) => handleFieldChange('parentFolderId', value)}
                  options={parentFolderOptions}
                  disabled={isLoading || loadingParents}
                  fullWidth
                />
              }
            />
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
                />
              }
            />
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
            {folder && (
              <EntityMetaBlock
                ownerUserName={folder.ownerUserName}
                createdAt={folder.createdAt}
                updatedAt={folder.updatedAt}
                formatDateTime={formatDateTime}
              />
            )}

            {folder && (
              <div style={{ marginTop: 24, marginBottom: 24 }}>
                <h3 className={formCss.sectionTitle}>Структура</h3>
                <div style={{
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12,
                  background: 'rgba(0,0,0,0.2)',
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
