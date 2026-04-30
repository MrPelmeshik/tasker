import { useTaskerShellFilters } from '../../context/TaskerShellContext';

/**
 * Хук для управления фильтрами и сортировкой дерева (состояние + persistence в localStorage).
 */
export function useTreeFilters() {
  const { enabledStatuses, sortPreset, hasStatusFilter, toggleStatus, setSortPreset } = useTaskerShellFilters();
  return { enabledStatuses, sortPreset, hasStatusFilter, toggleStatus, setSortPreset };
}
