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

export type EntityModalToolbarProps = {
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
  /** Показывать кнопку закрытия модалки (в панели детализации закрытие — у панели) */
  showCloseButton?: boolean;
};

/**
 * <summary>Кнопки действий сущности без заголовка (панель детализации или шапка модалки).</summary>
 */
export const EntityModalToolbar: React.FC<EntityModalToolbarProps> = ({
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
  showCloseButton = true,
}) => (
  <div className={css.modalActions}>
    {showCloseButton && <ModalCloseButton onClick={onClose} disabled={isLoading} />}
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
);

export interface EntityModalHeaderProps extends EntityModalToolbarProps {
  title: string;
}

export const EntityModalHeader: React.FC<EntityModalHeaderProps> = ({
  title,
  showCloseButton = true,
  ...toolbar
}) => {
  return (
    <div className={css.modalHeader}>
      <h3 className={css.modalTitle}>{title}</h3>
      <EntityModalToolbar {...toolbar} showCloseButton={showCloseButton} />
    </div>
  );
};
