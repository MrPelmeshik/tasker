import { useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';

/**
 * Hook for managing widget-specific state in localStorage.
 * Automatically prefixes keys with 'tasker-widget-{widgetId}-'.
 * 
 * @param widgetId Unique identifier for the widget (e.g., 'tree', 'task-table')
 * @param stateKey Key for the specific state slice (e.g., 'filters', 'expanded-nodes')
 * @param initialValue Initial value
 */
export function useWidgetState<T>(widgetId: string, stateKey: string, initialValue: T) {
    const key = useMemo(() => `tasker-widget-${widgetId}-${stateKey}`, [widgetId, stateKey]);
    return useLocalStorage<T>(key, initialValue);
}
