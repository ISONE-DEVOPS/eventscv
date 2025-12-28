'use client';

import { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const colors = {
  success: {
    bg: 'bg-success/10',
    border: 'border-success/30',
    icon: 'text-success',
  },
  error: {
    bg: 'bg-error/10',
    border: 'border-error/30',
    icon: 'text-error',
  },
  info: {
    bg: 'bg-brand-primary/10',
    border: 'border-brand-primary/30',
    icon: 'text-brand-primary',
  },
  warning: {
    bg: 'bg-warning/10',
    border: 'border-warning/30',
    icon: 'text-warning',
  },
};

export function ToastItem({ toast, onDismiss }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);
  const Icon = icons[toast.type];
  const color = colors[toast.type];

  useEffect(() => {
    const duration = toast.duration || 5000;
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onDismiss(toast.id), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onDismiss]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => onDismiss(toast.id), 300);
  };

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-2xl border-2 backdrop-blur-xl shadow-2xl
        ${color.bg} ${color.border}
        transition-all duration-300 ease-out
        ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
      `}
    >
      <div className={`w-5 h-5 ${color.icon} flex-shrink-0 mt-0.5`}>
        <Icon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[hsl(var(--foreground))] text-sm">{toast.title}</p>
        {toast.message && (
          <p className="text-xs text-[hsl(var(--foreground-secondary))] mt-0.5">{toast.message}</p>
        )}
      </div>
      <button
        onClick={handleDismiss}
        className="text-[hsl(var(--foreground-muted))] hover:text-[hsl(var(--foreground))] transition-colors flex-shrink-0"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none">
      <div className="pointer-events-auto space-y-3">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </div>
    </div>
  );
}
