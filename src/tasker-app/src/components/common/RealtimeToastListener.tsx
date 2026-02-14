import React, { useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import {
  onReconnected,
  onRealtimeConnectionFailed,
} from '../../services/realtime/realtimeService';

/**
 * Слушает переподключение и сбой подключения real-time (SignalR), показывает toast.
 * Должен быть внутри ToastProvider.
 */
export const RealtimeToastListener: React.FC = () => {
  const { addInfo, showError } = useToast();

  useEffect(() => {
    return onReconnected(() => {
      addInfo('Соединение восстановлено');
    });
  }, [addInfo]);

  useEffect(() => {
    return onRealtimeConnectionFailed((error) => {
      showError(error);
    });
  }, [showError]);

  return null;
};
