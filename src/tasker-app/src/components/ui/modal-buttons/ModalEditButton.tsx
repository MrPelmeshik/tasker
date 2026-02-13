import React from 'react';
import { EditIcon } from '../../icons';
import { IconToolbarButton } from './IconToolbarButton';

export interface ModalEditButtonProps
  extends Omit<React.ComponentProps<typeof IconToolbarButton>, 'icon' | 'tooltip'> {}

/** Кнопка переключения в режим редактирования */
export const ModalEditButton: React.FC<ModalEditButtonProps> = (props) => (
  <IconToolbarButton
    icon={<EditIcon />}
    tooltip="Редактировать"
    variant="subtle"
    size="xs"
    {...props}
  />
);
