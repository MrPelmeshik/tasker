import React from 'react';
import {
    EventTypeCreate,
    EventTypeUpdate,
    EventTypeDelete,
    EventTypeNote,
    EventTypeActivity
} from '../../services/api/events';
import {
    PlusIcon,
    EditIcon,
    DeleteIcon,
    FileIcon,
    CheckSquareIcon
} from '../icons';
import { Tooltip } from './Tooltip';
import css from '../../styles/task-status-badge.module.css'; // Reuse status badge styles or create new

interface EventStatusBadgeProps {
    eventType: number;
    size?: 'xs' | 's' | 'm' | 'l';
    variant?: 'default' | 'compact' | 'icon-only';
    className?: string;
    showName?: boolean; // For "Full" view in tooltip
}

export const getEventTypeText = (type: number): string => {
    switch (type) {
        case EventTypeCreate: return 'Создание';
        case EventTypeUpdate: return 'Обновление';
        case EventTypeDelete: return 'Удаление';
        case EventTypeNote: return 'Заметка';
        case EventTypeActivity: return 'Активность';
        default: return 'Неизвестно';
    }
};

export const getEventTypeIcon = (type: number) => {
    switch (type) {
        case EventTypeCreate: return PlusIcon;
        case EventTypeUpdate: return EditIcon;
        case EventTypeDelete: return DeleteIcon;
        case EventTypeNote: return FileIcon;
        case EventTypeActivity: return CheckSquareIcon;
        default: return CheckSquareIcon;
    }
};

// Color Logic is now handled by CSS attribute selectors [data-event-type="..."]

export const EventStatusBadge: React.FC<EventStatusBadgeProps> = ({
    eventType,
    size = 's',
    variant = 'default',
    className,
    showName = false,
}) => {
    const text = getEventTypeText(eventType);
    const Icon = getEventTypeIcon(eventType);

    const badgeClass = [
        css.badge,
        css[size],
        variant === 'compact' && css.compact,
        className
    ].filter(Boolean).join(' ');

    if (variant === 'icon-only' || variant === 'compact') {
        const content = (
            <span className={badgeClass} data-event-type={eventType}>
                {variant === 'icon-only' && <Icon className="icon-s" />}
            </span>
        );

        if (variant === 'compact' && !showName) {
            // Dot style (compact view requested for tooltip?)
            // "In compact only icon and circle" -> maybe just a small colored dot?
            // Existing TaskStatusBadge compact is a colored dot.
            return (
                <Tooltip content={text} placement="top" size="s">
                    {content}
                </Tooltip>
            );
        }
        return content;
    }

    return (
        <span className={badgeClass} data-event-type={eventType}>
            <Icon className="icon-s" style={{ marginRight: showName ? 4 : 0 }} />
            {showName && text}
        </span>
    );
};
