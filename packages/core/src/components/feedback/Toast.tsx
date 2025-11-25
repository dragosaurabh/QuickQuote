'use client';

import React, { useEffect, useState, createContext, useContext, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: ToastMessage[];
  addToast: (type: ToastType, message: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback(
    (type: ToastType, message: string, duration = 5000) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      setToasts((prev) => [...prev, { id, type, message, duration }]);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

interface ToastItemProps {
  toast: ToastMessage;
  onRemove: (id: string) => void;
}

// Halloween-themed toast styles - Requirements 12.2, 12.3
const typeStyles: Record<ToastType, { bg: string; icon: string; emoji: string; glow: string }> = {
  success: {
    bg: 'bg-halloween-green/20 border-halloween-green/50',
    icon: 'text-halloween-green',
    emoji: '🎃',
    glow: 'shadow-[0_0_15px_rgba(34,197,94,0.2)]',
  },
  error: {
    bg: 'bg-red-500/20 border-red-500/50',
    icon: 'text-red-500',
    emoji: '👻',
    glow: 'shadow-[0_0_15px_rgba(239,68,68,0.2)]',
  },
  warning: {
    bg: 'bg-halloween-orange/20 border-halloween-orange/50',
    icon: 'text-halloween-orange',
    emoji: '🦇',
    glow: 'shadow-[0_0_15px_rgba(249,115,22,0.2)]',
  },
  info: {
    bg: 'bg-halloween-purple/20 border-halloween-purple/50',
    icon: 'text-halloween-purple',
    emoji: '🔮',
    glow: 'shadow-[0_0_15px_rgba(139,92,246,0.2)]',
  },
};

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  const [isExiting, setIsExiting] = useState(false);
  const styles = typeStyles[toast.type];

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => onRemove(toast.id), 300);
      }, toast.duration);

      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, onRemove]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  return (
    <div
      role="alert"
      className={`
        flex items-start gap-3 p-4 rounded-lg border
        bg-surface ${styles.bg} ${styles.glow}
        transform transition-all duration-300
        ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
      `}
    >
      <span className="text-xl flex-shrink-0">{styles.emoji}</span>
      <p className="flex-1 text-sm text-text-primary">{toast.message}</p>
      <button
        onClick={handleClose}
        className="p-1 rounded hover:bg-primary/10 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center -m-2"
        aria-label="Dismiss notification"
      >
        <svg
          className="w-4 h-4 text-text-muted"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
};

export { ToastContainer, ToastItem };
