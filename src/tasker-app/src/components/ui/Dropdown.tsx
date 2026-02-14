import React, { useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import styles from '../../styles/dropdown.module.css';
import { getFloatingPosition, type Placement } from '../../utils/floating-position';

type DropdownProps = {
  trigger: React.ReactNode;
  children: React.ReactNode;
  placement?: Placement;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
};

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
    setPosition(getFloatingPosition(rect, placement));
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
        className="inline-flex-pointer"
      >
        {trigger}
      </div>
      {panelEl}
    </div>
  );
};
