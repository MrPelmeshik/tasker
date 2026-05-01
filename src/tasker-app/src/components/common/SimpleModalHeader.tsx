import React from 'react';
import { ModalCloseButton } from '../ui';
import css from '../../styles/modal.module.css';

/**
 * Пропсы для простого заголовка модалки (без entity: ActivityDetailEditor, CabinetModal).
 */
export interface SimpleModalHeaderProps {
  /** Заголовок модалки */
  title: string;
  /** Колбэк закрытия */
  onClose: () => void;
  /** Дополнительные кнопки в заголовке (Save, Edit, Cancel и т.п.) */
  children?: React.ReactNode;
  /** Блокировать кнопку закрытия */
  closeDisabled?: boolean;
  /** Показывать кнопку закрытия (в панели детализации — у панели) */
  showCloseButton?: boolean;
}

/**
 * Простой заголовок модалки: заголовок + Close + произвольные actions.
 * Используется в ActivityDetailEditor, CabinetModal и других модалках без entity.
 */
export const SimpleModalHeader: React.FC<SimpleModalHeaderProps> = ({
  title,
  onClose,
  children,
  closeDisabled = false,
  showCloseButton = true,
}) => (
  <div className={css.modalHeader}>
    <h3 className={css.modalTitle}>{title}</h3>
    <div className={css.modalActions}>
      {showCloseButton && <ModalCloseButton onClick={onClose} disabled={closeDisabled} />}
      {children}
    </div>
  </div>
);
