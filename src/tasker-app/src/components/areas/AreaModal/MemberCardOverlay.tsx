import React from 'react';
import { GripVerticalIcon } from '../../icons/GripVerticalIcon';
import formCss from '../../../styles/modal-form.module.css';
import css from './area-modal.members.module.css';
import { AREA_ROLE_LABELS } from '../../../utils/area-role';
import type { AreaMemberResponse } from '../../../types';

/**
 * Превью карточки при перетаскивании (для DragOverlay).
 */
export interface MemberCardOverlayProps {
  member: AreaMemberResponse;
}

export const MemberCardOverlay: React.FC<MemberCardOverlayProps> = ({ member }) => (
  <li className={`${formCss.readonlyMetaRow} ${css.overlayCard}`}>
    <span className={css.overlayGripSpace}>
      <GripVerticalIcon className="icon-l icon-muted" />
    </span>
    <span className={`${formCss.readonlyMetaValue} ${css.memberValue}`}>{member.userName || '—'}</span>
    <span className={formCss.readonlyMetaLabel}>{AREA_ROLE_LABELS[member.role] ?? member.role}</span>
  </li>
);
