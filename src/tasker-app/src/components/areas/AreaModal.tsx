import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { Modal } from '../common/Modal';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  GlassButton,
  GlassInput,
  GlassTextarea,
  GlassSelect,
  ModalCloseButton,
  ModalCancelButton,
  ModalSaveButton,
  ModalDeleteButton,
  ModalEditButton,
  ModalResetFieldButton,
} from '../ui';
import { Tooltip } from '../ui/Tooltip';
import { PlusIcon } from '../icons/PlusIcon';
import { LinkIcon } from '../icons/LinkIcon';
import { buildEntityUrl } from '../../utils/entity-links';
import { GripVerticalIcon } from '../icons/GripVerticalIcon';
import { ActivityList } from '../activities/ActivityList';
import { useEvents } from '../activities/useEvents';
import { useEntityFormModal } from '../../hooks';
import { useTaskUpdate } from '../../context';
import { useToast } from '../../context/ToastContext';
import { parseApiErrorMessage } from '../../utils/parse-api-error';
import { areaApi } from '../../services/api/areas';
import { getCurrentUser } from '../../services/api/auth';
import { CONFIRM_UNSAVED_CHANGES, CONFIRM_RETURN_TO_VIEW, getConfirmDeleteConfig } from '../../constants/confirm-modals';
import css from '../../styles/modal.module.css';
import formCss from '../../styles/modal-form.module.css';
import { formatDateTime } from '../../utils/date';
import { AREA_ROLE_LABELS, AREA_ROLES_ORDERED, DROPPABLE_ROLES, getAddableRoles, canEditArea } from '../../utils/area-role';
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

/** Карточка участника с поддержкой перетаскивания (для ролей кроме Owner, только в режиме редактирования) */
interface DraggableMemberCardProps {
  member: AreaMemberResponse;
  disabled: boolean;
  onRemove: () => void;
}

const memberRowStyle: React.CSSProperties = {
  alignItems: 'center',
  padding: 'var(--space-4) 0',
  borderBottom: '1px solid rgb(var(--white) / 0.05)',
};

