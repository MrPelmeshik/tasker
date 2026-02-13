import React from 'react';
import { formatDateOnly } from '../../utils/date';
import { ActivityList } from './ActivityList';
import { useEvents } from './useEvents';

export interface ActivityChainProps {
  /** Тип сущности: задача или область (папки не имеют активностей) */
  entityType: 'task' | 'area';
  /** Идентификатор сущности */
  entityId: string;
  /** Опциональная дата (ISO YYYY-MM-DD): показывать только активности за этот день */
  date?: string;
}

/**
 * Обёртка: использует useEvents и ActivityList.
 * Сохранена для обратной совместимости.
 */
export const ActivityChain: React.FC<ActivityChainProps> = ({
  entityType,
  entityId,
  date,
}) => {
  const { events, loading, error } = useEvents(entityType, entityId, date);
  const headerTitle = date ? `Активности за ${formatDateOnly(date)}` : 'История активностей';

  return (
    <ActivityList
      events={events}
      headerTitle={headerTitle}
      showTypeFilter={true}
      defaultExpanded={true}
      loading={loading}
      error={error}
    />
  );
};
