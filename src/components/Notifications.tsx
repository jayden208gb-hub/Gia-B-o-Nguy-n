/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { User, Notification } from '../types';
import Avatar from './Avatar';
import { Bell, Heart, MessageSquare, UserPlus, CheckCircle2, Check, Sparkles, AlertCircle } from 'lucide-react';

interface NotificationsProps {
  currentUser: User;
  notifications: Notification[];
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onNavigateToPost: (postId: string) => void;
}

export default function Notifications({
  currentUser,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onNavigateToPost,
}: NotificationsProps) {
  // Get notifications belonging specifically to current user
  const userNotifications = notifications
    .filter((n) => n.userId === currentUser.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const unreadCount = userNotifications.filter((n) => !n.isRead).length;

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'like':
        return (
          <div className="h-7 w-7 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
            <Heart size={14} fill="currentColor" />
          </div>
        );
      case 'comment':
        return (
          <div className="h-7 w-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <MessageSquare size={14} />
          </div>
        );
      case 'friend_request':
        return (
          <div className="h-7 w-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <UserPlus size={14} />
          </div>
        );
      case 'friend_accept':
        return (
          <div className="h-7 w-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 size={14} />
          </div>
        );
      case 'message':
        return (
          <div className="h-7 w-7 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
            <MessageSquare size={14} />
          </div>
        );
      default:
        return (
          <div className="h-7 w-7 rounded-full bg-slate-50 text-slate-600 flex items-center justify-center flex-shrink-0">
            <Bell size={14} />
          </div>
        );
    }
  };

  return (
    <div id="notifications-view-container" className="max-w-xl mx-auto py-6 px-4 space-y-6 pb-24 md:pb-6">
      
      {/* HEADER SECTION */}
      <div id="notifications-header-panel" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
            <Bell size={16} className="text-blue-600 animate-swing" />
            <span>Thông báo của bạn</span>
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {unreadCount > 0 ? `Bạn đang có ${unreadCount} thông báo mới chưa đọc` : 'Bạn đã đọc toàn bộ thông báo'}
          </p>
        </div>

        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button
              id="btn-mark-all-read"
              onClick={onMarkAllAsRead}
              className="text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Check size={11} /> <span>Đọc hết</span>
            </button>
          )}
          {userNotifications.length > 0 && (
            <button
              id="btn-clear-all-notifications"
              onClick={onClearAll}
              className="text-[10px] font-medium text-slate-500 hover:text-rose-600 px-2 py-1.5 rounded-xl cursor-pointer transition-colors"
            >
              Xóa thư mục
            </button>
          )}
        </div>
      </div>

      {/* NOTIFICATIONS STREAM */}
      <div id="notifications-activity-list" className="space-y-3">
        {userNotifications.length === 0 ? (
          <div className="bg-white py-14 px-4 rounded-2xl text-center border border-slate-200 shadow-sm space-y-2">
            <div className="h-9 w-9 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto">
              <Bell size={16} />
            </div>
            <span className="block text-xs font-semibold text-slate-600">Hộp thư thông báo rỗng</span>
            <p className="text-[10px] text-slate-400">Các cập nhật hoạt động tương tác mới sẽ hiển thị tại đây.</p>
          </div>
        ) : (
          userNotifications.map((notif) => {
            const isClickable = !!notif.postId;
            
            return (
              <div
                id={`notification-card-${notif.id}`}
                key={notif.id}
                onClick={() => {
                  if (isClickable && notif.postId) {
                    onNavigateToPost(notif.postId);
                  }
                  onMarkAsRead(notif.id);
                }}
                className={`p-4 bg-white border rounded-2xl flex items-start gap-3.5 shadow-sm transition-all duration-150 ${
                  !notif.isRead 
                    ? 'border-blue-100 bg-blue-50/20' 
                    : 'border-slate-200 hover:border-slate-300'
                } ${isClickable ? 'cursor-pointer hover:bg-slate-50/50' : ''}`}
              >
                {/* Colored notification icon */}
                {getNotificationIcon(notif.type)}

                {/* Avatar triggering activity */}
                <Avatar avatarId={notif.senderAvatar} name={notif.senderName} size="sm" className="mt-0.5 flex-shrink-0" />

                {/* Content info */}
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-slate-700 leading-normal">
                    <span className="font-bold text-slate-900">{notif.senderName}</span>{' '}
                    <span>{notif.content}</span>
                  </div>
                  
                  <span className="block text-[8px] font-semibold text-slate-400 mt-1 uppercase tracking-wide">
                    {new Date(notif.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}{' '}
                    • {new Date(notif.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>

                {/* Mark as read tick option */}
                {!notif.isRead && (
                  <button
                    id={`btn-mark-read-item-${notif.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkAsRead(notif.id);
                    }}
                    title="Đánh dấu đã đọc"
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                  >
                    <Check size={12} />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
