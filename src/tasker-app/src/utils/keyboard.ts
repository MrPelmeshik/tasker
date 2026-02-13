import type React from 'react';

/**
 * Обработчик клавиш Enter/Space для раскрытия/сворачивания элемента (область, папка и т.п.).
 */
export function handleExpandKeyDown(
  e: React.KeyboardEvent,
  onToggle: () => void
): void {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    onToggle();
  }
}
