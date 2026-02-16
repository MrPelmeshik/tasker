import React, { useState, useMemo } from 'react';
import type { EventResponse } from '../../types/api';
import { Tooltip } from '../ui/Tooltip';
import { Loader } from '../ui/Loader';
import { UserMention } from '../common/UserMention';
import { ConfirmModal } from '../common/ConfirmModal';
import { MarkdownViewer } from '../ui/MarkdownViewer/MarkdownViewer';
import { formatDateTime } from '../../utils/date';
import { getEventTypeLabel, formatMessageForDisplay, EVENT_TYPES } from '../../utils/event-display';
import activityChainCss from '../../styles/activity-chain.module.css';

export interface ActivityListProps {
  /** Массив событий для отображения */
  events: EventResponse[];
  /** Заголовок блока */
  headerTitle?: string;
  /** Показывать переключатели типов событий */
  showTypeFilter?: boolean;
  /** Развёрнут по умолчанию */
  defaultExpanded?: boolean;
  /** Идёт загрузка данных (для контейнеров типа ActivityChain) */
  loading?: boolean;
  /** Сообщение об ошибке загрузки */
  error?: string | null;
  /** Колбэк редактирования записи (если передан — показываются кнопки редактирования) */
  onEdit?: (event: EventResponse) => void;
  /** Колбэк удаления записи (если передан — показываются кнопки удаления, перед вызовом показывается подтверждение) */
  onDelete?: (event: EventResponse) => void;
}

/**
 * Презентационный компонент списка активностей.
 * Отображает массив событий с возможностью фильтрации по типам.
 */
