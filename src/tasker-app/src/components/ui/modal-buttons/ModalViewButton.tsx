import React from 'react';
import { EyeIcon } from '../../icons';
import { IconToolbarButton } from './IconToolbarButton';

export interface ModalViewButtonProps
  extends Omit<React.ComponentProps<typeof IconToolbarButton>, 'icon' | 'tooltip'> {
  /** Переопределение текста подсказки */
  tooltip?: string;
}

/** Кнопка просмотра деталей / подробнее */
export const ModalViewButton: React.FC<ModalViewButtonProps> = ({
  tooltip = 'Подробнее',
  ...props
}) => (
  <IconToolbarButton
    icon={<EyeIcon />}
    tooltip={tooltip}
    variant="subtle"
    size="xxs"
    {...props}
  />
);
