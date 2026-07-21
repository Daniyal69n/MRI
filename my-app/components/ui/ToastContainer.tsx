'use client';

import { useState, useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { Notification } from '@/lib/notifications';

interface ToastProps {
  notification: Notification;
  onClose: (id: string) => void;
}

function Toast({ notification, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(notification.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [notification.id, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-[#6ef0de]" />,
    warning: <AlertTriangle className="w-5 h-5 text-[#f0d3a0]" />,
    error: <AlertCircle className="w-5 h-5 text-[#ff6b6b]" />,
    info: <Info className="w-5 h-5 text-blue-400" />
  };

  const borders = {
    success: 'border-[#6ef0de]',
    warning: 'border-[#f0d3a0]',
    error: 'border-[#ff6b6b]',
    info: 'border-blue-400'
  };

  return (
    <div className={`pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-[#10151d] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] border-l-4 border-y border-r border-y-[#232b38] border-r-[#232b38] ${borders[notification.type]} mb-3 transition-all duration-300 transform translate-x-0 glass-panel-dark`}>
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {icons[notification.type]}
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium text-white">
              {notification.title}
            </p>
            <p className="mt-1 text-sm text-[#8c96a8]">
              {notification.message}
            </p>
          </div>
          <div className="ml-4 flex flex-shrink-0">
            <button
              type="button"
              className="inline-flex rounded-md bg-transparent text-[#5b6576] hover:text-[#e7ebf1] focus:outline-none"
              onClick={() => onClose(notification.id)}
            >
              <span className="sr-only">Close</span>
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Notification[]>([]);

  useEffect(() => {
    const handleNewNotification = (event: CustomEvent<Notification>) => {
      const notification = event.detail;
      setToasts(prev => [...prev, notification]);
    };

    window.addEventListener('showToast' as any, handleNewNotification);
    return () => window.removeEventListener('showToast' as any, handleNewNotification);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div
      aria-live="assertive"
      className="pointer-events-none fixed inset-0 flex px-4 py-6 items-start sm:p-6 z-[100] mt-16 flex-col-reverse justify-end sm:items-end sm:justify-start"
    >
      <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
        {toasts.map(toast => (
          <Toast key={toast.id} notification={toast} onClose={removeToast} />
        ))}
      </div>
    </div>
  );
}
