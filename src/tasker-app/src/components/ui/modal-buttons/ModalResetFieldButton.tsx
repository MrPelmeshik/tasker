import React from 'react';
import { ResetIcon } from '../../icons';
import { IconToolbarButton } from './IconToolbarButton';

export interface ModalResetFieldButtonProps
  extends Omit<React.ComponentProps<typeof IconToolbarButton>, 'icon' | 'tooltip'> {}

/** Кнопка сброса значения отдельного поля в форме */
export const ModalResetFieldButton: React.FC<ModalResetFieldButtonProps> = (props) => (
  <IconToolbarButton
    icon={<ResetIcon />}
    tooltip="Сбросить поле"
    variant="subtle"
    size="xxs"
    {...props}
  />
);
