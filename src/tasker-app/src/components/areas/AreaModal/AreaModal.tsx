import React, { useState } from 'react';
import { Modal } from '../../common/Modal';
import { EntityConfirmModals } from '../../common/EntityConfirmModals';
import { GlassInput, ColorPicker } from '../../ui';
import { MarkdownEditor } from '../../ui/MarkdownEditor/MarkdownEditor';
import { MarkdownViewer } from '../../ui/MarkdownViewer/MarkdownViewer';
import { ActivityList } from '../../activities/ActivityList';
import { EventEditModal } from '../../activities/EventEditModal';
import { EntityMetaBlock } from '../../common/EntityMetaBlock';
import { EntityModalHeader } from '../../common/EntityModalHeader';
import { EntityFormField } from '../../common/EntityFormField';
import { updateEvent, deleteEvent } from '../../../services/api';
import { useEntityFormModal, useCopyEntityLink } from '../../../hooks';
import { useToast } from '../../../context/ToastContext';
import { areaApi } from '../../../services/api/areas';
import css from '../../../styles/modal.module.css';
import formCss from '../../../styles/modal-form.module.css';
import { formatDateTime } from '../../../utils/date';
import type { AreaResponse, AreaCreateRequest, AreaUpdateRequest, AreaRole, EventResponse } from '../../../types';
import type { ModalSize } from '../../../types/modal-size';
import { AreaModalMembersSection } from './AreaModalMembersSection';
import { useAreaMembers } from './useAreaMembers';
import { HierarchyTree } from '../../../features/tasker/widgets/Tree/HierarchyTree';

/** Данные формы области: название, описание, цвет (в форме — selectedColor, при сохранении уходит как color). */
type AreaFormData = { title: string; description: string; selectedColor?: string; id?: string };

