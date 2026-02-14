import React from 'react';
import formCss from '../../../styles/modal-form.module.css';
import css from './area-modal.members.module.css';
import { AREA_ROLE_LABELS } from '../../../utils/area-role';
import type { AreaMemberResponse } from '../../../types';

/**
 * Статичная карточка участника (Owner - без перетаскивания и удаления).
 */
export interface StaticMemberCardProps {
  member: AreaMemberResponse;
}

export const StaticMemberCard: React.FC<StaticMemberCardProps> = ({ member }) => (
  <li className={`${formCss.readonlyMetaRow} ${css.memberRow}`}>
    <span className={css.gripPlaceholder} aria-hidden />
    <span className={`${formCss.readonlyMetaValue} ${css.memberValue}`}>{member.userName || '—'}</span>
    <span className={formCss.readonlyMetaLabel}>{AREA_ROLE_LABELS[member.role] ?? member.role}</span>
  </li>
);
