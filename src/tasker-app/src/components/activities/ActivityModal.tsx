import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { GlassButton } from '../ui/GlassButton';
import { GlassInput } from '../ui/GlassInput';
import { GlassTextarea } from '../ui/GlassTextarea';
import { XIcon } from '../icons/XIcon';
import { SaveIcon } from '../icons/SaveIcon';
import { EyeIcon } from '../icons/EyeIcon';
import { ActivityChain } from './ActivityChain';
import css from '../../styles/modal.module.css';
import formCss from '../../styles/modal-form.module.css';
import activityModalCss from '../../styles/activity-modal.module.css';
import type { TaskResponse } from '../../types/api';

export interface ActivityFormData {
  title: string;
  description: string;
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
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
    }
  }, [isOpen, task?.id]);

  const handleSave = async () => {
    if (!title.trim()) return;
    setIsLoading(true);
    try {
      await onSave({ title: title.trim(), description: description.trim() });
      onClose();
    } catch (error) {
      console.error('Ошибка сохранения активности:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="medium">
      <div className={css.modalContent}>
        <div className={css.modalHeader}>
          <h3 className={css.modalTitle}>Добавить активность</h3>
          <div className={css.modalActions}>
            <GlassButton variant="subtle" size="xs" onClick={onClose} disabled={isLoading}>
              <XIcon />
            </GlassButton>
            <GlassButton
              variant="primary"
              size="xs"
              onClick={handleSave}
              disabled={!title.trim() || isLoading}
            >
              <SaveIcon />
            </GlassButton>
          </div>
        </div>
        <div className={css.modalBody}>
          <div className={activityModalCss.taskCard} style={{ marginBottom: 'var(--space-16)' }}>
            <GlassButton
              size="xxs"
              variant="subtle"
              onClick={onOpenTaskDetails}
              className={activityModalCss.taskCardButton}
            >
              <EyeIcon />
            </GlassButton>
            <span>{task.title}</span>
          </div>
          {date && (
            <div style={{ marginBottom: 'var(--space-16)' }}>
              <ActivityChain entityType="task" entityId={task.id} date={date} />
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
        <div className={css.modalFooter}>
          <GlassButton variant="subtle" onClick={onClose} disabled={isLoading}>
            Отмена
          </GlassButton>
          <GlassButton
            variant="primary"
            onClick={handleSave}
            disabled={!title.trim() || isLoading}
          >
            <SaveIcon /> Сохранить
          </GlassButton>
        </div>
      </div>
    </Modal>
  );
};
