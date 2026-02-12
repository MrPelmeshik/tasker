import React, { useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import styles from '../../styles/tooltip.module.css';

type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';
type TooltipSize = 's' | 'm' | 'l';

const SPACING = 8;

type TooltipProps = {
  content: React.ReactNode;
  placement?: TooltipPlacement;
  size?: TooltipSize;
  className?: string;
  /** Заполнить область родителя (для пустых ячеек таблицы) */
  fillTrigger?: boolean;
  children: React.ReactNode;
};

/** Вычисляет позицию tooltip при position: fixed */
function getTooltipPosition(
  rect: DOMRect,
  placement: TooltipPlacement
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

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  placement = 'top',
  size = 'm',
  className,
  fillTrigger,
  children,
}) => {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ left: 0, top: 0, transform: '' });
  const triggerRef = useRef<HTMLSpanElement>(null);

  const updatePosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPosition(getTooltipPosition(rect, placement));
  }, [placement]);

  const handleMouseEnter = useCallback(() => {
    updatePosition();
    setVisible(true);
  }, [updatePosition]);

  const handleMouseLeave = useCallback(() => {
    setVisible(false);
  }, []);

  const wrapperClassName = [styles.trigger, fillTrigger && styles.triggerFill]
    .filter(Boolean)
    .join(' ');
  const tooltipClassName = [styles.tooltip, styles.tooltipPortal, styles[size], className]
    .filter(Boolean)
    .join(' ');

  const tooltipEl = visible && (
    <span
      role="tooltip"
      className={tooltipClassName}
      style={{
        left: position.left,
        top: position.top,
        transform: position.transform,
        opacity: visible ? 1 : 0,
        visibility: visible ? 'visible' : 'hidden',
      }}
    >
      {content}
    </span>
  );

  return (
    <span
      ref={triggerRef}
      className={wrapperClassName}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      {children}
      {typeof document !== 'undefined' && tooltipEl && createPortal(tooltipEl, document.body)}
    </span>
  );
};


