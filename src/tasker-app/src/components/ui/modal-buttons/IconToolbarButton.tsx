import React from 'react';
import { GlassButton } from '../GlassButton';
import { Tooltip } from '../Tooltip';

type GlassButtonVariant = 'default' | 'primary' | 'danger' | 'success' | 'warning' | 'subtle';
type GlassButtonSize = 'xxs' | 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl' | 'xxxl';
type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface IconToolbarButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'value' | 'onChange'> {
  /** Иконка для отображения в кнопке */
  icon: React.ReactNode;
  /** Текст всплывающей подсказки */
  tooltip: string;
  /** Вариант оформления кнопки */
  variant?: GlassButtonVariant;
  /** Размер кнопки */
  size?: GlassButtonSize;
  /** Позиция tooltip относительно кнопки */
  placement?: TooltipPlacement;
  /** Дополнительный CSS-класс */
  className?: string;
}

/**
 * Универсальная кнопка с иконкой и всплывающей подсказкой.
 * Используется в тулбарах модальных окон и формах.
 */
export const IconToolbarButton: React.FC<IconToolbarButtonProps> = ({
  icon,
  tooltip,
  variant = 'default',
  size = 'm',
  placement = 'bottom',
  className,
  ...rest
}) => {
  return (
    <Tooltip content={tooltip} placement={placement} size="s">
      <GlassButton
        variant={variant}
        size={size}
        className={className}
        aria-label={tooltip}
        {...rest}
      >
        {icon}
      </GlassButton>
    </Tooltip>
  );
};
