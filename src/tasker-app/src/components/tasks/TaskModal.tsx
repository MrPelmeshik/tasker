import React, { useEffect, useRef, useState } from 'react';
import { Modal } from '../common/Modal';
import { EntityConfirmModals } from '../common/EntityConfirmModals';
import { GlassInput, GlassSelect } from '../ui';
import { MarkdownEditor } from '../ui/MarkdownEditor/MarkdownEditor';
import { MarkdownViewer } from '../ui/MarkdownViewer/MarkdownViewer';
import { TaskStatusBadge } from '../ui/TaskStatusBadge';
import { ActivityList } from '../activities/ActivityList';
import { EventEditModal } from '../activities/EventEditModal';
import { EntityMetaBlock } from '../common/EntityMetaBlock';
import { EntityModalHeader } from '../common/EntityModalHeader';
import { EntityFormField } from '../common/EntityFormField';
import { useEvents } from '../activities/useEvents';
import { updateEvent, deleteEvent } from '../../services/api';
import { useEntityFormModal, useFolderOptions, useCopyEntityLink } from '../../hooks';
import { useTaskUpdate } from '../../context';
import css from '../../styles/modal.module.css';
import formCss from '../../styles/modal-form.module.css';
import type { TaskResponse, TaskCreateRequest, TaskUpdateRequest, EventResponse } from '../../types';
import { TaskStatus, getTaskStatusOptions } from '../../types';
import type { ModalSize } from '../../types/modal-size';
import { formatDateTime } from '../../utils/date';

export interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: TaskCreateRequest | TaskUpdateRequest, taskId?: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  task?: TaskResponse | null;
  title?: string;
  size?: ModalSize;
  defaultFolderId?: string;
  defaultAreaId?: string;
  areas?: Array<{ id: string; title: string }>;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  task = null,
  title = 'Задача',
  size = 'medium',
  defaultFolderId,
  defaultAreaId,
  areas,
}) => {
  const { copyLink: handleCopyLink } = useCopyEntityLink('task', task?.id);

  const modal = useEntityFormModal<TaskCreateRequest>({
    isOpen,
    entity: task,
    getInitialData: () =>
      task
        ? {
            title: task.title,
            description: task.description || '',
            areaId: task.areaId,
            folderId: task.folderId ?? null,
            status: task.status || TaskStatus.New,
          }
        : {
            title: '',
            description: '',
            areaId: defaultAreaId || (areas?.[0]?.id ?? ''),
            folderId: defaultFolderId ?? null,
            status: TaskStatus.New,
          },
    deps: [task, defaultFolderId, defaultAreaId, areas],
    onClose,
    onSave: async (data) => {
      const payload = {
        ...data,
        folderId: (data.folderId === '' || data.folderId == null) ? null : data.folderId,
      };
      await onSave(payload, task?.id);
    },
    onDelete,
    validate: (data) => Boolean(data.title?.trim() && data.areaId),
    getExtraUnsavedChanges: ({ originalData: orig }) =>
      Boolean(areas?.length && orig.areaId && defaultAreaId && orig.areaId !== defaultAreaId),
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

  const { options: folderOptions, loading: loadingFolders } = useFolderOptions(formData.areaId, {
    enabled: isOpen,
  });

  const taskEvents = useEvents('task', task?.id);
  const [editEvent, setEditEvent] = useState<EventResponse | null>(null);
  const { subscribeToTaskUpdates } = useTaskUpdate();
  const refetchRef = useRef(taskEvents.refetch);
  refetchRef.current = taskEvents.refetch;
  const isViewMode = Boolean(task && !isEditMode);

  useEffect(() => {
    const unsub = subscribeToTaskUpdates((_taskId, _folderId, payload) => {
      if (payload?.taskId === task?.id) {
        refetchRef.current();
      }
    });
    return unsub;
  }, [subscribeToTaskUpdates, task?.id]);

  const folderValue = formData.folderId === '' || formData.folderId == null ? '' : formData.folderId;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} hasUnsavedChanges={hasUnsavedChanges} size={size}>
      <div className={css.modalContent}>
        <EntityModalHeader
          title={isViewMode ? 'Задача' : task ? 'Редактирование задачи' : 'Создание задачи'}
          isViewMode={isViewMode}
          hasEntity={!!task?.id}
          showDeleteInViewMode={!!(task && onDelete)}
          showDeleteInEditMode={!!(task && onDelete)}
          onCopyLink={handleCopyLink}
          onEdit={() => setIsEditMode(true)}
          onDelete={handleDeleteRequest}
          onCancel={handleReturnToView}
          onSave={handleSave}
          onClose={handleClose}
          isLoading={isLoading}
          saveDisabled={!hasChanges || !formData.title.trim() || !formData.areaId}
        />
        <div className={css.modalBody}>
          <div className={formCss.formContainer}>
            {areas && areas.length > 0 && (
              <EntityFormField
                label="Область *"
                hasChange={fieldChanges.areaId}
                onReset={() => handleResetField('areaId')}
                isViewMode={isViewMode}
                viewContent={<div className={formCss.fieldValueReadonly}>{areas.find((a) => a.id === formData.areaId)?.title ?? '—'}</div>}
                editContent={
                  <GlassSelect
                    value={formData.areaId}
                    onChange={(value) => handleFieldChange('areaId', value)}
                    options={[{ value: '', label: 'Выберите область' }, ...areas.map((a) => ({ value: a.id, label: a.title }))]}
                    disabled={isLoading}
                    fullWidth
                  />
                }
              />
            )}

            {areas && areas.length > 0 && (
              <EntityFormField
                label="Папка"
                hasChange={fieldChanges.folderId}
                onReset={() => handleResetField('folderId')}
                isViewMode={isViewMode}
                viewContent={
                  <div className={formCss.fieldValueReadonly}>
                    {folderValue ? folderOptions.find((o) => o.value === folderValue)?.label ?? '—' : 'Без папки (корень области)'}
                  </div>
                }
                editContent={
                  <GlassSelect
                    value={folderValue}
                    onChange={(value) => handleFieldChange('folderId', value)}
                    options={folderOptions}
                    disabled={isLoading || loadingFolders}
                    fullWidth
                  />
                }
              />
            )}

            <EntityFormField
              label="Название задачи *"
              hasChange={fieldChanges.title}
              onReset={() => handleResetField('title')}
              isViewMode={isViewMode}
              viewContent={<div className={formCss.fieldValueReadonly}>{formData.title || '—'}</div>}
              editContent={
                <GlassInput
                  value={formData.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('title', e.target.value)}
                  placeholder="Введите название задачи"
                  disabled={isLoading}
                  fullWidth
                />
              }
            />

            <EntityFormField
              label="Статус"
              hasChange={fieldChanges.status}
              onReset={() => handleResetField('status')}
              isViewMode={isViewMode}
              viewContent={
                <div className={`${formCss.fieldValueReadonly} flex-row-center`}>
                  <TaskStatusBadge status={(formData.status ?? TaskStatus.New) as TaskStatus} size="s" />
                </div>
              }
              editContent={
                <GlassSelect
                  value={formData.status?.toString() || TaskStatus.New.toString()}
                  onChange={(value) => handleFieldChange('status', parseInt(value))}
                  options={getTaskStatusOptions().map((opt) => ({ value: opt.value.toString(), label: opt.label }))}
                  renderOption={(opt, { size: s }) => <TaskStatusBadge status={Number(opt.value) as TaskStatus} size={s} />}
                  renderValue={(opt) => <TaskStatusBadge status={Number(opt.value) as TaskStatus} size="s" />}
                  disabled={isLoading}
                  fullWidth
                  size="s"
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
                  placeholder="Введите описание задачи"
                  rows={4}
                  disabled={isLoading}
                  maxLength={10000}
                />
              }
            />

            {task && (
              <EntityMetaBlock
                ownerUserName={task.ownerUserName}
                createdAt={task.createdAt}
                updatedAt={task.updatedAt}
                formatDateTime={formatDateTime}
              />
            )}

            {task && (
              <ActivityList
                events={taskEvents.events}
                loading={taskEvents.loading}
                error={taskEvents.error}
                headerTitle="История активностей"
                showTypeFilter={true}
                defaultExpanded={true}
                onEdit={(ev) => setEditEvent(ev)}
                onDelete={async (ev) => {
                  await deleteEvent(ev.id);
                  await taskEvents.refetch();
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
        entityNameForDelete="задачу"
      />
      <EventEditModal
        isOpen={editEvent != null}
        onClose={() => setEditEvent(null)}
        onSave={async (data) => {
          if (editEvent) {
            await updateEvent(editEvent.id, data);
            await taskEvents.refetch();
            setEditEvent(null);
          }
        }}
        event={editEvent}
      />
    </Modal>
  );
};
