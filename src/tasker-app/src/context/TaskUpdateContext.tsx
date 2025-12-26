import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface TaskUpdateContextType {
  // Функция для уведомления об обновлении задач
  notifyTaskUpdate: (taskId?: string, groupId?: string) => void;
  // Функция для подписки на обновления задач
  subscribeToTaskUpdates: (callback: (taskId?: string, groupId?: string) => void) => () => void;
  // Функция для принудительного обновления всех компонентов
  forceRefresh: () => void;
}

const TaskUpdateContext = createContext<TaskUpdateContextType | undefined>(undefined);

export const useTaskUpdate = () => {
  const context = useContext(TaskUpdateContext);
  if (!context) {
    throw new Error('useTaskUpdate must be used within a TaskUpdateProvider');
  }
  return context;
};

interface TaskUpdateProviderProps {
  children: ReactNode;
}

export const TaskUpdateProvider: React.FC<TaskUpdateProviderProps> = ({ children }) => {
  const [subscribers, setSubscribers] = useState<Set<(taskId?: string, groupId?: string) => void>>(new Set());
  const [refreshCounter, setRefreshCounter] = useState(0);

  const notifyTaskUpdate = useCallback((taskId?: string, groupId?: string) => {
    subscribers.forEach(callback => {
      try {
        callback(taskId, groupId);
      } catch (error) {
        console.error('Ошибка в callback обновления задачи:', error);
      }
    });
  }, [subscribers]);

  const subscribeToTaskUpdates = useCallback((callback: (taskId?: string, groupId?: string) => void) => {
    setSubscribers(prev => new Set(prev).add(callback));
    
    // Возвращаем функцию отписки
    return () => {
      setSubscribers(prev => {
        const newSet = new Set(prev);
        newSet.delete(callback);
        return newSet;
      });
    };
  }, []);

  const forceRefresh = useCallback(() => {
    setRefreshCounter(prev => prev + 1);
    notifyTaskUpdate();
  }, [notifyTaskUpdate]);

  const value: TaskUpdateContextType = {
    notifyTaskUpdate,
    subscribeToTaskUpdates,
    forceRefresh,
  };

  return (
    <TaskUpdateContext.Provider value={value}>
      {children}
    </TaskUpdateContext.Provider>
  );
};
