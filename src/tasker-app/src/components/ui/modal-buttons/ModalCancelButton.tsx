import React from 'react';
import { ResetIcon } from '../../icons';
import { IconToolbarButton } from './IconToolbarButton';

export interface ModalCancelButtonProps
  extends Omit<React.ComponentProps<typeof IconToolbarButton>, 'icon' | 'tooltip'> {}

/** Кнопка отмены изменений (возврат к просмотру) */
export const ModalCancelButton: React.FC<ModalCancelButtonProps> = (props) => (
  <IconToolbarButton
    icon={<ResetIcon />}
    tooltip="Отменить изменения"
    variant="subtle"
    size="xs"
    {...props}
  />
);
