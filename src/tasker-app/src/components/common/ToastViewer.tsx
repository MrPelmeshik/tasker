import React, { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useToast } from '../../context/ToastContext';
import type { Toast, ToastVariant } from '../../context/ToastContext';
import { XIcon } from '../icons/XIcon';
import css from '../../styles/toast.module.css';

/** Символы для иконок по варианту */
const VARIANT_ICONS: Record<ToastVariant, string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

/** Соответствие variant -> CSS-класс */
const VARIANT_CLASSES: Record<ToastVariant, string> = {
  success: css.itemSuccess,
  error: css.itemError,
  warning: css.itemWarning,
  info: css.itemInfo,
};

/** Один элемент toast с анимацией выхода */
const ToastItem: React.FC<{
  toast: Toast;
  onClose: (id: string) => void;
}> = ({ toast, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => onClose(toast.id), 200);
  }, [onClose, toast.id]);

  return (
    <div
      role="alert"
      className={`${css.item} ${VARIANT_CLASSES[toast.variant]} ${isExiting ? css.itemExiting : ''}`}
      aria-live="polite"
    >
      <span className={css.icon} aria-hidden="true">
        {VARIANT_ICONS[toast.variant]}
      </span>
      <span className={css.message}>{toast.message}</span>
      <button
        type="button"
        className={css.closeBtn}
        onClick={handleClose}
        aria-label="Закрыть уведомление"
      >
        <XIcon className="icon-m" />
      </button>
    </div>
  );
};

/**
 * Контейнер toast-уведомлений.
 * Рендерится в портал document.body, позиция bottom-right.
 */
export const ToastViewer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  const content = (
    <div className={css.container} aria-label="Уведомления">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onClose={removeToast} />
      ))}
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : null;
};
