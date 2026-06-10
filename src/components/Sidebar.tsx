/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User } from '../types';
import Avatar from './Avatar';
import { 
  Home, 
  MessageCircle, 
  Users, 
  Bell, 
  User as UserIcon, 
  ShieldAlert, 
  LogOut, 
  ChevronDown, 
  Compass
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onChangeTab: (tab: string) => void;
  currentUser: User;
  onLogout: () => void;
  unreadMessagesCount: number;
  unreadNotificationsCount: number;
}

export default function Sidebar({
  currentTab,
  onChangeTab,
  currentUser,
  onLogout,
  unreadMessagesCount,
  unreadNotificationsCount,
}: SidebarProps) {
  const [showProfileSwitcher, setShowProfileSwitcher] = useState(false);

  const menuItems = [
    { id: 'feed', label: 'Trang chủ', icon: Home, badge: 0 },
    { id: 'messages', label: 'Tin nhắn', icon: MessageCircle, badge: unreadMessagesCount },
    { id: 'friends', label: 'Bạn bè', icon: Users, badge: 0 },
    { id: 'notifications', label: 'Thông báo', icon: Bell, badge: unreadNotificationsCount },
    { id: 'profile', label: 'Trang cá nhân', icon: UserIcon, badge: 0 },
  ];

  if (currentUser.role === 'admin') {
    menuItems.push({ id: 'admin', label: 'Quản trị', icon: ShieldAlert, badge: 0 });
  }

  const activeClass = 'bg-blue-50 text-blue-700 font-semibold';
  const inactiveClass = 'text-slate-600 hover:bg-slate-50 hover:text-slate-900';

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside 
        id="desktop-sidebar-container" 
        className="hidden md:flex md:flex-col md:w-64 bg-white border-r border-slate-200 min-h-screen sticky top-0"
      >
        <div className="p-5 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            KN
          </div>
          <span className="font-extrabold text-lg text-slate-800 tracking-tight">ConnectViet</span>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="flex-1 px-3 space-y-0.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                id={`sidebar-link-${item.id}`}
                key={item.id}
                onClick={() => onChangeTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all duration-150 cursor-pointer ${
                  isActive ? activeClass : inactiveClass
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
                  <span>{item.label}</span>
                </div>
                {item.badge > 0 && (
                  <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* PROFILE CONTROL / SWITCHER */}
        <div id="desktop-profile-wrapper" className="p-4 border-t border-slate-150 relative">
          <div className="flex items-center justify-between p-1.5 rounded-xl hover:bg-slate-50 transition-colors">
            <button
              id="sidebar-profile-toggle"
              onClick={() => setShowProfileSwitcher(!showProfileSwitcher)}
              className="flex items-center gap-3 text-left flex-1 cursor-pointer"
            >
              <Avatar avatarId={currentUser.avatar} name={currentUser.username} size="sm" />
              <div className="overflow-hidden">
                <p id="sidebar-profile-username" className="text-xs font-bold text-slate-800 truncate">
                  {currentUser.username}
                </p>
                <p className="text-[10px] text-slate-500 font-mono truncate">
                  {currentUser.role === 'admin' ? 'Quản trị viên' : `@${currentUser.id}`}
                </p>
              </div>
              <ChevronDown size={14} className="text-slate-400 ml-auto" />
            </button>
          </div>

          {/* DROPDOWN POPUP */}
          {showProfileSwitcher && (
            <div 
              id="sidebar-profile-dropdown" 
              className="absolute bottom-16 left-4 right-4 bg-white border border-slate-200 rounded-2xl shadow-lg p-2.5 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150"
            >
              <div className="px-2 py-1.5 border-b border-slate-100 mb-1.5">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Tài khoản hiện tại
                </span>
                <p className="text-xs font-bold text-slate-700 truncate mt-0.5">{currentUser.username}</p>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">@{currentUser.id}</p>
              </div>

              <div className="space-y-0.5">
                <button
                  id="sidebar-dropdown-view-profile"
                  onClick={() => {
                    onChangeTab('profile');
                    setShowProfileSwitcher(false);
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 text-slate-700 rounded-lg text-left text-xs transition-colors cursor-pointer"
                >
                  <UserIcon size={14} className="text-slate-400" />
                  <span>Xem trang cá nhân</span>
                </button>
              </div>
              
              <div className="border-t border-slate-100 mt-2 pt-1.5">
                <button
                  id="sidebar-logout"
                  onClick={() => {
                    onLogout();
                    setShowProfileSwitcher(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-2 py-2 hover:bg-rose-50 text-rose-600 rounded-xl text-left text-xs transition-colors font-semibold cursor-pointer"
                >
                  <LogOut size={14} />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav 
        id="mobile-bottom-nav" 
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex items-center justify-around py-1.5 px-2 z-40 shadow-md"
      >
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              id={`mobile-nav-link-${item.id}`}
              key={item.id}
              onClick={() => onChangeTab(item.id)}
              className="flex flex-col items-center justify-center p-1.5 relative cursor-pointer"
            >
              <Icon size={18} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
              <span className={`text-[9px] mt-0.5 ${isActive ? 'text-blue-700 font-semibold' : 'text-slate-500'}`}>
                {item.label}
              </span>
              
              {item.badge > 0 && (
                <span className="absolute top-1 right-2 bg-red-500 text-white font-bold text-[8px] h-3.5 w-3.5 flex items-center justify-center rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* LOGOUT QUICK */}
        <button
          id="mobile-logout-button"
          onClick={onLogout}
          className="flex flex-col items-center justify-center p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer"
        >
          <LogOut size={18} />
          <span className="text-[9px] mt-0.5">Thoát</span>
        </button>
      </nav>
    </>
  );
}
