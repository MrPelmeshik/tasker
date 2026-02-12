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
import { areaApi } from '../../services/api/areas';
import css from '../../styles/modal.module.css';
import formCss from '../../styles/modal-form.module.css';
import type { AreaResponse, AreaCreateRequest, AreaUpdateRequest, AreaMemberResponse, AreaRole } from '../../types';
import type { ModalSize } from '../../types/modal-size';

/** Подписи ролей для отображения */
const ROLE_LABELS: Record<string, string> = {
  Owner: 'Владелец',
  Administrator: 'Администратор',
  Executor: 'Исполнитель',
  Observer: 'Наблюдатель',
};

/** Роли, которые можно назначить при добавлении (без Owner) */
const ADDABLE_ROLES: Array<{ value: AreaRole; label: string }> = [
  { value: 'Administrator', label: 'Администратор' },
  { value: 'Executor', label: 'Исполнитель' },
  { value: 'Observer', label: 'Наблюдатель' },
];

/// Форматирование ISO-даты в формат дд.мм.гг чч:мм
function formatDateTime(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = String(d.getFullYear()).slice(-2);
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}.${mm}.${yy} ${hh}:${min}`;
}

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
  const [formData, setFormData] = useState<AreaCreateRequest>({
    title: '',
    description: '',
  });
  const [originalData, setOriginalData] = useState<AreaCreateRequest>({
    title: '',
    description: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [fieldChanges, setFieldChanges] = useState<Record<string, boolean>>({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  /** Подтверждение возврата к просмотру при несохранённых изменениях */
  const [showReturnToViewConfirm, setShowReturnToViewConfirm] = useState(false);
  /** Подтверждение удаления записи */
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  /** Режим просмотра (false) vs редактирования (true). По умолчанию просмотр для существующей сущности. */
  const [isEditMode, setIsEditMode] = useState(true);
  /** Участники области */
  const [members, setMembers] = useState<AreaMemberResponse[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState<string | null>(null);
  /** Форма добавления участника */
  const [addMemberEmail, setAddMemberEmail] = useState('');
  const [addMemberRole, setAddMemberRole] = useState<AreaRole>('Executor');
  const [addMemberError, setAddMemberError] = useState<string | null>(null);
  const [addMemberLoading, setAddMemberLoading] = useState(false);
  /** Подтверждение удаления участника */
  const [removeConfirmMember, setRemoveConfirmMember] = useState<AreaMemberResponse | null>(null);

  const areaEvents = useEvents('area', area?.id);

  /** Режим просмотра: только для существующей области и когда не в edit mode */
  const isViewMode = Boolean(area && !isEditMode);

  // Инициализация данных и режима при открытии модального окна
  useEffect(() => {
    if (isOpen) {
      const initialData = area ? {
        title: area.title,
        description: area.description || '',
      } : {
        title: '',
        description: '',
      };
      
      setFormData(initialData);
      setOriginalData(initialData);
      setFieldChanges({});
      /** Создание — сразу edit; существующая область — по умолчанию просмотр */
      setIsEditMode(!area);
      setAddMemberEmail('');
      setAddMemberError(null);
      setRemoveConfirmMember(null);
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

  // Проверка изменений в полях
  const hasChanges = Object.values(fieldChanges).some(hasChange => hasChange);
  const hasUnsavedChanges = hasChanges;

  const handleFieldChange = (field: keyof AreaCreateRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Проверяем, изменилось ли поле относительно оригинального значения
    const hasChanged = value !== originalData[field];
    setFieldChanges(prev => ({ ...prev, [field]: hasChanged }));
  };

  const handleResetField = (field: keyof AreaCreateRequest) => {
    const originalValue = originalData[field];
    setFormData(prev => ({ ...prev, [field]: originalValue }));
    setFieldChanges(prev => ({ ...prev, [field]: false }));
  };

  const handleSave = async () => {
    if (!formData.title.trim()) return;
    
    setIsLoading(true);
    try {
      // Добавляем ID для режима редактирования
      const dataToSave = area ? { ...formData, id: area.id } : formData;
      await onSave(dataToSave);
      onClose();
    } catch (error) {
      console.error('Ошибка сохранения области:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      setShowConfirmModal(true);
    } else {
      onClose();
    }
  };

  const handleConfirmSave = async () => {
    setShowConfirmModal(false);
    await handleSave();
  };

  const handleConfirmDiscard = () => {
    setShowConfirmModal(false);
    onClose();
  };

  const handleConfirmCancel = () => {
    setShowConfirmModal(false);
  };

  /** Возврат к режиму просмотра (только для существующей области) */
  const handleReturnToView = () => {
    if (hasUnsavedChanges) {
      setShowReturnToViewConfirm(true);
    } else {
      setIsEditMode(false);
    }
  };

  const handleConfirmReturnToView = () => {
    setShowReturnToViewConfirm(false);
    setFormData(originalData);
    setFieldChanges({});
    setIsEditMode(false);
  };

  /** Запрос на удаление — показать подтверждение */
  const handleDeleteRequest = () => {
    setShowDeleteConfirm(true);
  };

  /** Подтверждённое удаление */
  const handleConfirmDelete = async () => {
    if (!area?.id || !onDelete) return;
    setShowDeleteConfirm(false);
    setIsLoading(true);
    try {
      await onDelete(area.id);
      onClose();
    } catch (error) {
      console.error('Ошибка удаления области:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /** Добавить участника по email */
  const handleAddMember = async () => {
    const email = addMemberEmail.trim();
    if (!email || !area?.id) return;
    setAddMemberError(null);
    setAddMemberLoading(true);
    try {
      await areaApi.addMember(area.id, { email, role: addMemberRole });
      setAddMemberEmail('');
      const updated = await areaApi.getMembers(area.id);
      setMembers(updated);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Ошибка добавления участника';
      setAddMemberError(msg);
    } finally {
      setAddMemberLoading(false);
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
                          <span className={formCss.readonlyMetaLabel}>{ROLE_LABELS[m.role] ?? m.role}</span>
                          {!isViewMode && m.role !== 'Owner' && (
                            <GlassButton
                              variant="subtle"
                              size="xxs"
                              onClick={() => setRemoveConfirmMember(m)}
                              disabled={addMemberLoading}
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
                            value={addMemberEmail}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              setAddMemberEmail(e.target.value);
                              setAddMemberError(null);
                            }}
                            placeholder="Email участника"
                            disabled={addMemberLoading}
                            fullWidth
                            type="email"
                          />
                          <GlassSelect
                            value={addMemberRole}
                            onChange={(v) => setAddMemberRole(v as AreaRole)}
                            options={ADDABLE_ROLES}
                            disabled={addMemberLoading}
                            placeholder="Роль"
                          />
                          <GlassButton
                            variant="primary"
                            size="xs"
                            onClick={handleAddMember}
                            disabled={!addMemberEmail.trim() || addMemberLoading}
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
        title="Несохраненные изменения"
        message="У вас есть несохраненные изменения. Что вы хотите сделать?"
        confirmText="Сохранить"
        cancelText="Отмена"
        discardText="Не сохранять"
        showDiscard={true}
      />
      <ConfirmModal
        isOpen={showReturnToViewConfirm}
        onClose={() => setShowReturnToViewConfirm(false)}
        onConfirm={handleConfirmReturnToView}
        onCancel={() => setShowReturnToViewConfirm(false)}
        title="Вернуться к просмотру"
        message="Есть несохранённые изменения. Вернуться к просмотру без сохранения?"
        confirmText="Да"
        cancelText="Нет"
      />
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        title="Удалить область"
        message="Вы уверены, что хотите удалить эту область? Запись будет деактивирована и скрыта из списков."
        confirmText="Удалить"
        cancelText="Отмена"
        variant="danger"
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
