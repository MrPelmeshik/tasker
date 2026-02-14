import React from 'react';
import {
  GlassButton,
  ModalCloseButton,
  ModalCancelButton,
  ModalSaveButton,
  ModalDeleteButton,
  ModalEditButton,
} from '../ui';
import { Tooltip } from '../ui/Tooltip';
import { LinkIcon } from '../icons/LinkIcon';
import css from '../../styles/modal.module.css';

export interface EntityModalHeaderProps {
  title: string;
  isViewMode: boolean;
  hasEntity: boolean;
  canEdit?: boolean;
  showDeleteInViewMode: boolean;
  showDeleteInEditMode: boolean;
  onCopyLink: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onCancel: () => void;
  onSave: () => void;
  onClose: () => void;
  isLoading: boolean;
  saveDisabled: boolean;
}

export const EntityModalHeader: React.FC<EntityModalHeaderProps> = ({
  title,
  isViewMode,
  hasEntity,
  canEdit = true,
  showDeleteInViewMode,
  showDeleteInEditMode,
  onCopyLink,
  onEdit,
  onDelete,
  onCancel,
  onSave,
  onClose,
  isLoading,
  saveDisabled,
}) => {
  return (
    <div className={css.modalHeader}>
      <h3 className={css.modalTitle}>{title}</h3>
      <div className={css.modalActions}>
        <ModalCloseButton onClick={onClose} disabled={isLoading} />
        {hasEntity && (
          <Tooltip content="Копировать ссылку" placement="bottom">
            <GlassButton
              variant="subtle"
              size="xs"
              onClick={onCopyLink}
              disabled={isLoading}
              aria-label="Копировать ссылку"
            >
              <LinkIcon />
            </GlassButton>
          </Tooltip>
        )}
        {isViewMode ? (
          <>
            {canEdit && (
              <ModalEditButton variant="primary" onClick={onEdit} disabled={isLoading} />
            )}
            {showDeleteInViewMode && <ModalDeleteButton onClick={onDelete} disabled={isLoading} />}
          </>
        ) : (
          <>
            {hasEntity && <ModalCancelButton onClick={onCancel} disabled={isLoading} />}
            <ModalSaveButton onClick={onSave} disabled={saveDisabled || isLoading} />
            {showDeleteInEditMode && <ModalDeleteButton onClick={onDelete} disabled={isLoading} />}
          </>
        )}
      </div>
    </div>
  );
};
