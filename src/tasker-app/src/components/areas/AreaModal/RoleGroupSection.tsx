import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { DraggableMemberCard } from './DraggableMemberCard';
import { StaticMemberCard } from './StaticMemberCard';
import formCss from '../../../styles/modal-form.module.css';
import css from './area-modal.members.module.css';
import { AREA_ROLE_LABELS } from '../../../utils/area-role';
import type { AreaMemberResponse, AreaRole } from '../../../types';

/**
 * Группа участников по роли с droppable-зоной (для смены роли перетаскиванием).
 */
export interface RoleGroupSectionProps {
  role: AreaRole;
  members: AreaMemberResponse[];
  isViewMode: boolean;
  isDroppable: boolean;
  disabled: boolean;
  onRemoveMember: (m: AreaMemberResponse) => void;
  onChangeMemberRole: (m: AreaMemberResponse, r: AreaRole) => void;
}

export const RoleGroupSection: React.FC<RoleGroupSectionProps> = ({
  role,
  members,
  isViewMode,
  isDroppable,
  disabled,
  onRemoveMember,
  onChangeMemberRole,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: role,
    disabled: !isDroppable || isViewMode,
  });
  const label = AREA_ROLE_LABELS[role] ?? role;
  const showDroppable = isDroppable && !isViewMode;

  return (
    <div className={css.roleGroupWrapper}>
      <div className={formCss.readonlyMetaLabelSmall}>{label}</div>
      <ul
        ref={showDroppable ? setNodeRef : undefined}
        className={`${css.roleGroupList} ${showDroppable ? css.roleGroupListDroppable : ''} ${isOver ? css.roleGroupListOver : ''}`}
      >
        {members.length === 0 && showDroppable ? (
          <li className={formCss.readonlyMetaPlaceholder}>
            Перетащите сюда для роли «{label}»
          </li>
        ) : (
          members.map(m =>
            m.role === 'Owner' || isViewMode ? (
              <StaticMemberCard key={m.userId} member={m} />
            ) : (
              <DraggableMemberCard
                key={m.userId}
                member={m}
                disabled={disabled}
                onRemove={() => onRemoveMember(m)}
              />
            )
          )
        )}
      </ul>
    </div>
  );
};