const DraggableMemberCard: React.FC<DraggableMemberCardProps> = ({ member, disabled, onRemove }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: member.userId,
    data: { member },
  });
  return (
    <li
      ref={setNodeRef}
      className={formCss.readonlyMetaRow}
      style={{
        ...memberRowStyle,
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      <span {...attributes} {...listeners} style={{ cursor: 'grab', padding: 'var(--space-2)', marginRight: 'var(--space-2)', touchAction: 'none' }} aria-label="Перетащить">
        <GripVerticalIcon style={{ width: 14, height: 14, color: 'rgb(var(--white) / 0.45)' }} />
      </span>
      <span className={formCss.readonlyMetaValue} style={{ flex: 1 }}>{member.userName || '—'}</span>
      <ModalDeleteButton size="xxs" onClick={onRemove} disabled={disabled} />
    </li>
  );
};

/** Превью карточки при перетаскивании (для DragOverlay) */
interface MemberCardOverlayProps {
  member: AreaMemberResponse;
}

const MemberCardOverlay: React.FC<MemberCardOverlayProps> = ({ member }) => (
  <li
    className={formCss.readonlyMetaRow}
    style={{
      alignItems: 'center',
      padding: 'var(--space-8) var(--space-12)',
      borderBottom: '1px solid rgb(var(--white) / 0.06)',
      background: 'var(--glass-gradient-bg)',
      borderRadius: 'var(--radius-m)',
      border: '1px solid rgb(var(--white) / 0.12)',
      boxShadow: 'var(--shadow-elev-2)',
      listStyle: 'none',
      minWidth: 200,
      pointerEvents: 'none',
    }}
  >
    <span style={{ padding: 'var(--space-4)', marginRight: 'var(--space-4)' }}>
      <GripVerticalIcon style={{ width: 16, height: 16, color: 'rgb(var(--white) / 0.5)' }} />
    </span>
    <span className={formCss.readonlyMetaValue} style={{ flex: 1 }}>{member.userName || '—'}</span>
    <span className={formCss.readonlyMetaLabel}>{AREA_ROLE_LABELS[member.role] ?? member.role}</span>
  </li>
);

/** Статичная карточка участника (Owner - без перетаскивания и удаления) */
interface StaticMemberCardProps {
  member: AreaMemberResponse;
}

const StaticMemberCard: React.FC<StaticMemberCardProps> = ({ member }) => (
  <li className={formCss.readonlyMetaRow} style={memberRowStyle}>
    <span style={{ width: 22 }} />
    <span className={formCss.readonlyMetaValue} style={{ flex: 1 }}>{member.userName || '—'}</span>
    <span className={formCss.readonlyMetaLabel}>{AREA_ROLE_LABELS[member.role] ?? member.role}</span>
  </li>
);

/** Группа участников по роли с droppable-зоной (для смены роли перетаскиванием) */
interface RoleGroupSectionProps {
  role: AreaRole;
  members: AreaMemberResponse[];
  isViewMode: boolean;
  isDroppable: boolean;
  disabled: boolean;
  onRemoveMember: (m: AreaMemberResponse) => void;
  onChangeMemberRole: (m: AreaMemberResponse, r: AreaRole) => void;
}

const RoleGroupSection: React.FC<RoleGroupSectionProps> = ({
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
  return (
    <div style={{ flexShrink: 0 }}>
      <div className={formCss.readonlyMetaLabelSmall}>{label}</div>
      <ul
        ref={isDroppable && !isViewMode ? setNodeRef : undefined}
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          minHeight: isDroppable && !isViewMode ? 28 : 0,
          borderRadius: 'var(--radius-xs)',
          backgroundColor: isOver ? 'rgb(var(--white) / 0.06)' : undefined,
          transition: 'background-color 150ms ease',
        }}
      >
        {members.length === 0 && isDroppable && !isViewMode ? (
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

/** Блок участников с группировкой по ролям и DnD */
interface ParticipantsByRoleProps {
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

const ParticipantsByRole: React.FC<ParticipantsByRoleProps> = ({
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

  const membersByRole = React.useMemo((): Record<AreaRole, AreaMemberResponse[]> => {
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
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={() => setActiveMember(null)}>
        <div
          className={`${formCss.readonlyMeta} ${!isViewMode ? formCss.readonlyMetaEditable : ''}`}
          style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}
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
          <DragOverlay zIndex={1100} style={{ cursor: 'grabbing' }}>
            {activeMember ? <MemberCardOverlay member={activeMember} /> : null}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
      {!isViewMode && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)', marginTop: 'var(--space-12)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-8)', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <GlassInput
              value={addMemberLogin}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onAddMemberLoginChange(e.target.value)}
              placeholder="Логин участника"
              disabled={addMemberLoading}
              fullWidth
              type="text"
            />
            <GlassSelect
              value={addMemberRole}
              onChange={(v) => onAddMemberRoleChange(v as AreaRole)}
              options={getAddableRoles()}
              disabled={addMemberLoading}
              placeholder="Роль"
            />
            <GlassButton
              variant="primary"
              size="xs"
              onClick={onAddMember}
              disabled={!addMemberLogin.trim() || addMemberLoading}
            >
              <PlusIcon /> Добавить
            </GlassButton>
          </div>
          {addMemberError && (
            <span className={formCss.readonlyMetaLabelError}>{addMemberError}</span>
          )}
        </div>
      )}
    </>
  );
};

export const AreaModal: React.FC<AreaModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  area = null,
  title = 'Область',
  size = 'medium',
}) => {
  const { addError, addSuccess } = useToast();

  const handleCopyLink = () => {
    if (!area?.id) return;
    navigator.clipboard.writeText(buildEntityUrl('area', area.id)).then(
      () => addSuccess('Ссылка скопирована'),
      () => {}
    );
  };
  const [originalMembers, setOriginalMembers] = useState<AreaMemberResponse[]>([]);
  const [pendingRoleChanges, setPendingRoleChanges] = useState<Record<string, AreaRole>>({});
  const [pendingAdds, setPendingAdds] = useState<Array<{ login: string; role: AreaRole }>>([]);
  const [pendingRemoves, setPendingRemoves] = useState<Set<string>>(new Set());

  const modal = useEntityFormModal<AreaCreateRequest>({
    isOpen,
    entity: area,
    getInitialData: () =>
      area
        ? { title: area.title, description: area.description || '' }
        : { title: '', description: '' },
    deps: [area],
    onClose,
    onSave: async (data) => {
      if (area?.id) {
        const hadMemberChanges =
          pendingAdds.length > 0 ||
          pendingRemoves.size > 0 ||
          Object.keys(pendingRoleChanges).length > 0;
        try {
          for (const { login, role } of pendingAdds) {
            const effectiveRole = (pendingRoleChanges[`pending-${login}`] ?? role) as AreaRole;
            await areaApi.addMember(area.id, { login, role: effectiveRole });
          }
          for (const userId of Array.from(pendingRemoves)) {
            await areaApi.removeMember(area.id, userId);
          }
          for (const [userId, role] of Object.entries(pendingRoleChanges)) {
            if (!userId.startsWith('pending-')) {
              await areaApi.addMember(area.id, { userId, role });
            }
          }
          setPendingAdds([]);
          setPendingRemoves(new Set());
          setPendingRoleChanges({});
          const updated = await areaApi.getMembers(area.id);
          setOriginalMembers(updated);
          if (hadMemberChanges) {
            addSuccess('Участники обновлены');
          }
        } catch (err) {
          console.error('AreaModal: ошибка batch-обновления участников', { step: 'members', error: err });
          throw new Error(
            'Не удалось обновить участников. Часть изменений могла примениться. Перезагрузите страницу и проверьте состав области.'
          );
        }
      }
      await onSave((area ? { ...data, id: area.id } : data) as AreaCreateRequest | AreaUpdateRequest);
    },
    onDelete,
    validate: (data) => Boolean(data.title?.trim()),
    getExtraUnsavedChanges: () =>
      Object.keys(pendingRoleChanges).length > 0 ||
      pendingAdds.length > 0 ||
      pendingRemoves.size > 0,
    onReturnToView: () => {
      setPendingRoleChanges({});
      setPendingAdds([]);
      setPendingRemoves(new Set());
    },
    onDiscard: () => {
      setPendingRoleChanges({});
      setPendingAdds([]);
      setPendingRemoves(new Set());
    },
  });

  const {
    formData,
    fieldChanges,
    handleFieldChange,
    handleResetField,
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

  const [membersLoading, setMembersLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [addMemberLogin, setAddMemberLogin] = useState('');
  const [addMemberRole, setAddMemberRole] = useState<AreaRole>('Executor');
  const [addMemberError, setAddMemberError] = useState<string | null>(null);
  const [removeConfirmMember, setRemoveConfirmMember] = useState<AreaMemberResponse | null>(null);

  const areaEvents = useEvents('area', area?.id);
  const { subscribeToTaskUpdates } = useTaskUpdate();
  const [membersRefreshTrigger, setMembersRefreshTrigger] = useState(0);
  const refetchRef = useRef(areaEvents.refetch);
  refetchRef.current = areaEvents.refetch;
  const isViewMode = Boolean(area && !isEditMode);

  useEffect(() => {
    const unsub = subscribeToTaskUpdates((_taskId, _folderId, payload) => {
      if (payload?.areaId === area?.id) {
        refetchRef.current();
        setMembersRefreshTrigger((t) => t + 1);
      }
    });
    return unsub;
  }, [subscribeToTaskUpdates, area?.id]);

  /** Право на редактирование: создание новой области или роль Owner/Administrator */
  const canEdit =
    !area ||
    (!membersLoading &&
      currentUserId != null &&
      originalMembers.some((m) => m.userId === currentUserId && canEditArea(m.role)));

  // Сброс доп. состояния при открытии
  useEffect(() => {
    if (isOpen) {
      setAddMemberLogin('');
      setAddMemberError(null);
      setRemoveConfirmMember(null);
      setPendingRoleChanges({});
      setPendingAdds([]);
      setPendingRemoves(new Set());
    }
  }, [isOpen, area]);

  // Загрузка участников и текущего пользователя при открытии модального окна для существующей области
  useEffect(() => {
    if (!isOpen || !area?.id) {
      setOriginalMembers([]);
      setCurrentUserId(null);
      return;
    }
    let cancelled = false;
    setMembersLoading(true);
    setMembersError(null);
    Promise.all([getCurrentUser(), areaApi.getMembers(area.id)])
      .then(([userRes, membersData]) => {
        if (!cancelled) {
          setCurrentUserId(userRes.success && userRes.data ? userRes.data.id : null);
          setOriginalMembers(membersData);
        }
      })
      .catch(err => {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : 'Ошибка загрузки участников';
          setMembersError(msg);
          addError(parseApiErrorMessage(err));
        }
      })
      .finally(() => {
        if (!cancelled) setMembersLoading(false);
      });
    return () => { cancelled = true; };
  }, [isOpen, area?.id, addError, membersRefreshTrigger]);

  /** Добавить участника (отложенно, применится при сохранении) */
  const handleAddMember = (): void => {
    const login = addMemberLogin.trim();
    if (!login || !area?.id) return;
    setAddMemberError(null);

    if (
      originalMembers.some((m) => m.userName === login) ||
      pendingAdds.some((p) => p.login === login)
    ) {
      setAddMemberError('Этот пользователь уже в области. Измените роль в списке участников.');
      return;
    }

    setPendingAdds((prev) => [...prev, { login, role: addMemberRole }]);
    setAddMemberLogin('');
  };

  /** Локально изменить роль участника (применится при сохранении окна) */
  const handleChangeMemberRole = (member: AreaMemberResponse, newRole: AreaRole) => {
    if (member.role === 'Owner' || member.role === newRole) return;
    setAddMemberError(null);
    setPendingRoleChanges(prev => ({ ...prev, [member.userId]: newRole }));
  };

  /** Участники с учётом pendingAdds, pendingRemoves и pendingRoleChanges (для отображения) */
  const displayMembers = React.useMemo(() => {
    const base = originalMembers
      .filter((m) => !pendingRemoves.has(m.userId))
      .map((m) => ({
        ...m,
        role: (pendingRoleChanges[m.userId] ?? m.role) as AreaRole,
      }));
    const fromPending = pendingAdds.map(({ login, role }) => ({
      userId: `pending-${login}`,
      userName: login,
      role: (pendingRoleChanges[`pending-${login}`] ?? role) as AreaRole,
    }));
    return [...base, ...fromPending];
  }, [originalMembers, pendingRemoves, pendingRoleChanges, pendingAdds]);

  /** Подтвердить удаление участника (отложенно, применится при сохранении) */
  const handleConfirmRemoveMember = () => {
    const m = removeConfirmMember;
    if (!m) return;
    setRemoveConfirmMember(null);

    if (m.userId.startsWith('pending-')) {
      const login = m.userName;
      setPendingAdds((prev) => prev.filter((p) => p.login !== login));
    } else {
      setPendingRemoves((prev) => new Set([...Array.from(prev), m.userId]));
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
            <ModalCloseButton onClick={handleClose} disabled={isLoading} />
            {area?.id && (
              <Tooltip content="Копировать ссылку" placement="bottom">
                <GlassButton variant="subtle" size="xs" onClick={handleCopyLink} disabled={isLoading} aria-label="Копировать ссылку">
                  <LinkIcon />
                </GlassButton>
              </Tooltip>
            )}
            {isViewMode ? (
              <>
                {canEdit && (
                  <ModalEditButton
                    variant="primary"
                    onClick={() => setIsEditMode(true)}
                    disabled={isLoading}
                  />
                )}
                {canEdit && area && onDelete && (
                  <ModalDeleteButton onClick={handleDeleteRequest} disabled={isLoading} />
                )}
              </>
            ) : (
              <>
                {area && (
                  <ModalCancelButton onClick={handleReturnToView} disabled={isLoading} />
                )}
                <ModalSaveButton
                  onClick={handleSave}
                  disabled={!hasUnsavedChanges || !formData.title.trim() || isLoading}
                />
                {area && onDelete && (
                  <ModalDeleteButton onClick={handleDeleteRequest} disabled={isLoading} />
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
                  <ModalResetFieldButton
                    onClick={() => handleResetField('title')}
                    className={formCss.resetButton}
                  />
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
                  <ModalResetFieldButton
                    onClick={() => handleResetField('description')}
                    className={formCss.resetButton}
                  />
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
                  <div className={`${formCss.fieldValueReadonly} ${formCss.fieldValueReadonlyError}`}>{membersError}</div>
                ) : (
                  <ParticipantsByRole
                    members={displayMembers}
                    isViewMode={isViewMode}
                    addMemberLoading={isLoading}
                    addMemberLogin={addMemberLogin}
                    addMemberRole={addMemberRole}
                    addMemberError={addMemberError}
                    onAddMemberLoginChange={(v) => { setAddMemberLogin(v); setAddMemberError(null); }}
                    onAddMemberRoleChange={(v) => setAddMemberRole(v as AreaRole)}
                    onAddMember={handleAddMember}
                    onChangeMemberRole={handleChangeMemberRole}
                    onRemoveMember={(m) => setRemoveConfirmMember(m)}
                  />
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
        confirmDisabled={isLoading}
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
        confirmDisabled={isLoading}
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
