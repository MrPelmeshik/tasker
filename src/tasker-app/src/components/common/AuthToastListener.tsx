import React, { useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { AUTH_TOKENS_CLEARED_EVENT, isAuthTokensClearedEvent } from '../../services/api/auth-events';

/**
 * Слушает событие очистки токенов (сессия истекла) и показывает toast.
 * Должен быть внутри ToastProvider.
 */
export const AuthToastListener: React.FC = () => {
  const { addWarning } = useToast();

  useEffect(() => {
    const handler = (e: Event) => {
      if (isAuthTokensClearedEvent(e)) {
        addWarning('Сессия истекла. Войдите снова.');
      }
    };
    window.addEventListener(AUTH_TOKENS_CLEARED_EVENT, handler);
    return () => window.removeEventListener(AUTH_TOKENS_CLEARED_EVENT, handler);
  }, [addWarning]);

  return null;
};
