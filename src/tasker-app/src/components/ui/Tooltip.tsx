import React, { useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import styles from '../../styles/tooltip.module.css';
import { getFloatingPosition, type Placement } from '../../utils/floating-position';

type TooltipSize = 's' | 'm' | 'l';

type TooltipProps = {
  content: React.ReactNode;
  placement?: Placement;
  size?: TooltipSize;
  className?: string;
  /** Заполнить область родителя (для пустых ячеек таблицы) */
  fillTrigger?: boolean;
  children: React.ReactNode;
};

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
    setPosition(getFloatingPosition(rect, placement));
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


