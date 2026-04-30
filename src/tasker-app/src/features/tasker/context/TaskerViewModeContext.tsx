import React, { createContext, useContext } from 'react';
import { useWidgetState } from '../../../hooks';

export type TaskerViewMode = 'activities' | 'calendar';

type TaskerViewModeContextValue = {
  viewMode: TaskerViewMode;
  setViewMode: (mode: TaskerViewMode) => void;
};

const TaskerViewModeContext = createContext<TaskerViewModeContextValue | null>(null);

/**
 * <summary>
 * Единое состояние режима отображения Tasker для Header и TaskerPage.
 * Сохраняет прежний persisted ключ tasker-page/viewMode.
 * </summary>
 */
export const TaskerViewModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [viewMode, setViewModeRaw] = useWidgetState<TaskerViewMode>('tasker-page', 'viewMode', 'activities');
  const setViewMode = (mode: TaskerViewMode) => setViewModeRaw(mode);

  return (
    <TaskerViewModeContext.Provider value={{ viewMode, setViewMode }}>
      {children}
    </TaskerViewModeContext.Provider>
  );
};

export function useTaskerViewMode(): TaskerViewModeContextValue {
  const ctx = useContext(TaskerViewModeContext);
  if (!ctx) {
    throw new Error('useTaskerViewMode must be used within TaskerViewModeProvider');
  }
  return ctx;
}
