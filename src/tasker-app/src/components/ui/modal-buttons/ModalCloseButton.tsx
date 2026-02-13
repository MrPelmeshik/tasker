import React from 'react';
import { XIcon } from '../../icons';
import { IconToolbarButton } from './IconToolbarButton';

export interface ModalCloseButtonProps
  extends Omit<React.ComponentProps<typeof IconToolbarButton>, 'icon' | 'tooltip'> {}

/** Кнопка закрытия модального окна (X) */
export const ModalCloseButton: React.FC<ModalCloseButtonProps> = (props) => (
  <IconToolbarButton icon={<XIcon />} tooltip="Закрыть" variant="subtle" size="xs" {...props} />
);
