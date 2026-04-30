import { useTaskerShellFilters } from '../../context/TaskerShellContext';

/**
 * Хук для управления фильтрами и сортировкой таблицы задач (состояние + persistence в localStorage).
 */
export function useTaskTableFilters() {
    return useTaskerShellFilters();
}