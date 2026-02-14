import React from 'react';
import { GlassInput, ModalCancelButton, ModalSaveButton, ModalEditButton } from '../ui';
import cabinetCss from './cabinet.module.css';
import formCss from '../../styles/modal-form.module.css';
import type { UserInfo } from '../../types';

/**
 * Блок профиля: аватар + поля в режиме просмотра или редактирования.
 */
export interface ProfileSectionProps {
  user: UserInfo | null;
  isEditMode: boolean;
  editUsername: string;
  editEmail: string;
  editFirstName: string;
  editLastName: string;
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
  saveError: string | null;
  saving: boolean;
  onEditUsernameChange: (v: string) => void;
  onEditEmailChange: (v: string) => void;
  onEditFirstNameChange: (v: string) => void;
  onEditLastNameChange: (v: string) => void;
  onCurrentPasswordChange: (v: string) => void;
  onNewPasswordChange: (v: string) => void;
  onConfirmNewPasswordChange: (v: string) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: () => void;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  user,
  isEditMode,
  editUsername,
  editEmail,
  editFirstName,
  editLastName,
  currentPassword,
  newPassword,
  confirmNewPassword,
  saveError,
  saving,
  onEditUsernameChange,
  onEditEmailChange,
  onEditFirstNameChange,
  onEditLastNameChange,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onConfirmNewPasswordChange,
  onStartEdit,
  onCancelEdit,
  onSave,
}) => (
  <section className={cabinetCss.section}>
    <div className={cabinetCss.sectionHeader}>
      <h4 className={cabinetCss.sectionTitle}>Профиль</h4>
      <div className={cabinetCss.sectionHeaderActions}>
        {isEditMode ? (
          <>
            <ModalCancelButton onClick={onCancelEdit} disabled={saving} />
            <ModalSaveButton onClick={onSave} disabled={saving} />
          </>
        ) : user ? (
          <ModalEditButton onClick={onStartEdit} />
        ) : null}
      </div>
    </div>
    <div className={cabinetCss.profileBlock}>
      <div className={cabinetCss.avatar} aria-hidden />
      <div className={cabinetCss.profileFields}>
        {user && (
          <>
            {isEditMode ? (
              <>
                <GlassInput
                  fullWidth
                  size="m"
                  label="Логин"
                  value={editUsername}
                  onChange={(e) => onEditUsernameChange(e.target.value)}
                  placeholder="Логин"
                />
                <GlassInput
                  fullWidth
                  size="m"
                  label="Email"
                  value={editEmail}
                  onChange={(e) => onEditEmailChange(e.target.value)}
                  placeholder="Email"
                />
                <GlassInput
                  fullWidth
                  size="m"
                  label="Имя"
                  value={editFirstName}
                  onChange={(e) => onEditFirstNameChange(e.target.value)}
                  placeholder="Имя"
                />
                <GlassInput
                  fullWidth
                  size="m"
                  label="Фамилия"
                  value={editLastName}
                  onChange={(e) => onEditLastNameChange(e.target.value)}
                  placeholder="Фамилия"
                />
                <GlassInput
                  fullWidth
                  size="m"
                  type="password"
                  label="Текущий пароль (для смены)"
                  value={currentPassword}
                  onChange={(e) => onCurrentPasswordChange(e.target.value)}
                  placeholder="Текущий пароль"
                />
                <GlassInput
                  fullWidth
                  size="m"
                  type="password"
                  label="Новый пароль"
                  value={newPassword}
                  onChange={(e) => onNewPasswordChange(e.target.value)}
                  placeholder="Минимум 8 символов"
                />
                <GlassInput
                  fullWidth
                  size="m"
                  type="password"
                  label="Подтвердите новый пароль"
                  value={confirmNewPassword}
                  onChange={(e) => onConfirmNewPasswordChange(e.target.value)}
                  placeholder="Повторите пароль"
                />
                {saveError && (
                  <div className={`${formCss.fieldValueReadonly} ${formCss.fieldValueReadonlyError}`}>
                    {saveError}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className={cabinetCss.profileRow}>
                  <span className={cabinetCss.profileLabel}>Логин</span>
                  <span className={cabinetCss.profileValue}>{user.username || '—'}</span>
                </div>
                <div className={cabinetCss.profileRow}>
                  <span className={cabinetCss.profileLabel}>Email</span>
                  <span className={cabinetCss.profileValue}>{user.email || '—'}</span>
                </div>
                <div className={cabinetCss.profileRow}>
                  <span className={cabinetCss.profileLabel}>Имя</span>
                  <span className={cabinetCss.profileValue}>{user.firstName || '—'}</span>
                </div>
                <div className={cabinetCss.profileRow}>
                  <span className={cabinetCss.profileLabel}>Фамилия</span>
                  <span className={cabinetCss.profileValue}>{user.lastName || '—'}</span>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  </section>
);
