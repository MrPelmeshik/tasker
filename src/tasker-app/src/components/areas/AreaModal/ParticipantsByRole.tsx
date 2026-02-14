import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { Z_INDEX_DND_OVERLAY } from '../../../config/constants';
import formCss from '../../../styles/modal-form.module.css';
import css from './area-modal.members.module.css';
import { AREA_ROLES_ORDERED, DROPPABLE_ROLES } from '../../../utils/area-role';
import { RoleGroupSection } from './RoleGroupSection';
import { MemberCardOverlay } from './MemberCardOverlay';
import { AddMemberForm } from './AddMemberForm';
import type { AreaMemberResponse, AreaRole } from '../../../types';

/**
 * Блок участников с группировкой по ролям и DnD.
 */
export interface ParticipantsByRoleProps {
  members: AreaMemberResponse[];
  isViewMode: boolean;
  addMemberLoading: boolean;
  addMemberLogin: string;
  addMemberRole: AreaRole;
  addMemberError: string | null;
  onAddMemberLoginChange: (v: string) => void;
  onAddMemberRoleChange: (v: AreaRole) => void;
  onAddMember: () => void | Promise<void>;
  onChangeMemberRole: (m: AreaMemberResponse, r: AreaRole) => void;
  onRemoveMember: (m: AreaMemberResponse) => void;
}

export const ParticipantsByRole: React.FC<ParticipantsByRoleProps> = ({
  members,
  isViewMode,
  addMemberLoading,
  addMemberLogin,
  addMemberRole,
  addMemberError,
  onAddMemberLoginChange,
  onAddMemberRoleChange,
  onAddMember,
  onChangeMemberRole,
  onRemoveMember,
}) => {
  const [activeMember, setActiveMember] = useState<AreaMemberResponse | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const member = event.active.data?.current?.member as AreaMemberResponse | undefined;
    if (member) setActiveMember(member);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveMember(null);
    if (!over) return;
    if (over.id === active.id) return;
    const member = active.data?.current?.member as AreaMemberResponse | undefined;
    if (!member || member.role === 'Owner') return;
    let newRole: AreaRole | null = null;
    const overId = String(over.id);
    if (DROPPABLE_ROLES.includes(overId as AreaRole)) {
      newRole = overId as AreaRole;
    } else {
      const targetMember = over.data?.current?.member as AreaMemberResponse | undefined;
      if (targetMember) newRole = targetMember.role;
    }
    if (!newRole || !DROPPABLE_ROLES.includes(newRole) || member.role === newRole) return;
    onChangeMemberRole(member, newRole);
  };

  const membersByRole = useMemo((): Record<AreaRole, AreaMemberResponse[]> => {
    const map: Record<AreaRole, AreaMemberResponse[]> = {
      Owner: [],
      Administrator: [],
      Executor: [],
      Observer: [],
    };
    for (const m of members) {
      const r = m.role as AreaRole;
      if (map[r]) map[r].push(m);
    }
    return map;
  }, [members]);

  const disabled = addMemberLoading;

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveMember(null)}
      >
        <div
          className={`${formCss.readonlyMeta} ${!isViewMode ? formCss.readonlyMetaEditable : ''} ${css.readonlyMetaWithParticipants}`}
        >
          {AREA_ROLES_ORDERED.map((role: AreaRole) => (
              <RoleGroupSection
                key={role}
                role={role}
                members={membersByRole[role] ?? []}
                isViewMode={isViewMode}
                isDroppable={DROPPABLE_ROLES.includes(role)}
                disabled={disabled}
                onRemoveMember={onRemoveMember}
                onChangeMemberRole={onChangeMemberRole}
              />
            ))}
        </div>
        {createPortal(
          <DragOverlay zIndex={Z_INDEX_DND_OVERLAY} className="cursor-grabbing">
            {activeMember ? <MemberCardOverlay member={activeMember} /> : null}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
      {!isViewMode && (
        <AddMemberForm
          login={addMemberLogin}
          role={addMemberRole}
          error={addMemberError}
          disabled={addMemberLoading}
          onLoginChange={(v) => {
            onAddMemberLoginChange(v);
          }}
          onRoleChange={(v) => onAddMemberRoleChange(v)}
          onAdd={onAddMember}
        />
      )}
    </>
  );
};
