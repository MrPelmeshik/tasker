/**
 * Секция «Участники» в модалке области: заголовок, состояние загрузки/ошибки и список по ролям.
 */

import React from 'react';
import { Loader } from '../../ui';
import { ParticipantsByRole } from './ParticipantsByRole';
import formCss from '../../../styles/modal-form.module.css';
import type { AreaMemberResponse, AreaRole } from '../../../types';

export interface AreaModalMembersSectionProps {
  /** Участники для отображения (с учётом pending добавлений/удалений и смены ролей) */
  displayMembers: AreaMemberResponse[];
  /** Режим только просмотра (без добавления/изменения ролей/удаления) */
  isViewMode: boolean;
  /** Идёт загрузка списка участников */
  membersLoading: boolean;
  /** Сообщение об ошибке загрузки участников */
  membersError: string | null;
  /** Идёт сохранение формы (блокирует кнопку добавления) */
  addMemberLoading: boolean;
  addMemberLogin: string;
  addMemberRole: AreaRole;
  addMemberError: string | null;
  onAddMemberLoginChange: (value: string) => void;
  onAddMemberRoleChange: (role: AreaRole) => void;
  onAddMember: () => void | Promise<void>;
  onChangeMemberRole: (member: AreaMemberResponse, role: AreaRole) => void;
  onRemoveMember: (member: AreaMemberResponse) => void;
}

export const AreaModalMembersSection: React.FC<AreaModalMembersSectionProps> = ({
  displayMembers,
  isViewMode,
  membersLoading,
  membersError,
  addMemberLoading,
  addMemberLogin,
  addMemberRole,
  addMemberError,
  onAddMemberLoginChange,
  onAddMemberRoleChange,
  onAddMember,
  onChangeMemberRole,
  onRemoveMember,
}) => (
  <div className={formCss.fieldGroup}>
    <div className={formCss.fieldHeader}>
      <label className={formCss.fieldLabel}>Участники</label>
    </div>
    {membersLoading ? (
      <div className={formCss.fieldValueReadonly}>
        <Loader size="s" ariaLabel="Загрузка" />
      </div>
    ) : membersError ? (
      <div className={`${formCss.fieldValueReadonly} ${formCss.fieldValueReadonlyError}`}>
        {membersError}
      </div>
    ) : (
      <ParticipantsByRole
        members={displayMembers}
        isViewMode={isViewMode}
        addMemberLoading={addMemberLoading}
        addMemberLogin={addMemberLogin}
        addMemberRole={addMemberRole}
        addMemberError={addMemberError}
        onAddMemberLoginChange={onAddMemberLoginChange}
        onAddMemberRoleChange={onAddMemberRoleChange}
        onAddMember={onAddMember}
        onChangeMemberRole={onChangeMemberRole}
        onRemoveMember={onRemoveMember}
      />
    )}
  </div>
);