export const ActivityList: React.FC<ActivityListProps> = ({
  events,
  headerTitle = 'История активностей',
  showTypeFilter = true,
  defaultExpanded = true,
  loading = false,
  error = null,
  onEdit,
  onDelete,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [deleteConfirmEvent, setDeleteConfirmEvent] = useState<EventResponse | null>(null);
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  const [expandedDescs, setExpandedDescs] = useState<Set<string>>(() => new Set());
  const [hiddenTypes, setHiddenTypes] = useState<Set<string>>(() =>
    new Set(EVENT_TYPES.filter((t) => t !== 'ACTIVITY' && t !== 'NOTE'))
  );

  const toggleTypeVisibility = (eventType: string) => {
    setHiddenTypes((prev) => {
      const next = new Set(prev);
      if (next.has(eventType)) {
        next.delete(eventType);
      } else {
        next.add(eventType);
      }
      return next;
    });
  };

  const filteredEvents = useMemo(() => {
    if (hiddenTypes.size === 0) return events;
    return events.filter((ev) => !hiddenTypes.has(ev.eventType));
  }, [events, hiddenTypes]);

  const toggleExpanded = () => setExpanded((prev) => !prev);

  const typesPresentInData = useMemo(() => {
    const set = new Set<string>();
    events.forEach((ev) => set.add(ev.eventType));
    return EVENT_TYPES.filter((t) => set.has(t));
  }, [events]);

  return (
    <div className={activityChainCss.chain}>
      <button
        type="button"
        className={activityChainCss.header}
        onClick={toggleExpanded}
        aria-expanded={expanded}
      >
        <span className={activityChainCss.headerTitle}>{headerTitle}</span>
        <span className={activityChainCss.chevron} data-expanded={expanded}>
          ▼
        </span>
      </button>
      {expanded && (
        <div className={activityChainCss.body}>
          {loading && (
            <div className={activityChainCss.message}><Loader size="s" ariaLabel="Загрузка" /></div>
          )}
          {!loading && error && (
            <div className={activityChainCss.messageError}>{error}</div>
          )}
          {!loading && !error && showTypeFilter && typesPresentInData.length > 0 && (
            <div className={activityChainCss.typeFilter}>
              {typesPresentInData.map((eventType) => {
                const isHidden = hiddenTypes.has(eventType);
                return (
                  <Tooltip key={eventType} content={isHidden ? 'Показать' : 'Скрыть'} placement="bottom" size="s">
                    <button
                      type="button"
                      className={`${activityChainCss.typeChip} ${isHidden ? activityChainCss.typeChipHidden : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTypeVisibility(eventType);
                      }}
                    >
                      {getEventTypeLabel(eventType)}
                    </button>
                  </Tooltip>
                );
              })}
            </div>
          )}
          {!loading && !error && filteredEvents.length === 0 && (
            <div className={activityChainCss.message}>
              {events.length === 0 ? 'Нет активностей' : 'Нет активностей выбранных типов'}
            </div>
          )}
          {!loading && !error && filteredEvents.length > 0 && (
            <ul className={activityChainCss.eventList}>
              {filteredEvents.map((ev) => (
                <li key={ev.id} className={activityChainCss.eventItem}>
                  <div className={activityChainCss.eventMain}>
                    <span className={activityChainCss.eventTitle}>
                      {ev.title || '—'}
                    </span>
                    <span className={activityChainCss.eventType}>
                      {getEventTypeLabel(ev.eventType)}
                    </span>
                    <span className={activityChainCss.eventDate}>
                      {formatDateTime(ev.eventDate)}
                      {ev.ownerUserName && (
                        <>
                          {' • '}
                          <UserMention
                            userName={ev.ownerUserName}
                            className={activityChainCss.eventOwner}
                          >
                            {ev.ownerUserName}
                          </UserMention>
                        </>
                      )}
                    </span>
                    {(onEdit || onDelete) && (
                      <span className={activityChainCss.eventActions}>
                        {onEdit && (
                          <Tooltip content="Изменить" placement="bottom" size="s">
                            <button
                              type="button"
                              className={activityChainCss.eventActionBtn}
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(ev);
                              }}
                              aria-label="Изменить"
                            >
                              ✎
                            </button>
                          </Tooltip>
                        )}
                        {onDelete && (
                          <Tooltip content="Удалить" placement="bottom" size="s">
                            <button
                              type="button"
                              className={activityChainCss.eventActionBtn}
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirmEvent(ev);
                              }}
                              aria-label="Удалить"
                            >
                              ✕
                            </button>
                          </Tooltip>
                        )}
                      </span>
                    )}
                  </div>
                  {ev.message && (() => {
                    const text = formatMessageForDisplay(ev.message);
                    if (!text) return null;
                    const isExpanded = expandedDescs.has(ev.id);
                    const isLong = text.length > 120;
                    return (
                      <div className={activityChainCss.eventDesc}>
                        {isExpanded ? (
                          <MarkdownViewer value={text} />
                        ) : (
                          <span>{isLong ? `${text.slice(0, 120)}…` : text}</span>
                        )}
                        {(isLong || isExpanded) && (
                          <button
                            type="button"
                            className={activityChainCss.expandBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedDescs((prev) => {
                                const next = new Set(prev);
                                if (next.has(ev.id)) next.delete(ev.id);
                                else next.add(ev.id);
                                return next;
                              });
                            }}
                          >
                            {isExpanded ? 'Свернуть' : 'Подробнее'}
                          </button>
                        )}
                      </div>
                    );
                  })()}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <ConfirmModal
        isOpen={deleteConfirmEvent != null}
        onClose={() => !deleteInProgress && setDeleteConfirmEvent(null)}
        onCancel={() => setDeleteConfirmEvent(null)}
        onConfirm={async () => {
          if (!deleteConfirmEvent || !onDelete) return;
          setDeleteInProgress(true);
          try {
            await onDelete(deleteConfirmEvent);
            setDeleteConfirmEvent(null);
          } finally {
            setDeleteInProgress(false);
          }
        }}
        title="Удалить запись?"
        message="Удалить запись активности? Это действие нельзя отменить."
        confirmText="Удалить"
        variant="danger"
        confirmDisabled={deleteInProgress}
      />
    </div>
  );
};
