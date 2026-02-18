import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { useTaskSchedules, type DisplaySchedule } from '../../hooks/useSchedules';
import { GlassInput } from '../ui';
import { GlassButton } from '../ui/GlassButton';
import { XIcon, PlusIcon } from '../icons';
import { Loader } from '../ui/Loader';
import css from '../../styles/task-schedule.module.css';

export interface TaskScheduleListHandle {
  saveChanges: () => Promise<void>;
  hasPendingChanges: boolean;
}

export interface TaskScheduleListProps {
  taskId: string;
  isEditMode: boolean;
  onPendingChange?: (hasPending: boolean) => void;
}

function formatScheduleRange(startAt: Date, endAt: Date): string {
  const s = new Date(startAt);
  const e = new Date(endAt);
  const dayOpts: Intl.DateTimeFormatOptions = { weekday: 'short', day: '2-digit', month: '2-digit' };
  const timeOpts: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
  const sameDay = s.toDateString() === e.toDateString();
  const dayStr = s.toLocaleDateString('ru-RU', dayOpts);
  const startTime = s.toLocaleTimeString('ru-RU', timeOpts);
  const endTime = e.toLocaleTimeString('ru-RU', timeOpts);

  if (sameDay) {
    return `${dayStr}, ${startTime} – ${endTime}`;
  }
  const endDayStr = e.toLocaleDateString('ru-RU', dayOpts);
  return `${dayStr}, ${startTime} – ${endDayStr}, ${endTime}`;
}

export const TaskScheduleList = forwardRef<TaskScheduleListHandle, TaskScheduleListProps>(
  ({ taskId, isEditMode, onPendingChange }, ref) => {
    const {
      schedules,
      loading,
      addSchedule,
      markForDelete,
      undoDelete,
      saveChanges,
      hasPendingChanges,
    } = useTaskSchedules(taskId, onPendingChange);

    useImperativeHandle(ref, () => ({
      saveChanges,
      hasPendingChanges,
    }));

    const [expanded, setExpanded] = useState(true);
    const [startAt, setStartAt] = useState('');
    const [endAt, setEndAt] = useState('');

    const handleAdd = () => {
      if (!startAt || !endAt) return;
      addSchedule(new Date(startAt).toISOString(), new Date(endAt).toISOString());
      setStartAt('');
      setEndAt('');
    };

    const handleDelete = (item: DisplaySchedule) => {
      if (item.isPendingDelete) {
        undoDelete(item.id);
      } else {
        markForDelete(item.id);
      }
    };

    return (
      <div className={css.section}>
        <button className={css.header} type="button" onClick={() => setExpanded(!expanded)}>
          <span className={css.headerTitle}>
            Планирование ({schedules.filter(s => !s.isPendingDelete).length})
            {hasPendingChanges && <span className={css.unsavedIndicator} title="Есть несохраненные изменения">*</span>}
          </span>
          <span className={css.chevron} data-expanded={expanded}>▼</span>
        </button>

        {expanded && (
          <div className={css.body}>
            {loading ? (
              <Loader size="s" />
            ) : schedules.length === 0 && !isEditMode ? (
              <div className={css.empty}>Нет запланированных слотов</div>
            ) : (
              <div className={css.list}>
                {schedules.map((s) => (
                  <div
                    key={s.id}
                    className={`${css.item}${s.isPendingDelete ? ` ${css.itemPendingDelete}` : ''}${s.isPending ? ` ${css.itemPending}` : ''}`}
                  >
                    <span className={css.itemTime}>
                      {formatScheduleRange(s.startAt, s.endAt)}
                    </span>
                    {isEditMode && (
                      <GlassButton
                        variant="subtle"
                        size="xs"
                        className={css.deleteBtn}
                        onClick={() => handleDelete(s)}
                        aria-label={s.isPendingDelete ? 'Отменить удаление' : 'Удалить'}
                      >
                        {s.isPendingDelete ? '↩' : <XIcon width={14} height={14} />}
                      </GlassButton>
                    )}
                  </div>
                ))}
              </div>
            )}

            {isEditMode && (
              <div className={css.addRow}>
                <GlassInput
                  type="datetime-local"
                  value={startAt}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartAt(e.target.value)}
                  variant="subtle"
                />
                <GlassInput
                  type="datetime-local"
                  value={endAt}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndAt(e.target.value)}
                  variant="subtle"
                />
                <GlassButton
                  variant="subtle"
                  size="xs"
                  onClick={handleAdd}
                  disabled={!startAt || !endAt}
                  aria-label="Добавить"
                >
                  <PlusIcon width={16} height={16} />
                </GlassButton>
              </div>
            )}
          </div>
        )}
      </div>
    );
  },
);
