import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../common/Modal';
import { ConfirmModal } from '../common/ConfirmModal';
import {
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
import { TaskStatusBadge } from '../ui/TaskStatusBadge';
import { ActivityList } from '../activities/ActivityList';
import { useEvents } from '../activities/useEvents';
import { useEntityFormModal } from '../../hooks';
import { useTaskUpdate } from '../../context';
import { CONFIRM_UNSAVED_CHANGES, CONFIRM_RETURN_TO_VIEW, getConfirmDeleteConfig } from '../../constants/confirm-modals';
import css from '../../styles/modal.module.css';
import formCss from '../../styles/modal-form.module.css';
import type { TaskResponse, TaskCreateRequest, TaskUpdateRequest } from '../../types';
import { TaskStatus, getTaskStatusOptions } from '../../types';
import type { ModalSize } from '../../types/modal-size';
import { fetchChildFolders } from '../../services/api';
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
  const [folderOptions, setFolderOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [loadingFolders, setLoadingFolders] = useState(false);

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

  const taskEvents = useEvents('task', task?.id);
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

  /** Загрузка папок при выборе области */
  useEffect(() => {
    if (!isOpen || !formData.areaId) {
      setFolderOptions([{ value: '', label: 'Без папки (корень области)' }]);
      return;
    }
    let cancelled = false;
    setLoadingFolders(true);
    const load = async () => {
      try {
        const opts: Array<{ value: string; label: string }> = [{ value: '', label: 'Без папки (корень области)' }];
        const addNested = async (parentId: string | null, prefix: string) => {
          const children = await fetchChildFolders(parentId, formData.areaId);
          for (const f of children) {
            opts.push({ value: f.id, label: `${prefix}${f.title}` });
            await addNested(f.id, `${prefix}${f.title} / `);
          }
        };
        await addNested(null, '');
        if (!cancelled) setFolderOptions(opts);
      } catch {
        if (!cancelled) setFolderOptions([{ value: '', label: 'Без папки (корень области)' }]);
      } finally {
        if (!cancelled) setLoadingFolders(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [isOpen, formData.areaId]);

  const folderValue = formData.folderId === '' || formData.folderId == null ? '' : formData.folderId;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} hasUnsavedChanges={hasUnsavedChanges} size={size}>
      <div className={css.modalContent}>
        <div className={css.modalHeader}>
          <h3 className={css.modalTitle}>
            {isViewMode ? 'Задача' : task ? 'Редактирование задачи' : 'Создание задачи'}
          </h3>
          <div className={css.modalActions}>
            <ModalCloseButton onClick={handleClose} disabled={isLoading} />
            {isViewMode ? (
              <>
                <ModalEditButton variant="primary" onClick={() => setIsEditMode(true)} disabled={isLoading} />
                {task && onDelete && <ModalDeleteButton onClick={handleDeleteRequest} disabled={isLoading} />}
              </>
            ) : (
              <>
                {task && <ModalCancelButton onClick={handleReturnToView} disabled={isLoading} />}
                <ModalSaveButton
                  onClick={handleSave}
                  disabled={!hasChanges || !formData.title.trim() || !formData.areaId || isLoading}
                />
                {task && onDelete && <ModalDeleteButton onClick={handleDeleteRequest} disabled={isLoading} />}
              </>
            )}
          </div>
        </div>
        <div className={css.modalBody}>
          <div className={formCss.formContainer}>
            {areas && areas.length > 0 && (
              <div className={formCss.fieldGroup}>
                <div className={formCss.fieldHeader}>
                  <label className={formCss.fieldLabel}>Область *</label>
                  {!isViewMode && fieldChanges.areaId && (
                    <ModalResetFieldButton onClick={() => handleResetField('areaId')} className={formCss.resetButton} />
                  )}
                </div>
                <div className={formCss.fieldContainer}>
                  {isViewMode ? (
                    <div className={formCss.fieldValueReadonly}>
                      {areas.find((a) => a.id === formData.areaId)?.title ?? '—'}
                    </div>
                  ) : (
                    <GlassSelect
                      value={formData.areaId}
                      onChange={(value) => handleFieldChange('areaId', value)}
                      options={[
                        { value: '', label: 'Выберите область' },
                        ...areas.map((a) => ({ value: a.id, label: a.title })),
                      ]}
                      disabled={isLoading}
                      fullWidth
                    />
                  )}
                </div>
              </div>
            )}

            {areas && areas.length > 0 && (
              <div className={formCss.fieldGroup}>
                <div className={formCss.fieldHeader}>
                  <label className={formCss.fieldLabel}>Папка</label>
                  {!isViewMode && fieldChanges.folderId && (
                    <ModalResetFieldButton onClick={() => handleResetField('folderId')} className={formCss.resetButton} />
                  )}
                </div>
                <div className={formCss.fieldContainer}>
                  {isViewMode ? (
                    <div className={formCss.fieldValueReadonly}>
                      {folderValue
                        ? folderOptions.find((o) => o.value === folderValue)?.label ?? '—'
                        : 'Без папки (корень области)'}
                    </div>
                  ) : (
                    <GlassSelect
                      value={folderValue}
                      onChange={(value) => handleFieldChange('folderId', value)}
                      options={folderOptions}
                      disabled={isLoading || loadingFolders}
                      fullWidth
                    />
                  )}
                </div>
              </div>
            )}

            <div className={formCss.fieldGroup}>
              <div className={formCss.fieldHeader}>
                <label className={formCss.fieldLabel}>Название задачи *</label>
                {!isViewMode && fieldChanges.title && (
                  <ModalResetFieldButton onClick={() => handleResetField('title')} className={formCss.resetButton} />
                )}
              </div>
              <div className={formCss.fieldContainer}>
                {isViewMode ? (
                  <div className={formCss.fieldValueReadonly}>{formData.title || '—'}</div>
                ) : (
                  <GlassInput
                    value={formData.title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('title', e.target.value)}
                    placeholder="Введите название задачи"
                    disabled={isLoading}
                    fullWidth
                  />
                )}
              </div>
            </div>

            <div className={formCss.fieldGroup}>
              <div className={formCss.fieldHeader}>
                <label className={formCss.fieldLabel}>Статус</label>
                {!isViewMode && fieldChanges.status && (
                  <ModalResetFieldButton onClick={() => handleResetField('status')} className={formCss.resetButton} />
                )}
              </div>
              <div className={formCss.fieldContainer}>
                {isViewMode ? (
                  <div className={formCss.fieldValueReadonly} style={{ display: 'flex', alignItems: 'center' }}>
                    <TaskStatusBadge status={(formData.status ?? TaskStatus.New) as TaskStatus} size="s" />
                  </div>
                ) : (
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
                )}
              </div>
            </div>

            <div className={formCss.fieldGroup}>
              <div className={formCss.fieldHeader}>
                <label className={formCss.fieldLabel}>Описание</label>
                {!isViewMode && fieldChanges.description && (
                  <ModalResetFieldButton onClick={() => handleResetField('description')} className={formCss.resetButton} />
                )}
              </div>
              <div className={formCss.fieldContainer}>
                {isViewMode ? (
                  <div className={formCss.fieldValueReadonlyMultiline}>{formData.description || '—'}</div>
                ) : (
                  <GlassTextarea
                    value={formData.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleFieldChange('description', e.target.value)}
                    placeholder="Введите описание задачи"
                    rows={4}
                    disabled={isLoading}
                    fullWidth
                  />
                )}
              </div>
            </div>

            {task && (
              <div className={formCss.readonlyMeta}>
                <div className={formCss.readonlyMetaTitle}>Информация</div>
                {task.ownerUserName && (
                  <div className={formCss.readonlyMetaRow}>
                    <span className={formCss.readonlyMetaLabel}>Владелец</span>
                    <span className={formCss.readonlyMetaValue}>{task.ownerUserName}</span>
                  </div>
                )}
                {task.createdAt && (
                  <div className={formCss.readonlyMetaRow}>
                    <span className={formCss.readonlyMetaLabel}>Дата создания</span>
                    <span className={formCss.readonlyMetaValue}>{formatDateTime(task.createdAt)}</span>
                  </div>
                )}
                {task.updatedAt && (
                  <div className={formCss.readonlyMetaRow}>
                    <span className={formCss.readonlyMetaLabel}>Дата обновления</span>
                    <span className={formCss.readonlyMetaValue}>{formatDateTime(task.updatedAt)}</span>
                  </div>
                )}
              </div>
            )}

            {task && (
              <ActivityList
                events={taskEvents.events}
                loading={taskEvents.loading}
                error={taskEvents.error}
                headerTitle="История активностей"
                showTypeFilter={true}
                defaultExpanded={true}
              />
            )}
          </div>
        </div>
      </div>
      <ConfirmModal isOpen={showConfirmModal} onClose={handleConfirmCancel} onConfirm={handleConfirmSave} onCancel={handleConfirmCancel} onDiscard={handleConfirmDiscard} {...CONFIRM_UNSAVED_CHANGES} />
      <ConfirmModal isOpen={showReturnToViewConfirm} onClose={dismissReturnToViewConfirm} onConfirm={handleConfirmReturnToView} onCancel={dismissReturnToViewConfirm} {...CONFIRM_RETURN_TO_VIEW} />
      <ConfirmModal isOpen={showDeleteConfirm} onClose={dismissDeleteConfirm} onConfirm={handleConfirmDelete} onCancel={dismissDeleteConfirm} {...getConfirmDeleteConfig('задачу')} />
    </Modal>
  );
};
