import React from 'react';
import { hexToRgb } from '../utils/color';

/**
 * Возвращает inline-стили для кастомного цвета карточки (область, папка, задача).
 * Устанавливает CSS-переменные --card-custom-color и --card-custom-color-rgb.
 */
export function useCustomColorStyle(customColor?: string | null): React.CSSProperties {
  if (!customColor) return {};
  return {
    '--card-custom-color': customColor,
    '--card-custom-color-rgb': hexToRgb(customColor),
  } as React.CSSProperties;
}
