import React, { useState, useCallback, useRef, useEffect } from 'react';
import { parseApiErrorMessage } from '../utils/parse-api-error';

/** Вариант toast-уведомления (success, error, warning, info) */
export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

/** Опции при добавлении toast */
export type ToastOptions = {
  /** Вариант уведомления */
  variant?: ToastVariant;
  /** Длительность показа в мс (0 = не скрывать автоматически) */
  duration?: number;
  /** Колбэк при закрытии */
  onClose?: () => void;
};

/** Элемент toast-уведомления */
export type Toast = {
  id: string;
  message: string;
  variant: ToastVariant;
  duration: number;
  onClose?: () => void;
};

/** Значение контекста toast */
type ToastContextValue = {
  /** Добавить toast с указанными опциями */
  addToast: (message: string, options?: ToastOptions) => string;
  /** Добавить toast с ошибкой (shorthand) */
  addError: (message: string) => string;
  /** Добавить toast с успехом (shorthand) */
  addSuccess: (message: string) => string;
  /** Добавить toast с предупреждением (shorthand) */
  addWarning: (message: string) => string;
  /** Добавить toast с информацией (shorthand) */
  addInfo: (message: string) => string;
  /** Показать ошибку (parse + addError) — единая точка для API/unknown ошибок */
  showError: (error: unknown) => string;
  /** Удалить toast по id */
  removeToast: (id: string) => void;
  /** Массив активных toasts (для ToastViewer) */
  toasts: Toast[];
};

const DEFAULT_DURATION: Record<ToastVariant, number> = {
  error: 5000,
  success: 4000,
  info: 4000,
  warning: 4000,
};

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined);

/** Генерирует уникальный id для toast */
function generateId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Провайдер toast-уведомлений.
 * Управляет списком уведомлений и их автоскрытием.
 */
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => {
      const toast = prev.find((t) => t.id === id);
      toast?.onClose?.();
      return prev.filter((t) => t.id !== id);
    });
  }, []);

  const addToast = useCallback(
    (message: string, options?: ToastOptions): string => {
      const variant = options?.variant ?? 'info';
      const duration = options?.duration ?? DEFAULT_DURATION[variant];
      const id = generateId();

      const toast: Toast = {
        id,
        message,
        variant,
        duration,
        onClose: options?.onClose,
      };

      setToasts((prev) => [...prev, toast]);

      if (duration > 0) {
        const timer = setTimeout(() => {
          timersRef.current.delete(id);
          removeToast(id);
        }, duration);
        timersRef.current.set(id, timer);
      }

      return id;
    },
    [removeToast]
  );

  const addError = useCallback((message: string) => addToast(message, { variant: 'error' }), [addToast]);
  const showError = useCallback((error: unknown) => addError(parseApiErrorMessage(error)), [addError]);
  const addSuccess = useCallback((message: string) => addToast(message, { variant: 'success' }), [addToast]);
  const addWarning = useCallback((message: string) => addToast(message, { variant: 'warning' }), [addToast]);
  const addInfo = useCallback((message: string) => addToast(message, { variant: 'info' }), [addToast]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
    };
  }, []);

  const value: ToastContextValue = React.useMemo(
    () => ({
      addToast,
      addError,
      showError,
      addSuccess,
      addWarning,
      addInfo,
      removeToast,
      toasts,
    }),
    [addToast, addError, showError, addSuccess, addWarning, addInfo, removeToast, toasts]
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
};

/** Хук для доступа к toast-контексту */
export function useToast(): ToastContextValue {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
