import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { ConfirmModal } from '../common/ConfirmModal';
import { GlassButton } from '../ui/GlassButton';
import { GlassInput } from '../ui/GlassInput';
import { GlassTextarea } from '../ui/GlassTextarea';
import { GlassSelect } from '../ui/GlassSelect';
import { XIcon } from '../icons/XIcon';
import { SaveIcon } from '../icons/SaveIcon';
import { ResetIcon } from '../icons/ResetIcon';
import { EditIcon } from '../icons/EditIcon';
import { DeleteIcon } from '../icons/DeleteIcon';
import { PlusIcon } from '../icons/PlusIcon';
import { ActivityList } from '../activities/ActivityList';
import { useEvents } from '../activities/useEvents';
import { useEntityFormModal } from '../../hooks';
import { areaApi } from '../../services/api/areas';
import { CONFIRM_UNSAVED_CHANGES, CONFIRM_RETURN_TO_VIEW, getConfirmDeleteConfig } from '../../constants/confirm-modals';
import css from '../../styles/modal.module.css';
import formCss from '../../styles/modal-form.module.css';
import { formatDateTime } from '../../utils/date';
import { AREA_ROLE_LABELS, getAddableRoles } from '../../utils/area-role';
import type { AreaResponse, AreaCreateRequest, AreaUpdateRequest, AreaMemberResponse, AreaRole } from '../../types';
import type { ModalSize } from '../../types/modal-size';

export interface AreaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AreaCreateRequest | AreaUpdateRequest) => Promise<void>;
  /** Колбэк при удалении записи (мягкое удаление) */
  onDelete?: (id: string) => Promise<void>;
  area?: AreaResponse | null; // null для создания новой области
  title?: string;
  size?: ModalSize;
}

