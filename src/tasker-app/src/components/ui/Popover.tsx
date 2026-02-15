import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from '../../styles/popover.module.css';
import { getFloatingPosition, type Placement } from '../../utils/floating-position';

const OPEN_DELAY_MS = 200;
const CLOSE_DELAY_MS = 150;

export type PopoverProps = {
  /** Контент всплывающего окна (можно размещать любые компоненты) */
  content: React.ReactNode;
  /** Позиция относительно триггера */
  placement?: Placement;
  /** Элемент, при наведении на который показывается окно */
  children: React.ReactNode;
  /** Дополнительный класс для панели */
  className?: string;
  /** Заполнить область родителя (например для ячеек таблицы) */
  fillTrigger?: boolean;
};

/**
 * Универсальный компонент всплывающей подсказки.
 * При наведении на триггер показывается панель с произвольным контентом.
 * Курсор можно перевести внутрь панели и взаимодействовать с содержимым.
 */
export const Popover: React.FC<PopoverProps> = ({
  content,
  placement = 'top',
  className,
  fillTrigger,
  children,
}) => {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ left: 0, top: 0, transform: '' });
  const triggerRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearOpenTimer = useCallback(() => {
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
  }, []);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const updatePosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPosition(getFloatingPosition(rect, placement));
  }, [placement]);

  const show = useCallback(() => {
    clearCloseTimer();
    if (visible) return;
    openTimerRef.current = setTimeout(() => {
      openTimerRef.current = null;
      updatePosition();
      setVisible(true);
    }, OPEN_DELAY_MS);
  }, [visible, updatePosition, clearCloseTimer]);

  const hide = useCallback(() => {
    clearOpenTimer();
    closeTimerRef.current = setTimeout(() => {
      closeTimerRef.current = null;
      setVisible(false);
    }, CLOSE_DELAY_MS);
  }, [clearOpenTimer]);

  const handleTriggerEnter = useCallback(() => {
    show();
  }, [show]);

  const handleTriggerLeave = useCallback(() => {
    hide();
  }, [hide]);

  const handlePanelEnter = useCallback(() => {
    clearCloseTimer();
    if (!visible) {
      updatePosition();
      setVisible(true);
    }
  }, [visible, updatePosition, clearCloseTimer]);

  const handlePanelLeave = useCallback(() => {
    hide();
  }, [hide]);

  useEffect(() => {
    return () => {
      clearOpenTimer();
      clearCloseTimer();
    };
  }, [clearOpenTimer, clearCloseTimer]);

  useEffect(() => {
    if (visible) {
      updatePosition();
    }
  }, [visible, updatePosition]);

  const triggerClassName = [styles.trigger, fillTrigger && styles.triggerFill]
    .filter(Boolean)
    .join(' ');
  const panelClassName = [styles.panel, className].filter(Boolean).join(' ');

  const panelEl =
    visible &&
    typeof document !== 'undefined' &&
    createPortal(
      <div
        ref={panelRef}
        className={panelClassName}
        role="dialog"
        aria-label="Всплывающая панель"
        style={{
          left: position.left,
          top: position.top,
          transform: position.transform,
        }}
        onMouseEnter={handlePanelEnter}
        onMouseLeave={handlePanelLeave}
      >
        {content}
      </div>,
      document.body
    );

  return (
    <span
      ref={triggerRef}
      className={triggerClassName}
      onMouseEnter={handleTriggerEnter}
      onMouseLeave={handleTriggerLeave}
      onFocus={handleTriggerEnter}
      onBlur={handleTriggerLeave}
    >
      {children}
      {panelEl}
    </span>
  );
};
