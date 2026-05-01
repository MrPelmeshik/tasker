import React from 'react';
import css from '../../styles/modal.module.css';

/**
 * <summary>Вертикальный каркас содержимого модалки (колонка с flex и min-height: 0).</summary>
 */
export const ModalContentFrame: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => <div className={`${css.modalContent} ${className}`.trim()}>{children}</div>;

/**
 * <summary>Область тела с вертикальным скроллом (класс modalBody).</summary>
 */
export const ModalFormBody: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => <div className={`${css.modalBody} ${className}`.trim()}>{children}</div>;
