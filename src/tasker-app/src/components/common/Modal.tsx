import React, { useEffect, useRef } from 'react';
import css from '../../styles/modal.module.css';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  hasUnsavedChanges?: boolean;
  onUnsavedChangesClose?: () => void;
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
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  const handleClose = () => {
    if (hasUnsavedChanges && onUnsavedChangesClose) {
      onUnsavedChangesClose();
    } else {
      onClose();
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === 'Escape') {
        handleClose();
      }
    };

    const handleOverlayClick = (event: MouseEvent) => {
      if (closeOnOverlayClick && modalRef.current && event.target === modalRef.current) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleOverlayClick);

    // Блокируем скролл body при открытом модальном окне
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleOverlayClick);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, closeOnOverlayClick, closeOnEscape, hasUnsavedChanges, onUnsavedChangesClose]);

  if (!isOpen) return null;

  return (
    <div className={css.overlay} ref={modalRef}>
      <div className={`${css.modal} ${className}`}>
        {children}
      </div>
    </div>
  );
};
