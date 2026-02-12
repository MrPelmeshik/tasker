import type { AreaRole } from '../types';

/**
 * Подписи ролей области для отображения
 */
export const AREA_ROLE_LABELS: Record<string, string> = {
  Owner: 'Владелец',
  Administrator: 'Администратор',
  Executor: 'Исполнитель',
  Observer: 'Наблюдатель',
};

/**
 * Роли, которые можно назначить при добавлении участника (без Owner)
 */
export function getAddableRoles(): Array<{ value: AreaRole; label: string }> {
  return [
    { value: 'Administrator', label: 'Администратор' },
    { value: 'Executor', label: 'Исполнитель' },
    { value: 'Observer', label: 'Наблюдатель' },
  ];
}
