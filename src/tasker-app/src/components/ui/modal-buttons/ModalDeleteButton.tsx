import React from 'react';
import { DeleteIcon } from '../../icons';
import { IconToolbarButton } from './IconToolbarButton';

export interface ModalDeleteButtonProps
  extends Omit<React.ComponentProps<typeof IconToolbarButton>, 'icon' | 'tooltip'> {}

/** Кнопка удаления */
export const ModalDeleteButton: React.FC<ModalDeleteButtonProps> = (props) => (
  <IconToolbarButton
    icon={<DeleteIcon />}
    tooltip="Удалить"
    variant="danger"
    size="xs"
    {...props}
  />
);
