import React from 'react';
import { SaveIcon } from '../../icons';
import { IconToolbarButton } from './IconToolbarButton';

export interface ModalSaveButtonProps
  extends Omit<React.ComponentProps<typeof IconToolbarButton>, 'icon' | 'tooltip'> {}

/** Кнопка сохранения */
export const ModalSaveButton: React.FC<ModalSaveButtonProps> = (props) => (
  <IconToolbarButton icon={<SaveIcon />} tooltip="Сохранить" variant="primary" size="xs" {...props} />
);
