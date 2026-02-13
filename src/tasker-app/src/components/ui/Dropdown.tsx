import React, { useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import styles from '../../styles/dropdown.module.css';

type DropdownPlacement = 'top' | 'bottom' | 'left' | 'right';

const SPACING = 8;

type DropdownProps = {
  /** Элемент, по клику на который открывается меню */
  trigger: React.ReactNode;
  /** Содержимое выпадающего меню */
  children: React.ReactNode;
  /** Положение меню относительно триггера */
  placement?: DropdownPlacement;
  /** Управляемый флаг открытости */
  open: boolean;
  /** Колбэк при изменении состояния открытости */
  onOpenChange: (open: boolean) => void;
  /** Дополнительный класс для панели */
  className?: string;
};

/**
 * Вычисляет позицию панели при position: fixed
 */
function getPanelPosition(
  rect: DOMRect,
  placement: DropdownPlacement
): { left: number; top: number; transform: string } {
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  switch (placement) {
    case 'top':
      return { left: centerX, top: rect.top - SPACING, transform: 'translate(-50%, -100%)' };
    case 'bottom':
      return { left: centerX, top: rect.bottom + SPACING, transform: 'translate(-50%, 0)' };
    case 'left':
      return { left: rect.left - SPACING, top: centerY, transform: 'translate(-100%, -50%)' };
    case 'right':
      return { left: rect.right + SPACING, top: centerY, transform: 'translate(0, -50%)' };
  }
}

/**
 * Универсальный выпадающий компонент.
 * Открывается по клику на триггер, закрывается по клику вне меню или по Escape.
 */
export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  children,
  placement = 'bottom',
  open,
  onOpenChange,
  className,
}) => {
  const triggerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = React.useState({ left: 0, top: 0, transform: '' });

  const updatePosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPosition(getPanelPosition(rect, placement));
  }, [placement]);

  const handleTriggerClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onOpenChange(!open);
    },
    [open, onOpenChange]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false);
      }
    },
    [open, onOpenChange]
  );

  useEffect(() => {
    if (open) {
      updatePosition();
    }
  }, [open, updatePosition]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (!open) return;

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      const triggerEl = triggerRef.current;
      const panelEl = panelRef.current;
      if (
        triggerEl &&
        panelEl &&
        !triggerEl.contains(target) &&
        !panelEl.contains(target)
      ) {
        onOpenChange(false);
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [open, onOpenChange]);

  const panelClassName = [styles.panel, className].filter(Boolean).join(' ');

  const panelEl =
    open &&
    typeof document !== 'undefined' &&
    createPortal(
      <div
        ref={panelRef}
        className={panelClassName}
        role="menu"
        style={{
          left: position.left,
          top: position.top,
          transform: position.transform,
        }}
      >
        {children}
      </div>,
      document.body
    );

  return (
    <div ref={triggerRef} className={styles.trigger}>
      <div
        onClick={handleTriggerClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleTriggerClick(e as unknown as React.MouseEvent);
          }
        }}
        role="button"
        tabIndex={0}
        style={{ display: 'inline-flex', cursor: 'pointer' }}
      >
        {trigger}
      </div>
      {panelEl}
    </div>
  );
};
