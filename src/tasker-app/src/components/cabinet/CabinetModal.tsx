import React, { useEffect, useState, useRef } from 'react';
import { Modal } from '../common/Modal';
import { GlassInput, Loader, ModalCloseButton, ModalCancelButton, ModalSaveButton, ModalEditButton } from '../ui';
import { useToast } from '../../context/ToastContext';
import { parseApiErrorMessage } from '../../utils/parse-api-error';
import { getCurrentUser, updateProfile } from '../../services/api/auth';
import { areaApi } from '../../services/api/areas';
import css from '../../styles/modal.module.css';
import cabinetCss from './cabinet.module.css';
import formCss from '../../styles/modal-form.module.css';
import { AREA_ROLE_LABELS } from '../../utils/area-role';
import type { UserInfo, AreaResponse, AreaRole } from '../../types';

type AreaWithRole = { area: AreaResponse; role: AreaRole | null };

export interface CabinetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CabinetModal: React.FC<CabinetModalProps> = ({ isOpen, onClose }) => {
  const { addError } = useToast();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [areasWithRoles, setAreasWithRoles] = useState<AreaWithRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    if (!isOpen) return;

    const ctrl = new AbortController();
    const signal = ctrl.signal;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setIsEditMode(false);

    const load = async () => {
      try {
        const [userRes, areasData] = await Promise.all([
          getCurrentUser({ signal }),
          areaApi.getAll({ signal }),
        ]);

        if (cancelled) return;

        if (userRes.success && userRes.data) {
          const userData = userRes.data;
          setUser(userData);
          setEditUsername(userData.username || '');
          setEditEmail(userData.email || '');
          setEditFirstName(userData.firstName || '');
          setEditLastName(userData.lastName || '');
          setCurrentPassword('');
          setNewPassword('');
          setConfirmNewPassword('');

          const areas = Array.isArray(areasData) ? areasData.filter((a: AreaResponse) => a.isActive) : [];
          const membersPromises = areas.map((a: AreaResponse) => areaApi.getMembers(a.id, { signal }));
          const membersResults = await Promise.all(membersPromises);

          if (cancelled) return;

          const withRoles: AreaWithRole[] = areas.map((area: AreaResponse, i: number) => {
            const members = membersResults[i] ?? [];
            const myMember = members.find((m: { userId: string }) => m.userId === userData.id);
            return {
              area,
              role: myMember?.role ?? null,
            };
          });
          setAreasWithRoles(withRoles);
        } else {
          const msg = userRes.message || 'Ошибка загрузки профиля';
          setError(msg);
          addError(msg);
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : 'Ошибка загрузки';
          setError(msg);
          addError(parseApiErrorMessage(err));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
      ctrl.abort();
    };
  }, [isOpen, addError]);

  const handleStartEdit = () => {
    setSaveError(null);
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    if (user) {
      setEditUsername(user.username || '');
      setEditEmail(user.email || '');
      setEditFirstName(user.firstName || '');
      setEditLastName(user.lastName || '');
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setSaveError(null);
    setIsEditMode(false);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    const newPwd = newPassword.trim();
    const confirmPwd = confirmNewPassword.trim();
    if (newPwd && newPwd !== confirmPwd) {
      setSaveError('Пароли не совпадают');
      return;
    }
    if (newPwd && newPwd.length < 8) {
      setSaveError('Пароль должен содержать минимум 8 символов');
      return;
    }
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setSaving(true);
    setSaveError(null);
    try {
      const payload: Parameters<typeof updateProfile>[0] = {
        username: editUsername.trim() || undefined,
        email: editEmail.trim() || undefined,
        firstName: editFirstName.trim() || undefined,
        lastName: editLastName.trim() || undefined,
      };
      if (newPwd) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPwd;
      }
      const res = await updateProfile(payload);
      if (res.success && res.data) {
        setUser(res.data);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        setIsEditMode(false);
      } else {
        const msg = res.message || 'Ошибка сохранения';
        setSaveError(msg);
        addError(msg);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Ошибка сохранения';
      setSaveError(msg);
      addError(parseApiErrorMessage(err));
    } finally {
      isSubmittingRef.current = false;
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="medium">
      <div className={css.modalContent}>
        <div className={css.modalHeader}>
          <h3 className={css.modalTitle}>Личный кабинет</h3>
          <div className={css.modalActions}>
            <ModalCloseButton onClick={onClose} />
          </div>
        </div>

        <div className={css.modalBody}>
          {loading ? (
            <div className={cabinetCss.loading}><Loader size="m" centered ariaLabel="Загрузка" /></div>
          ) : error ? (
            <div className={cabinetCss.loading} style={{ color: 'var(--color-error)' }}>{error}</div>
          ) : (
            <>
              <section className={cabinetCss.section}>
                <div className={cabinetCss.sectionHeader}>
                  <h4 className={cabinetCss.sectionTitle}>Профиль</h4>
                  <div className={cabinetCss.sectionHeaderActions}>
                    {isEditMode ? (
                      <>
                        <ModalCancelButton onClick={handleCancelEdit} disabled={saving} />
                        <ModalSaveButton onClick={handleSaveProfile} disabled={saving} />
                      </>
                    ) : user ? (
                      <ModalEditButton onClick={handleStartEdit} />
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
                              onChange={e => setEditUsername(e.target.value)}
                              placeholder="Логин"
                            />
                            <GlassInput
                              fullWidth
                              size="m"
                              label="Email"
                              value={editEmail}
                              onChange={e => setEditEmail(e.target.value)}
                              placeholder="Email"
                            />
                            <GlassInput
                              fullWidth
                              size="m"
                              label="Имя"
                              value={editFirstName}
                              onChange={e => setEditFirstName(e.target.value)}
                              placeholder="Имя"
                            />
                            <GlassInput
                              fullWidth
                              size="m"
                              label="Фамилия"
                              value={editLastName}
                              onChange={e => setEditLastName(e.target.value)}
                              placeholder="Фамилия"
                            />
                            <GlassInput
                              fullWidth
                              size="m"
                              type="password"
                              label="Текущий пароль (для смены)"
                              value={currentPassword}
                              onChange={e => setCurrentPassword(e.target.value)}
                              placeholder="Текущий пароль"
                            />
                            <GlassInput
                              fullWidth
                              size="m"
                              type="password"
                              label="Новый пароль"
                              value={newPassword}
                              onChange={e => setNewPassword(e.target.value)}
                              placeholder="Минимум 8 символов"
                            />
                            <GlassInput
                              fullWidth
                              size="m"
                              type="password"
                              label="Подтвердите новый пароль"
                              value={confirmNewPassword}
                              onChange={e => setConfirmNewPassword(e.target.value)}
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

              <section className={cabinetCss.section}>
                <h4 className={cabinetCss.sectionTitle}>Мои области</h4>
                {areasWithRoles.length === 0 ? (
                  <div className={cabinetCss.areaEmpty}>Нет доступных областей</div>
                ) : (
                  <ul className={cabinetCss.areasList}>
                    {areasWithRoles.map(({ area, role }) => (
                      <li key={area.id} className={cabinetCss.areaItem}>
                        <span className={cabinetCss.areaTitle}>{area.title}</span>
                        {role && (
                          <span className={cabinetCss.areaRole}>{AREA_ROLE_LABELS[role] ?? role}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};
