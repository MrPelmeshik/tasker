import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { ModalContentFrame, ModalFormBody } from '../common/ModalFrame';
import { EntityFormField } from '../common/EntityFormField';
import { GlassInput, ModalSaveButton, GlassSelect } from '../ui';
import { MarkdownEditor } from '../ui/MarkdownEditor/MarkdownEditor';
import { ActivityList } from './ActivityList';
import { EventEditModal } from './EventEditModal';
import { TaskCardLink } from '../tasks';
import { useToast } from '../../context/ToastContext';
import { useTaskerDetailPanel } from '../../features/tasker/context/TaskerDetailPanelContext';
import { useEvents } from './useEvents';
import formCss from '../../styles/modal-form.module.css';
import activityDetailEditorCss from '../../styles/activity-detail-editor.module.css';
import { formatDateOnly, toDateTimeLocalValue } from '../../utils/date';
import type { TaskResponse, EventResponse, EventUpdateRequest } from '../../types/api';

export interface ActivityFormData {
  title: string;
  description: string;
  /** Дата и время в ISO (для API eventDate) */
  eventDateTime: string;
  eventType: string;
}

export interface ActivityDetailEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ActivityFormData) => Promise<void>;
  task: TaskResponse;
  date?: string | null;
  /** Открыть карточку задачи в панели детализации */
  onOpenTaskDetail: () => void;
  /** Колбэк сохранения при редактировании записи (если передан — в списке показываются кнопки редактирования) */
  onSaveEdit?: (eventId: string, data: EventUpdateRequest) => Promise<void>;
  /** Колбэк удаления записи (если передан — в списке показываются кнопки удаления) */
  onDeleteEvent?: (event: EventResponse) => Promise<void>;
}

export const ActivityDetailEditor: React.FC<ActivityDetailEditorProps> = ({
  isOpen,
  onClose,
  onSave,
  task,
  date,
  onOpenTaskDetail,
  onSaveEdit,
  onDeleteEvent,
}) => {
  const { setDetailChrome, registerDetailPanelCloseHandler } = useTaskerDetailPanel();
  const { showError } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDateTime, setEventDateTime] = useState('');
  const [eventType, setEventType] = useState('ACTIVITY');
  const [isLoading, setIsLoading] = useState(false);
  const [editEvent, setEditEvent] = useState<EventResponse | null>(null);
  const isSubmittingRef = useRef(false);

  const taskEvents = useEvents('task', task.id, date ?? undefined);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setEventType('ACTIVITY');

      const now = new Date();
      if (date) {
        // Устанавливаем выбранную дату, сохраняя текущее время
        const [y, m, d] = date.split('-').map(Number);
        now.setFullYear(y, m - 1, d);
      }
      setEventDateTime(now.toISOString());
    }
  }, [isOpen, task?.id, date]);

  const handleSave = async () => {
    if (!title.trim()) return;
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsLoading(true);
    try {
      if (!eventDateTime.trim()) throw new Error('Дата и время активности не указаны');
      const eventDateIso = new Date(eventDateTime).toISOString();
      await onSave({
        title: title.trim(),
        description: description.trim(),
        eventDateTime: eventDateIso,
        eventType
      });
      onClose();
    } catch (error) {
      showError(error);
    } finally {
      isSubmittingRef.current = false;
      setIsLoading(false);
    }
  };

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const handleSaveRef = useRef(handleSave);
  handleSaveRef.current = handleSave;

  useLayoutEffect(() => {
    if (!isOpen) {
      setDetailChrome(null);
      registerDetailPanelCloseHandler(null);
      return undefined;
    }
    registerDetailPanelCloseHandler(() => onCloseRef.current());
    setDetailChrome({
      title: 'Создание события',
      actions: (
        <ModalSaveButton
          onClick={() => handleSaveRef.current()}
          disabled={!title.trim() || !eventDateTime.trim() || isLoading}
        />
      ),
    });
    return () => {
      setDetailChrome(null);
      registerDetailPanelCloseHandler(null);
    };
  }, [
    isOpen,
    setDetailChrome,
    registerDetailPanelCloseHandler,
    title,
    eventDateTime,
    isLoading,
  ]);

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <ModalContentFrame>
        <ModalFormBody>
          <TaskCardLink
            task={{ id: task.id, title: task.title, status: task.status }}
            onClick={() => onOpenTaskDetail()}
            className={activityDetailEditorCss.taskCard}
          />
          {date && (
            <div className="mb-16">
              <ActivityList
                events={taskEvents.events}
                loading={taskEvents.loading}
                error={taskEvents.error}
                headerTitle={date ? `Активности за ${formatDateOnly(date)}` : 'История активностей'}
                showTypeFilter={true}
                defaultExpanded={true}
                onEdit={onSaveEdit ? (ev) => setEditEvent(ev) : undefined}
                onDelete={
                  onDeleteEvent
                    ? (ev) => onDeleteEvent(ev).then(() => taskEvents.refetch())
                    : undefined
                }
              />
            </div>
          )}
          <div className={formCss.formContainer}>
            <EntityFormField
              label="Заголовок *"
              isViewMode={false}
              viewContent={null}
              editContent={
                <GlassInput
                  value={title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                  placeholder="Краткое описание активности"
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
                label="Тип активности"
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
          </div>
        </ModalFormBody>
      </ModalContentFrame>
      {onSaveEdit && (
        <EventEditModal
          isOpen={editEvent != null}
          onClose={() => setEditEvent(null)}
          onSave={async (data) => {
            if (editEvent) {
              await onSaveEdit(editEvent.id, data);
              await taskEvents.refetch();
              setEditEvent(null);
            }
          }}
          event={editEvent}
        />
      )}
    </>
  );
};
