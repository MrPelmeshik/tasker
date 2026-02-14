import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { ModalDeleteButton } from '../../ui';
import { GripVerticalIcon } from '../../icons/GripVerticalIcon';
import formCss from '../../../styles/modal-form.module.css';
import css from './area-modal.members.module.css';
import type { AreaMemberResponse } from '../../../types';

/**
 * Карточка участника с поддержкой перетаскивания (для ролей кроме Owner, только в режиме редактирования).
 */
export interface DraggableMemberCardProps {
  member: AreaMemberResponse;
  disabled: boolean;
  onRemove: () => void;
}

export const DraggableMemberCard: React.FC<DraggableMemberCardProps> = ({ member, disabled, onRemove }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: member.userId,
    data: { member },
  });
  return (
    <li
      ref={setNodeRef}
      className={`${formCss.readonlyMetaRow} ${css.memberRow} ${isDragging ? css.memberRowDragging : ''}`}
    >
      <span {...attributes} {...listeners} className={css.dragHandle} aria-label="Перетащить">
        <GripVerticalIcon className="icon-m icon-muted" />
      </span>
      <span className={`${formCss.readonlyMetaValue} ${css.memberValue}`}>{member.userName || '—'}</span>
      <ModalDeleteButton size="xxs" onClick={onRemove} disabled={disabled} />
    </li>
  );
};
