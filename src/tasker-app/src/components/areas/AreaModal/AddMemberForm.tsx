import React from 'react';
import { GlassButton, GlassInput, GlassSelect } from '../../ui';
import { PlusIcon } from '../../icons/PlusIcon';
import formCss from '../../../styles/modal-form.module.css';
import css from './area-modal.members.module.css';
import { getAddableRoles } from '../../../utils/area-role';
import type { AreaRole } from '../../../types';

/**
 * Форма добавления участника в область (логин + роль + кнопка).
 */
export interface AddMemberFormProps {
  login: string;
  role: AreaRole;
  error: string | null;
  disabled: boolean;
  onLoginChange: (v: string) => void;
  onRoleChange: (v: AreaRole) => void;
  onAdd: () => void;
}

export const AddMemberForm: React.FC<AddMemberFormProps> = ({
  login,
  role,
  error,
  disabled,
  onLoginChange,
  onRoleChange,
  onAdd,
}) => (
  <div className={css.addMemberForm}>
    <div className={css.addMemberRow}>
      <GlassInput
        value={login}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onLoginChange(e.target.value)}
        placeholder="Логин участника"
        disabled={disabled}
        fullWidth
        type="text"
      />
      <GlassSelect
        value={role}
        onChange={(v) => onRoleChange(v as AreaRole)}
        options={getAddableRoles()}
        disabled={disabled}
        placeholder="Роль"
      />
      <GlassButton
        variant="primary"
        size="xs"
        onClick={onAdd}
        disabled={!login.trim() || disabled}
      >
        <PlusIcon /> Добавить
      </GlassButton>
    </div>
    {error && (
      <span className={formCss.readonlyMetaLabelError}>{error}</span>
    )}
  </div>
);
