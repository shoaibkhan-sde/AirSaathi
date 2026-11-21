import { useState, useCallback } from 'react';
import type { ToastMessage } from './AppContextTypes';

const TOAST_AUTO_DISMISS_MS = 5000;

export function useToastManager() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (
      title: string,
      message?: string,
      type: 'success' | 'info' | 'warning' | 'error' = 'success'
    ) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newToast: ToastMessage = { id, type, title, message };
      setToasts((prev) => [...prev.slice(-3), newToast]);

      setTimeout(() => {
        removeToast(id);
      }, TOAST_AUTO_DISMISS_MS);
    },
    [removeToast]
  );

  return { toasts, showToast, removeToast };
}
