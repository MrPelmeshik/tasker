import React, { useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import css from '../../styles/modal.module.css';
import type { ModalSize } from '../../types/modal-size';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  hasUnsavedChanges?: boolean;
  onUnsavedChangesClose?: () => void;
  size?: ModalSize;
  renderMode?: 'portal' | 'inline';
  /**
   * Внешний вид при renderMode=inline: card — как отдельное окно; embedded — без второй «карточки» (панель детализации).
   */
  inlinePresentation?: 'card' | 'embedded';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  className = '',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  hasUnsavedChanges = false,
  onUnsavedChangesClose,
  size = 'large',
  renderMode = 'portal',
  inlinePresentation = 'card',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => {
    if (hasUnsavedChanges && onUnsavedChangesClose) {
      onUnsavedChangesClose();
    } else {
      onClose();
    }
  }, [hasUnsavedChanges, onUnsavedChangesClose, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === 'Escape') {
        handleClose();
      }
    };

    if (renderMode === 'inline') {
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }

    const handleOverlayClick = (event: MouseEvent) => {
      if (closeOnOverlayClick && modalRef.current && event.target === modalRef.current) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleOverlayClick);

    // Блокируем скролл body при открытом модальном окне (только портал с оверлеем)
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleOverlayClick);
      document.body.style.overflow = '';
    };
  }, [isOpen, closeOnOverlayClick, closeOnEscape, handleClose, renderMode]);

  if (!isOpen) return null;

  const getSizeClass = (size: ModalSize) => {
    switch (size) {
      case 'small':
        return css.modalSmall;
      case 'medium':
        return css.modalMedium;
      case 'large':
        return css.modalLarge;
      case 'confirm':
        return css.modalConfirm;
      default:
        return css.modalLarge;
    }
  };

  const modalClass = [
    css.modal,
    'glass-fallback-bg',
    getSizeClass(size),
    className
  ].filter(Boolean).join(' ');

  if (renderMode === 'inline') {
    const inlineExtra = inlinePresentation === 'embedded' ? ` ${css.inlineModalEmbedded}` : '';
    return (
      <div className={css.inlineRoot}>
        <div className={`${modalClass} ${css.inlineModal}${inlineExtra}`}>{children}</div>
      </div>
    );
  }

  return createPortal(
    <div
      className={css.overlay}
      ref={modalRef}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <div className={modalClass}>
        {children}
      </div>
    </div>,
    document.body
  );
};
