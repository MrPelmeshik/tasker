/**
 * Утилита позиционирования floating-элементов (dropdown, tooltip).
 * Отступ соответствует --space-8 из index.css.
 */

const FLOATING_OFFSET = 8;

export type Placement = 'top' | 'bottom' | 'left' | 'right';

export function getFloatingPosition(
  rect: DOMRect,
  placement: Placement
): { left: number; top: number; transform: string } {
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  switch (placement) {
    case 'top':
      return { left: centerX, top: rect.top - FLOATING_OFFSET, transform: 'translate(-50%, -100%)' };
    case 'bottom':
      return { left: centerX, top: rect.bottom + FLOATING_OFFSET, transform: 'translate(-50%, 0)' };
    case 'left':
      return { left: rect.left - FLOATING_OFFSET, top: centerY, transform: 'translate(-100%, -50%)' };
    case 'right':
      return { left: rect.right + FLOATING_OFFSET, top: centerY, transform: 'translate(0, -50%)' };
  }
}
