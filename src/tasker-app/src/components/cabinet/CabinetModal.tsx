import React, { useState, useRef, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { SimpleModalHeader } from '../common/SimpleModalHeader';
import { Loader } from '../ui';
import { useToast } from '../../context/ToastContext';
import { updateProfile } from '../../services/api/auth';
import css from '../../styles/modal.module.css';
import cabinetCss from './cabinet.module.css';
import { ProfileSection } from './ProfileSection';
import { AreasSection } from './AreasSection';
import { useCabinetData } from './useCabinetData';

export interface CabinetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CabinetModal: React.FC<CabinetModalProps> = ({ isOpen, onClose }) => {
  const { showError } = useToast();
  const { user, setUser, areasWithRoles, loading, error } = useCabinetData({ isOpen, showError });

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
    if (isOpen) {
      setIsEditMode(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (user && !isEditMode) {
      setEditUsername(user.username || '');
      setEditEmail(user.email || '');
      setEditFirstName(user.firstName || '');
      setEditLastName(user.lastName || '');
    }
  }, [user, isEditMode]);

  const syncEditFromUser = () => {
    if (user) {
      setEditUsername(user.username || '');
      setEditEmail(user.email || '');
      setEditFirstName(user.firstName || '');
      setEditLastName(user.lastName || '');
    }
  };

  const handleStartEdit = () => {
    setSaveError(null);
    syncEditFromUser();
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    syncEditFromUser();
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
        showError(msg);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Ошибка сохранения';
      setSaveError(msg);
      showError(err);
    } finally {
      isSubmittingRef.current = false;
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="medium">
      <div className={css.modalContent}>
        <SimpleModalHeader title="Личный кабинет" onClose={onClose} />

        <div className={css.modalBody}>
          {loading ? (
            <div className={cabinetCss.loading}><Loader size="m" centered ariaLabel="Загрузка" /></div>
          ) : error ? (
            <div className={`${cabinetCss.loading} text-error`}>{error}</div>
          ) : (
            <>
              <ProfileSection
                user={user}
                isEditMode={isEditMode}
                editUsername={editUsername}
                editEmail={editEmail}
                editFirstName={editFirstName}
                editLastName={editLastName}
                currentPassword={currentPassword}
                newPassword={newPassword}
                confirmNewPassword={confirmNewPassword}
                saveError={saveError}
                saving={saving}
                onEditUsernameChange={setEditUsername}
                onEditEmailChange={setEditEmail}
                onEditFirstNameChange={setEditFirstName}
                onEditLastNameChange={setEditLastName}
                onCurrentPasswordChange={setCurrentPassword}
                onNewPasswordChange={setNewPassword}
                onConfirmNewPasswordChange={setConfirmNewPassword}
                onStartEdit={handleStartEdit}
                onCancelEdit={handleCancelEdit}
                onSave={handleSaveProfile}
              />
              <AreasSection areasWithRoles={areasWithRoles} />
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};
