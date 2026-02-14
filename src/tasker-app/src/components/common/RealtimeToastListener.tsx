import React, { useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { onReconnected } from '../../services/realtime/realtimeService';

/**
 * Слушает переподключение real-time (SignalR) и показывает toast.
 * Должен быть внутри ToastProvider.
 */
export const RealtimeToastListener: React.FC = () => {
  const { addInfo } = useToast();

  useEffect(() => {
    return onReconnected(() => {
      addInfo('Соединение восстановлено');
    });
  }, [addInfo]);

  return null;
};
