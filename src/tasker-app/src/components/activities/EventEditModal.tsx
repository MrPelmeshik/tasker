import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../common/Modal';
import { SimpleModalHeader } from '../common/SimpleModalHeader';
import { EntityFormField } from '../common/EntityFormField';
import { GlassInput, ModalSaveButton, GlassSelect } from '../ui';
import { MarkdownEditor } from '../ui/MarkdownEditor/MarkdownEditor';
import { useToast } from '../../context/ToastContext';
import { toDateTimeLocalValue } from '../../utils/date';
import { EventTypeActivity } from '../../services/api';
import type { EventResponse, EventUpdateRequest } from '../../types/api';
import { AttachmentList, AttachmentListHandle } from '../attachments/AttachmentList';
import { EntityType } from '../../services/api/attachment.api';
import css from '../../styles/modal.module.css';
import formCss from '../../styles/modal-form.module.css';

export interface EventEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: EventUpdateRequest) => Promise<void>;
  event: EventResponse | null;
}

/**
 * Модальное окно редактирования записи события (активности/заметки).
 * Поля: заголовок, описание, тип, дата и время.
 */
export const EventEditModal: React.FC<EventEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  event,
}) => {
  const { showError } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState('ACTIVITY');
  const [eventDateTime, setEventDateTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const attachmentRef = useRef<AttachmentListHandle>(null);

  useEffect(() => {
    if (isOpen && event) {
      setTitle(event.title ?? '');
      const msg = event.message as Record<string, unknown> | undefined;
      setDescription((msg?.description as string) ?? '');
      setEventType(event.eventType ?? 'ACTIVITY');
      setEventDateTime(
        event.eventDate
          ? (typeof event.eventDate === 'string'
            ? new Date(event.eventDate)
            : event.eventDate
          ).toISOString()
          : ''
      );
    }
  }, [isOpen, event]);

  const safeOnClose = async () => {
    // Check if we have uploaded attachments but not saved
    if (attachmentRef.current?.hasPendingChanges) {
      if (window.confirm('Сохранить изменения?')) {
        await handleSave();
      } else {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    if (!event) return;
    setIsLoading(true);
    try {
      const eventDateIso = eventDateTime.trim() ? new Date(eventDateTime).toISOString() : undefined;
      const eventTypeNum = eventType === 'NOTE' ? 4 : EventTypeActivity; // NOTE=4, ACTIVITY=5

      await onSave({
        title: title.trim(),
        description: description.trim() || undefined,
        eventType: eventTypeNum,
        eventDate: eventDateIso,
      });

      // Save attachments
      if (attachmentRef.current) {
        await attachmentRef.current.saveChanges();
      }

      onClose();
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      showError(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!event) return null;

  return (
    <Modal isOpen={isOpen} onClose={safeOnClose} size="medium">
      <div className={css.modalContent}>
        <SimpleModalHeader
          title="Редактировать активность"
          onClose={safeOnClose}
          closeDisabled={isLoading}
        >
          <ModalSaveButton
            onClick={handleSave}
            disabled={!title.trim() || isLoading}
          />
        </SimpleModalHeader>
        <div className={css.modalBody}>
          <div className={formCss.formContainer}>
            <EntityFormField
              label="Заголовок *"
              isViewMode={false}
              viewContent={null}
              editContent={
                <GlassInput
                  value={title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                  placeholder="Краткое описание"
                  disabled={isLoading}
                  fullWidth
                  variant="subtle"
                />
              }
            />
            <div className={formCss.fieldRow}>
              <EntityFormField
                label="Дата и время"
                isViewMode={false}
                viewContent={null}
                editContent={
                  <GlassInput
                    type="datetime-local"
                    value={toDateTimeLocalValue(eventDateTime || new Date().toISOString())}
                    onChange={(e) => setEventDateTime(e.target.value)}
                    disabled={isLoading}
                    fullWidth
                    variant="subtle"
                    aria-label="Дата и время события"
                  />
                }
              />
              <EntityFormField
                label="Тип"
                isViewMode={false}
                viewContent={null}
                editContent={
                  <GlassSelect
                    value={eventType}
                    onChange={(val: string) => setEventType(val)}
                    options={[
                      { value: 'ACTIVITY', label: 'Активность' },
                      { value: 'NOTE', label: 'Заметка' },
                    ]}
                    disabled={isLoading}
                    fullWidth
                    variant="subtle"
                  />
                }
              />
            </div>
            <EntityFormField
              label="Описание"
              isViewMode={false}
              viewContent={null}
              editContent={
                <MarkdownEditor
                  value={description}
                  onChange={setDescription}
                  placeholder="Детали (опционально)"
                  disabled={isLoading}
                  rows={3}
                  maxLength={10000}
                />
              }
            />
            {event && (
              <div style={{ marginTop: 16 }}>
                <AttachmentList
                  ref={attachmentRef}
                  entityId={event.id}
                  entityType={EntityType.EVENT}
                  isEditMode={true}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
