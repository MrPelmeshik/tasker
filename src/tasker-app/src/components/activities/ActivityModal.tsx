import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../common/Modal';
import {
  GlassInput,
  GlassTextarea,
  ModalCloseButton,
  ModalSaveButton,
} from '../ui';
import { ActivityList } from './ActivityList';
import { TaskCardLink } from '../tasks';
import { useToast } from '../../context/ToastContext';
import { parseApiErrorMessage } from '../../utils/parse-api-error';
import { useEvents } from './useEvents';
import css from '../../styles/modal.module.css';
import formCss from '../../styles/modal-form.module.css';
import activityModalCss from '../../styles/activity-modal.module.css';
import { formatDateOnly } from '../../utils/date';
import type { TaskResponse } from '../../types/api';

export interface ActivityFormData {
  title: string;
  description: string;
  /** Дата активности (обязательное, ISO YYYY-MM-DD) */
  date: string;
}

export interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ActivityFormData) => Promise<void>;
  task: TaskResponse;
  /** Дата (ISO YYYY-MM-DD) — при передаче показываются активности за этот день */
  date?: string | null;
  onOpenTaskDetails: () => void;
}

export const ActivityModal: React.FC<ActivityModalProps> = ({
  isOpen,
  onClose,
  onSave,
  task,
  date,
  onOpenTaskDetails,
}) => {
  const { addError } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const isSubmittingRef = useRef(false);

  const taskEvents = useEvents('task', task.id, date ?? undefined);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
    }
  }, [isOpen, task?.id]);

  const handleSave = async () => {
    if (!title.trim()) return;
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsLoading(true);
    try {
      if (!date) throw new Error('Дата активности не указана');
      await onSave({ title: title.trim(), description: description.trim(), date });
      onClose();
    } catch (error) {
      console.error('Ошибка сохранения активности:', error);
      addError(parseApiErrorMessage(error));
    } finally {
      isSubmittingRef.current = false;
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="medium">
      <div className={css.modalContent}>
        <div className={css.modalHeader}>
          <h3 className={css.modalTitle}>Добавить активность</h3>
          <div className={css.modalActions}>
            <ModalCloseButton onClick={onClose} disabled={isLoading} />
            <ModalSaveButton
              onClick={handleSave}
              disabled={!title.trim() || isLoading}
            />
          </div>
        </div>
        <div className={css.modalBody}>
          <TaskCardLink
            task={{ id: task.id, title: task.title, status: task.status }}
            onClick={() => onOpenTaskDetails()}
            className={activityModalCss.taskCard}
          />
          {date && (
            <div style={{ marginBottom: 'var(--space-16)' }}>
              <ActivityList
                events={taskEvents.events}
                loading={taskEvents.loading}
                error={taskEvents.error}
                headerTitle={date ? `Активности за ${formatDateOnly(date)}` : 'История активностей'}
                showTypeFilter={true}
                defaultExpanded={true}
              />
            </div>
          )}
          <div className={formCss.formContainer}>
            <div className={formCss.fieldGroup}>
              <label className={formCss.fieldLabel}>Заголовок *</label>
              <div className={formCss.fieldContainer}>
                <GlassInput
                  value={title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                  placeholder="Краткое описание активности"
                  disabled={isLoading}
                  fullWidth
                />
              </div>
            </div>
            <div className={formCss.fieldGroup}>
              <label className={formCss.fieldLabel}>Описание</label>
              <div className={formCss.fieldContainer}>
                <GlassTextarea
                  value={description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                  placeholder="Детали (опционально)"
                  disabled={isLoading}
                  rows={3}
                  fullWidth
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
