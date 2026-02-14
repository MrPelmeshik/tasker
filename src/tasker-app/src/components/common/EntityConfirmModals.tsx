import React from 'react';
import { ConfirmModal } from './ConfirmModal';
import { CONFIRM_UNSAVED_CHANGES, CONFIRM_RETURN_TO_VIEW, getConfirmDeleteConfig } from '../../constants/confirm-modals';

export interface EntityConfirmModalsProps {
  showConfirmModal: boolean;
  onConfirmSave: () => void | Promise<void>;
  onConfirmCancel: () => void;
  onConfirmDiscard: () => void;
  showReturnToViewConfirm: boolean;
  onDismissReturnToView: () => void;
  onConfirmReturnToView: () => void;
  showDeleteConfirm: boolean;
  onDismissDelete: () => void;
  onConfirmDelete: () => void | Promise<void>;
  isLoading: boolean;
  entityNameForDelete: string;
  removeMember?: {
    member: { userName?: string } | null;
    onClose: () => void;
    onConfirm: () => void;
  };
}

export const EntityConfirmModals: React.FC<EntityConfirmModalsProps> = ({
  showConfirmModal,
  onConfirmSave,
  onConfirmCancel,
  onConfirmDiscard,
  showReturnToViewConfirm,
  onDismissReturnToView,
  onConfirmReturnToView,
  showDeleteConfirm,
  onDismissDelete,
  onConfirmDelete,
  isLoading,
  entityNameForDelete,
  removeMember,
}) => (
  <>
    <ConfirmModal
      isOpen={showConfirmModal}
      onClose={onConfirmCancel}
      onConfirm={onConfirmSave}
      onCancel={onConfirmCancel}
      onDiscard={onConfirmDiscard}
      confirmDisabled={isLoading}
      {...CONFIRM_UNSAVED_CHANGES}
    />
    <ConfirmModal
      isOpen={showReturnToViewConfirm}
      onClose={onDismissReturnToView}
      onConfirm={onConfirmReturnToView}
      onCancel={onDismissReturnToView}
      {...CONFIRM_RETURN_TO_VIEW}
    />
    <ConfirmModal
      isOpen={showDeleteConfirm}
      onClose={onDismissDelete}
      onConfirm={onConfirmDelete}
      onCancel={onDismissDelete}
      confirmDisabled={isLoading}
      {...getConfirmDeleteConfig(entityNameForDelete)}
    />
    {removeMember && (
      <ConfirmModal
        isOpen={Boolean(removeMember.member)}
        onClose={removeMember.onClose}
        onConfirm={removeMember.onConfirm}
        onCancel={removeMember.onClose}
        title="Удалить участника"
        message={removeMember.member ? `Удалить ${removeMember.member.userName || 'участника'} из области?` : ''}
        confirmText="Удалить"
        cancelText="Отмена"
        variant="danger"
      />
    )}
  </>
);
