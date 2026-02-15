import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import {
  startRealtime,
  stopRealtime,
  onEntityChanged,
  onReconnected,
  onRealtimeStatusChange,
  type EntityChangedPayload,
} from '../services/realtime/realtimeService';

/** Payload для notifyTaskUpdate (совместим с EntityChanged) */
export interface NotifyTaskUpdatePayload {
  taskId?: string;
  folderId?: string;
  areaId?: string;
  entityType?: string;
  entityId?: string;
}

type SubscriberCallback = (taskId?: string, folderId?: string, payload?: NotifyTaskUpdatePayload) => void;

interface TaskUpdateContextType {
  notifyTaskUpdate: (taskId?: string, folderId?: string, payload?: NotifyTaskUpdatePayload) => void;
  subscribeToTaskUpdates: (callback: SubscriberCallback) => () => void;
  forceRefresh: () => void;
  realtimeUnavailable: boolean;
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
  const { isAuth } = useAuth();
  const [subscribers, setSubscribers] = useState<Set<SubscriberCallback>>(new Set());
  const [realtimeUnavailable, setRealtimeUnavailable] = useState(false);

  const notifyTaskUpdate = useCallback(
    (taskId?: string, folderId?: string, payload?: NotifyTaskUpdatePayload) => {
      subscribers.forEach((callback) => {
        try {
          callback(taskId, folderId, payload);
        } catch (error) {
          console.error('Ошибка в callback обновления задачи:', error);
        }
      });
    },
    [subscribers]
  );

  const subscribeToTaskUpdates = useCallback((callback: SubscriberCallback) => {
    setSubscribers((prev) => new Set(prev).add(callback));
    return () => {
      setSubscribers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(callback);
        return newSet;
      });
    };
  }, []);

  const forceRefresh = useCallback(() => {
    notifyTaskUpdate();
  }, [notifyTaskUpdate]);

  useEffect(() => {
    if (isAuth) {
      void startRealtime();
    } else {
      void stopRealtime();
    }
    return () => {
      void stopRealtime();
    };
  }, [isAuth]);

  useEffect(() => {
    if (!isAuth) return;
    const unsub = onEntityChanged((payload: EntityChangedPayload) => {
      const p: NotifyTaskUpdatePayload = {
        taskId: payload.entityType === 'TASK' ? payload.entityId : undefined,
        folderId: payload.folderId ?? undefined,
        areaId: payload.areaId,
        entityType: payload.entityType,
        entityId: payload.entityId,
      };
      const taskId = payload.entityType === 'TASK' ? payload.entityId : undefined;
      const folderId = payload.folderId ?? undefined;
      notifyTaskUpdate(taskId, folderId, p);
    });
    return unsub;
  }, [isAuth, notifyTaskUpdate]);

  useEffect(() => {
    if (!isAuth) return;
    const unsub = onReconnected(forceRefresh);
    return unsub;
  }, [isAuth, forceRefresh]);

  useEffect(() => {
    if (!isAuth) return;
    const unsub = onRealtimeStatusChange(setRealtimeUnavailable);
    return unsub;
  }, [isAuth]);

  const value: TaskUpdateContextType = {
    notifyTaskUpdate,
    subscribeToTaskUpdates,
    forceRefresh,
    realtimeUnavailable,
  };

  return (
    <TaskUpdateContext.Provider value={value}>
      {children}
    </TaskUpdateContext.Provider>
  );
};
