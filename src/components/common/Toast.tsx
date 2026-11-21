import React from 'react';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div
      role="region"
      aria-label="Notifications"
      aria-live="polite"
      className="fixed bottom-16 md:bottom-6 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role={toast.type === 'error' ? 'alert' : 'status'}
          className="pointer-events-auto flex items-start gap-3 p-3.5 rounded-panel bg-white dark:bg-[#182228] border border-brand-border dark:border-slate-700 shadow-card animate-fade-in text-xs transition-all"
        >
          {toast.type === 'success' && (
            <CheckCircle2 aria-hidden="true" className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          )}
          {toast.type === 'error' && (
            <XCircle aria-hidden="true" className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          )}
          {toast.type === 'warning' && (
            <AlertTriangle aria-hidden="true" className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          )}
          {toast.type === 'info' && (
            <Info aria-hidden="true" className="w-4 h-4 text-brand-teal shrink-0 mt-0.5" />
          )}

          <div className="flex-1">
            <h4 className="font-semibold text-brand-text dark:text-white text-[13px]">
              {toast.title}
            </h4>
            {toast.message && (
              <p className="text-brand-text-secondary dark:text-slate-400 mt-0.5">
                {toast.message}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => removeToast(toast.id)}
            aria-label="Dismiss notification"
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus-visible:outline-none"
          >
            <X aria-hidden="true" className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
