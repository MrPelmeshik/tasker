import React from 'react';
import { Modal } from './Modal';
import { GlassButton } from '../ui/GlassButton';
import css from '../../styles/modal.module.css';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  onDiscard?: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  discardText?: string;
  variant?: 'default' | 'danger';
  showDiscard?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onCancel,
  onDiscard,
  title = 'Подтверждение',
  message = 'Вы уверены, что хотите продолжить?',
  confirmText = 'Да',
  cancelText = 'Отмена',
  discardText = 'Не сохранять',
  variant = 'default',
  showDiscard = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false} closeOnEscape={false} size="confirm">
      <div className={css.modalContent}>
        <div className={css.modalHeader}>
          <h3 className={css.modalTitle}>{title}</h3>
        </div>
        
        <div className={css.modalBody}>
          <p className={css.confirmMessage}>
            {message}
          </p>
        </div>
        
        <div className={css.modalFooter}>
          <GlassButton
            variant="subtle"
            size="m"
            onClick={onCancel}
          >
            {cancelText}
          </GlassButton>
          {showDiscard && onDiscard && (
            <GlassButton
              variant="danger"
              size="m"
              onClick={onDiscard}
            >
              {discardText}
            </GlassButton>
          )}
          <GlassButton
            variant={variant === 'danger' ? 'danger' : 'primary'}
            size="m"
            onClick={onConfirm}
          >
            {confirmText}
          </GlassButton>
        </div>
      </div>
    </Modal>
  );
};