export const AreaModal: React.FC<AreaModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  area = null,
  title = 'Область',
  size = 'medium',
}) => {
  const modal = useEntityFormModal<AreaCreateRequest>({
    isOpen,
    entity: area,
    getInitialData: () =>
      area
        ? { title: area.title, description: area.description || '' }
        : { title: '', description: '' },
    deps: [area],
    onClose,
    onSave: (data) => onSave((area ? { ...data, id: area.id } : data) as AreaCreateRequest | AreaUpdateRequest),
    onDelete,
    validate: (data) => Boolean(data.title?.trim()),
  });

  const {
    formData,
    fieldChanges,
    handleFieldChange,
    handleResetField,
    hasChanges,
    hasUnsavedChanges,
    showConfirmModal,
    showReturnToViewConfirm,
    showDeleteConfirm,
    handleClose,
    handleConfirmSave,
    handleConfirmDiscard,
    handleConfirmCancel,
    handleReturnToView,
    handleConfirmReturnToView,
    handleDeleteRequest,
    handleConfirmDelete,
    dismissReturnToViewConfirm,
    dismissDeleteConfirm,
    handleSave,
    isEditMode,
    setIsEditMode,
    isLoading,
  } = modal;

  /** Участники области */
  const [members, setMembers] = useState<AreaMemberResponse[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState<string | null>(null);
  /** Форма добавления участника */
  const [addMemberLogin, setAddMemberLogin] = useState('');
  const [addMemberRole, setAddMemberRole] = useState<AreaRole>('Executor');
  const [addMemberError, setAddMemberError] = useState<string | null>(null);
  const [addMemberLoading, setAddMemberLoading] = useState(false);
  /** Подтверждение удаления участника */
  const [removeConfirmMember, setRemoveConfirmMember] = useState<AreaMemberResponse | null>(null);
  /** ID участника, у которого меняется роль (для индикатора загрузки) */
  const [updatingMemberId, setUpdatingMemberId] = useState<string | null>(null);

  const areaEvents = useEvents('area', area?.id);
  const isViewMode = Boolean(area && !isEditMode);

  // Сброс доп. состояния при открытии
  useEffect(() => {
    if (isOpen) {
      setAddMemberLogin('');
      setAddMemberError(null);
      setRemoveConfirmMember(null);
      setUpdatingMemberId(null);
    }
  }, [isOpen, area]);

  // Загрузка участников при открытии модального окна для существующей области
  useEffect(() => {
    if (!isOpen || !area?.id) {
      setMembers([]);
      return;
    }
    let cancelled = false;
    setMembersLoading(true);
    setMembersError(null);
    areaApi.getMembers(area.id)
      .then(data => {
        if (!cancelled) {
          setMembers(data);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setMembersError(err instanceof Error ? err.message : 'Ошибка загрузки участников');
        }
      })
      .finally(() => {
        if (!cancelled) setMembersLoading(false);
      });
    return () => { cancelled = true; };
  }, [isOpen, area?.id]);

  /** Добавить участника по логину */
  const handleAddMember = async () => {
    const login = addMemberLogin.trim();
    if (!login || !area?.id) return;
    setAddMemberError(null);

    if (members.some(m => m.userName === login)) {
      setAddMemberError('Этот пользователь уже в области. Измените роль в списке участников.');
      return;
    }

    setAddMemberLoading(true);
    try {
      await areaApi.addMember(area.id, { login, role: addMemberRole });
      setAddMemberLogin('');
      const updated = await areaApi.getMembers(area.id);
      setMembers(updated);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Ошибка добавления участника';
      setAddMemberError(msg);
    } finally {
      setAddMemberLoading(false);
    }
  };

  /** Изменить роль участника области */
  const handleChangeMemberRole = async (member: AreaMemberResponse, newRole: AreaRole) => {
    if (!area?.id || member.role === 'Owner' || member.role === newRole) return;
    setUpdatingMemberId(member.userId);
    setAddMemberError(null);
    try {
      await areaApi.addMember(area.id, { userId: member.userId, role: newRole });
      const updated = await areaApi.getMembers(area.id);
      setMembers(updated);
    } catch (err) {
      setAddMemberError(err instanceof Error ? err.message : 'Ошибка изменения роли');
    } finally {
      setUpdatingMemberId(null);
    }
  };

  /** Подтвердить удаление участника */
  const handleConfirmRemoveMember = async () => {
    const m = removeConfirmMember;
    if (!m || !area?.id) return;
    setRemoveConfirmMember(null);
    setAddMemberLoading(true);
    try {
      await areaApi.removeMember(area.id, m.userId);
      setMembers(prev => prev.filter(x => x.userId !== m.userId));
    } catch (err) {
      setAddMemberError(err instanceof Error ? err.message : 'Ошибка удаления участника');
    } finally {
      setAddMemberLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      hasUnsavedChanges={hasUnsavedChanges}
      size={size}
    >
      <div className={css.modalContent}>
        <div className={css.modalHeader}>
          <h3 className={css.modalTitle}>
            {isViewMode ? 'Область' : area ? 'Редактирование области' : 'Создание области'}
          </h3>
          <div className={css.modalActions}>
            <GlassButton
              variant="subtle"
              size="xs"
              onClick={handleClose}
              disabled={isLoading}
            >
              <XIcon />
            </GlassButton>
            {isViewMode ? (
              <>
                <GlassButton
                  variant="primary"
                  size="xs"
                  onClick={() => setIsEditMode(true)}
                  disabled={isLoading}
                >
                  <EditIcon />
                </GlassButton>
                {area && onDelete && (
                  <GlassButton
                    variant="danger"
                    size="xs"
                    onClick={handleDeleteRequest}
                    disabled={isLoading}
                  >
                    <DeleteIcon />
                  </GlassButton>
                )}
              </>
            ) : (
              <>
                {area && (
                  <GlassButton
                    variant="subtle"
                    size="xs"
                    onClick={handleReturnToView}
                    disabled={isLoading}
                  >
                    Отмена
                  </GlassButton>
                )}
                <GlassButton
                  variant="primary"
                  size="xs"
                  onClick={handleSave}
                  disabled={!hasChanges || !formData.title.trim() || isLoading}
                >
                  <SaveIcon />
                </GlassButton>
                {area && onDelete && (
                  <GlassButton
                    variant="danger"
                    size="xs"
                    onClick={handleDeleteRequest}
                    disabled={isLoading}
                  >
                    <DeleteIcon />
                  </GlassButton>
                )}
              </>
            )}
          </div>
        </div>
        
        <div className={css.modalBody}>
          <div className={formCss.formContainer}>
            {/* Поле названия */}
            <div className={formCss.fieldGroup}>
              <div className={formCss.fieldHeader}>
                <label className={formCss.fieldLabel}>
                  Название области *
                </label>
                {!isViewMode && fieldChanges.title && (
                  <GlassButton
                    variant="subtle"
                    size="xxs"
                    onClick={() => handleResetField('title')}
                    className={formCss.resetButton}
                  >
                    <ResetIcon />
                  </GlassButton>
                )}
              </div>
              <div className={formCss.fieldContainer}>
                {isViewMode ? (
                  <div className={formCss.fieldValueReadonly}>
                    {formData.title || '—'}
                  </div>
                ) : (
                  <GlassInput
                    value={formData.title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('title', e.target.value)}
                    placeholder="Введите название области"
                    disabled={isLoading}
                    fullWidth
                  />
                )}
              </div>
            </div>

            {/* Поле описания */}
            <div className={formCss.fieldGroup}>
              <div className={formCss.fieldHeader}>
                <label className={formCss.fieldLabel}>
                  Описание
                </label>
                {!isViewMode && fieldChanges.description && (
                  <GlassButton
                    variant="subtle"
                    size="xxs"
                    onClick={() => handleResetField('description')}
                    className={formCss.resetButton}
                  >
                    <ResetIcon />
                  </GlassButton>
                )}
              </div>
              <div className={formCss.fieldContainer}>
                {isViewMode ? (
                  <div className={formCss.fieldValueReadonlyMultiline}>
                    {formData.description || '—'}
                  </div>
                ) : (
                  <GlassTextarea
                    value={formData.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleFieldChange('description', e.target.value)}
                    placeholder="Введите описание области"
                    rows={4}
                    disabled={isLoading}
                    fullWidth
                  />
                )}
              </div>
            </div>

            {/* Метаданные (только в режиме редактирования) */}
            {area && (
              <div className={formCss.readonlyMeta}>
                <div className={formCss.readonlyMetaTitle}>Информация</div>
                {area.ownerUserName && (
                  <div className={formCss.readonlyMetaRow}>
                    <span className={formCss.readonlyMetaLabel}>Владелец</span>
                    <span className={formCss.readonlyMetaValue}>{area.ownerUserName}</span>
                  </div>
                )}
                {area.createdAt && (
                  <div className={formCss.readonlyMetaRow}>
                    <span className={formCss.readonlyMetaLabel}>Дата создания</span>
                    <span className={formCss.readonlyMetaValue}>{formatDateTime(area.createdAt)}</span>
                  </div>
                )}
                {area.updatedAt && (
                  <div className={formCss.readonlyMetaRow}>
                    <span className={formCss.readonlyMetaLabel}>Дата обновления</span>
                    <span className={formCss.readonlyMetaValue}>{formatDateTime(area.updatedAt)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Участники области (только для существующей области) */}
            {area && (
              <div className={formCss.fieldGroup}>
                <div className={formCss.fieldHeader}>
                  <label className={formCss.fieldLabel}>Участники</label>
                </div>
                {membersLoading ? (
                  <div className={formCss.fieldValueReadonly}>Загрузка…</div>
                ) : membersError ? (
                  <div className={formCss.fieldValueReadonly} style={{ color: 'var(--color-error, #e53e3e)' }}>{membersError}</div>
                ) : (
                  <>
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
                      {members.map(m => (
                        <li key={m.userId} className={formCss.readonlyMetaRow} style={{ alignItems: 'center', padding: 'var(--space-8) 0', borderBottom: '1px solid rgb(var(--white) / 0.06)' }}>
                          <span className={formCss.readonlyMetaValue} style={{ flex: 1 }}>{m.userName || '—'}</span>
                          {m.role === 'Owner' ? (
                            <span className={formCss.readonlyMetaLabel}>{AREA_ROLE_LABELS[m.role] ?? m.role}</span>
                          ) : !isViewMode ? (
                            <GlassSelect
                              value={m.role}
                              onChange={(v) => handleChangeMemberRole(m, v as AreaRole)}
                              options={getAddableRoles()}
                              disabled={addMemberLoading || updatingMemberId === m.userId}
                              placeholder="Роль"
                              size="s"
                            />
                          ) : (
                            <span className={formCss.readonlyMetaLabel}>{AREA_ROLE_LABELS[m.role] ?? m.role}</span>
                          )}
                          {!isViewMode && m.role !== 'Owner' && (
                            <GlassButton
                              variant="subtle"
                              size="xxs"
                              onClick={() => setRemoveConfirmMember(m)}
                              disabled={addMemberLoading || updatingMemberId === m.userId}
                            >
                              <DeleteIcon />
                            </GlassButton>
                          )}
                        </li>
                      ))}
                    </ul>
                    {!isViewMode && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)', marginTop: 'var(--space-12)' }}>
                        <div style={{ display: 'flex', gap: 'var(--space-8)', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                          <GlassInput
                            value={addMemberLogin}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              setAddMemberLogin(e.target.value);
                              setAddMemberError(null);
                            }}
                            placeholder="Логин участника"
                            disabled={addMemberLoading}
                            fullWidth
                            type="text"
                          />
                          <GlassSelect
                            value={addMemberRole}
                            onChange={(v) => setAddMemberRole(v as AreaRole)}
                            options={getAddableRoles()}
                            disabled={addMemberLoading}
                            placeholder="Роль"
                          />
                          <GlassButton
                            variant="primary"
                            size="xs"
                            onClick={handleAddMember}
                            disabled={!addMemberLogin.trim() || addMemberLoading}
                          >
                            <PlusIcon /> Добавить
                          </GlassButton>
                        </div>
                        {addMemberError && (
                          <span className={formCss.readonlyMetaLabel} style={{ color: 'var(--color-error, #e53e3e)', fontSize: 'var(--font-12)' }}>{addMemberError}</span>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Цепочка активностей (только в режиме редактирования) */}
            {area && (
              <ActivityList
                events={areaEvents.events}
                loading={areaEvents.loading}
                error={areaEvents.error}
                headerTitle="История активностей"
                showTypeFilter={true}
                defaultExpanded={true}
              />
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={handleConfirmCancel}
        onConfirm={handleConfirmSave}
        onCancel={handleConfirmCancel}
        onDiscard={handleConfirmDiscard}
        {...CONFIRM_UNSAVED_CHANGES}
      />
      <ConfirmModal
        isOpen={showReturnToViewConfirm}
        onClose={dismissReturnToViewConfirm}
        onConfirm={handleConfirmReturnToView}
        onCancel={dismissReturnToViewConfirm}
        {...CONFIRM_RETURN_TO_VIEW}
      />
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={dismissDeleteConfirm}
        onConfirm={handleConfirmDelete}
        onCancel={dismissDeleteConfirm}
        {...getConfirmDeleteConfig('область')}
      />
      <ConfirmModal
        isOpen={Boolean(removeConfirmMember)}
        onClose={() => setRemoveConfirmMember(null)}
        onConfirm={handleConfirmRemoveMember}
        onCancel={() => setRemoveConfirmMember(null)}
        title="Удалить участника"
        message={removeConfirmMember ? `Удалить ${removeConfirmMember.userName || 'участника'} из области?` : ''}
        confirmText="Удалить"
        cancelText="Отмена"
        variant="danger"
      />
    </Modal>
  );
};
