/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import Avatar from './Avatar';
import { X, Sparkles, Bell } from 'lucide-react';

interface ToastData {
  id: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  type: string;
  onClick: () => void;
}

interface PushNotificationProps {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
}

export default function PushNotification({ toasts, onDismiss }: PushNotificationProps) {
  return (
    <div 
      id="push-toasts-container" 
      className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: ToastData; onDismiss: (id: string) => void; key?: string }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div
      id={`toast-banner-${toast.id}`}
      onClick={toast.onClick}
      className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xl shadow-slate-200/50 flex items-start gap-3.5 cursor-pointer pointer-events-auto hover:bg-slate-50 transition-all transform hover:-translate-y-0.5 duration-150 animate-in slide-in-from-top-4 duration-300 relative overflow-hidden"
    >
      {/* Decorative colored left edge indicator depending on notification type */}
      <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-blue-600" />

      <Avatar avatarId={toast.senderAvatar} name={toast.senderName} size="sm" className="flex-shrink-0 mt-0.5" />
      
      <div className="flex-1 min-w-0 pr-4">
        <span className="block text-[8px] uppercase tracking-wider font-extrabold text-blue-600 flex items-center gap-1">
          <Bell size={9} />
          Thông báo mới
        </span>
        <p className="text-xs text-slate-800 leading-normal mt-0.5">
          <span className="font-bold">{toast.senderName}</span> {toast.content}
        </p>
      </div>

      <button
        id={`btn-close-toast-${toast.id}`}
        onClick={(e) => {
          e.stopPropagation();
          onDismiss(toast.id);
        }}
        className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer self-start transition-colors"
      >
        <X size={12} />
      </button>
    </div>
  );
}
