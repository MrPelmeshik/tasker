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

/** Порядок ролей для отображения групп участников */
export const AREA_ROLES_ORDERED: AreaRole[] = ['Owner', 'Administrator', 'Executor', 'Observer'];

/** Роли-зоны, в которые можно перетаскивать участников (без Owner) */
export const DROPPABLE_ROLES: AreaRole[] = ['Administrator', 'Executor', 'Observer'];

/** Роли, которые могут редактировать область */
export const EDITABLE_AREA_ROLES: AreaRole[] = ['Owner', 'Administrator'];

/**
 * Проверяет, может ли пользователь редактировать область по своей роли.
 * @param role Роль пользователя в области
 * @returns true, если роль Owner или Administrator
 */
export function canEditArea(role: AreaRole | null | undefined): boolean {
  return role != null && EDITABLE_AREA_ROLES.includes(role);
}

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