export interface AreaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AreaCreateRequest | AreaUpdateRequest) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  area?: AreaResponse | null;
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
  const { showError, addSuccess } = useToast();
  const { copyLink: handleCopyLink } = useCopyEntityLink('area', area?.id);

  const [editEvent, setEditEvent] = useState<EventResponse | null>(null);
  const members = useAreaMembers({ isOpen, area, showError });
  const {
    setOriginalMembers,
    pendingRoleChanges,
    pendingAdds,
    pendingRemoves,
    membersLoading,
    membersError,
    addMemberLogin,
    addMemberRole,
    addMemberError,
    setAddMemberLogin,
    setAddMemberRole,
    setAddMemberError,
    removeConfirmMember,
    setRemoveConfirmMember,
    displayMembers,
    canEdit,
    areaEvents,
    handleAddMember,
    handleChangeMemberRole,
    handleConfirmRemoveMember,
    resetPending,
  } = members;

  const modal = useEntityFormModal<AreaFormData>({
    isOpen,
    entity: area,
    getInitialData: () =>
      area
        ? { title: area.title, description: area.description || '', selectedColor: area.customColor }
        : { title: '', description: '', selectedColor: undefined },
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
          const updated = await areaApi.getMembers(area.id);
          setOriginalMembers(updated);
          resetPending();
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
      await onSave((area ? { ...data, id: area.id, selectedColor: data.selectedColor } : { ...data, selectedColor: data.selectedColor }) as (AreaCreateRequest | AreaUpdateRequest) & { selectedColor?: string });
    },
    onDelete,
    validate: (data) => Boolean(data.title?.trim()) && (Boolean(area) || Boolean((data as AreaFormData).selectedColor)),
    getExtraUnsavedChanges: () =>
      Object.keys(pendingRoleChanges).length > 0 ||
      pendingAdds.length > 0 ||
      pendingRemoves.size > 0,
    onReturnToView: resetPending,
    onDiscard: resetPending,
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

  const isViewMode = Boolean(area && !isEditMode);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      hasUnsavedChanges={hasUnsavedChanges}
      size={size}
    >
      <div className={css.modalContent}>
        <EntityModalHeader
          title={isViewMode ? 'Область' : area ? 'Редактирование области' : 'Создание области'}
          isViewMode={isViewMode}
          hasEntity={!!area?.id}
          canEdit={canEdit}
          showDeleteInViewMode={!!(canEdit && area && onDelete)}
          showDeleteInEditMode={!!(area && onDelete)}
          onCopyLink={handleCopyLink}
          onEdit={() => setIsEditMode(true)}
          onDelete={handleDeleteRequest}
          onCancel={handleReturnToView}
          onSave={handleSave}
          onClose={handleClose}
          isLoading={isLoading}
          saveDisabled={!hasUnsavedChanges || !formData.title.trim() || (!area && !(formData as AreaFormData).selectedColor)}
        />

        <div className={css.modalBody}>
          <div className={formCss.formContainer}>
            <EntityFormField
              label="Название области *"
              hasChange={fieldChanges.title}
              onReset={() => handleResetField('title')}
              isViewMode={isViewMode}
              viewContent={<div className={formCss.fieldValueReadonly}>{formData.title || '—'}</div>}
              editContent={
                <GlassInput
                  value={formData.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('title', e.target.value)}
                  placeholder="Введите название области"
                  disabled={isLoading}
                  fullWidth
                />
              }
            />
            <EntityFormField
              label="Описание"
              hasChange={fieldChanges.description}
              onReset={() => handleResetField('description')}
              isViewMode={isViewMode}
              viewContent={<MarkdownViewer value={formData.description} />}
              editContent={
                <MarkdownEditor
                  value={formData.description}
                  onChange={(val) => handleFieldChange('description', val)}
                  placeholder="Введите описание области"
                  rows={4}
                  disabled={isLoading}
                  maxLength={10000}
                />
              }
            />

            <EntityFormField
              label="Цвет области"
              hasChange={fieldChanges.selectedColor}
              onReset={() => handleResetField('selectedColor')}
              isViewMode={isViewMode}
              viewContent={
                (formData as AreaFormData).selectedColor ? (
                  <div className={formCss.fieldValueReadonly} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 4,
                        backgroundColor: (formData as AreaFormData).selectedColor,
                        border: '1px solid rgba(255,255,255,0.2)',
                      }}
                    />
                    <span>{(formData as AreaFormData).selectedColor}</span>
                  </div>
                ) : (
                  <div className={formCss.fieldValueReadonly}>—</div>
                )
              }
              editContent={
                <ColorPicker
                  value={(formData as AreaFormData).selectedColor}
                  onChange={(hex) => handleFieldChange('selectedColor', hex)}
                  disabled={isLoading}
                  required={!area}
                  showHexInput={true}
                />
              }
            />

            {area && (
              <EntityMetaBlock
                ownerUserName={area.ownerUserName}
                createdAt={area.createdAt}
                updatedAt={area.updatedAt}
                formatDateTime={formatDateTime}
              />
            )}

            {area && (
              <AreaModalMembersSection
                displayMembers={displayMembers}
                isViewMode={isViewMode}
                membersLoading={membersLoading}
                membersError={membersError}
                addMemberLoading={isLoading}
                addMemberLogin={addMemberLogin}
                addMemberRole={addMemberRole}
                addMemberError={addMemberError}
                onAddMemberLoginChange={(v) => {
                  setAddMemberLogin(v);
                  setAddMemberError(null);
                }}
                onAddMemberRoleChange={(v) => setAddMemberRole(v as AreaRole)}
                onAddMember={handleAddMember}
                onChangeMemberRole={handleChangeMemberRole}
                onRemoveMember={(m) => setRemoveConfirmMember(m)}
              />
            )}

            {area && (
              <div style={{ marginTop: 24, marginBottom: 24 }}>
                <h3 className={formCss.sectionTitle}>Структура</h3>
                <div style={{
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12,
                  background: 'rgba(0,0,0,0.2)',
                  minHeight: 200,
                  maxHeight: 500,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <HierarchyTree root={{ type: 'area', id: area.id }} />
                </div>
              </div>
            )}

            {area && (
              <ActivityList
                events={areaEvents.events}
                loading={areaEvents.loading}
                error={areaEvents.error}
                headerTitle="История активностей"
                showTypeFilter={true}
                defaultExpanded={true}
                onEdit={(ev) => setEditEvent(ev)}
                onDelete={async (ev) => {
                  await deleteEvent(ev.id);
                  await areaEvents.refetch();
                }}
              />
            )}
          </div>
        </div>
      </div>

      <EntityConfirmModals
        showConfirmModal={showConfirmModal}
        onConfirmSave={handleConfirmSave}
        onConfirmCancel={handleConfirmCancel}
        onConfirmDiscard={handleConfirmDiscard}
        showReturnToViewConfirm={showReturnToViewConfirm}
        onDismissReturnToView={dismissReturnToViewConfirm}
        onConfirmReturnToView={handleConfirmReturnToView}
        showDeleteConfirm={showDeleteConfirm}
        onDismissDelete={dismissDeleteConfirm}
        onConfirmDelete={handleConfirmDelete}
        isLoading={isLoading}
        entityNameForDelete="область"
        removeMember={{
          member: removeConfirmMember ?? null,
          onClose: () => setRemoveConfirmMember(null),
          onConfirm: handleConfirmRemoveMember,
        }}
      />
      <EventEditModal
        isOpen={editEvent != null}
        onClose={() => setEditEvent(null)}
        onSave={async (data) => {
          if (editEvent) {
            await updateEvent(editEvent.id, data);
            await areaEvents.refetch();
            setEditEvent(null);
          }
        }}
        event={editEvent}
      />
    </Modal>
  );
};
