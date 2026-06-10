/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { User, Message } from '../types';
import Avatar from './Avatar';
import { Send, MessageSquare, ArrowLeft, ShieldAlert, Sparkles } from 'lucide-react';

interface MessagesProps {
  currentUser: User;
  allUsers: User[];
  messages: Message[];
  friendships: any[];
  onSendMessage: (receiverId: string, content: string) => void;
  activeChatFriendId: string | null;
  setActiveChatFriendId: (friendId: string | null) => void;
}

export default function Messages({
  currentUser,
  allUsers,
  messages,
  friendships,
  onSendMessage,
  activeChatFriendId,
  setActiveChatFriendId,
}: MessagesProps) {
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Filter users that are currently "accepted" friends
  const getFriends = (): User[] => {
    return allUsers.filter((user) => {
      if (user.id === currentUser.id || user.isBanned) return false;
      const relation = friendships.find(
        (f) =>
          ((f.user1Id === currentUser.id && f.user2Id === user.id) ||
            (f.user2Id === currentUser.id && f.user1Id === user.id)) &&
          f.status === 'accepted'
      );
      return !!relation;
    });
  };

  const friends = getFriends();
  
  // Selected Friend data
  const activeFriend = allUsers.find((u) => u.id === activeChatFriendId);

  // Filter messages belonging to current active conversation
  const activeMessages = messages.filter(
    (m) =>
      (m.senderId === currentUser.id && m.receiverId === activeChatFriendId) ||
      (m.senderId === activeChatFriendId && m.receiverId === currentUser.id)
  );

  // Auto-scroll to lowest message on layout or message list updates
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeMessages.length, isTyping]);

  const handleSendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChatFriendId) return;

    onSendMessage(activeChatFriendId, inputText.trim());
    setInputText('');

    // Trigger AI typing effect simulation!
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
    }, 1800);
  };

  // Quick helper to determine unread count per friend
  const getUnreadCount = (friendId: string): number => {
    return messages.filter(
      (m) => m.senderId === friendId && m.receiverId === currentUser.id && !m.isRead
    ).length;
  };

  // Helper to get latest message preview text
  const getLastMessagePreview = (friendId: string): string => {
    const chatHistory = messages.filter(
      (m) =>
        (m.senderId === currentUser.id && m.receiverId === friendId) ||
        (m.senderId === friendId && m.receiverId === currentUser.id)
    );
    if (chatHistory.length === 0) return 'Chưa có cuộc trò chuyện';
    const last = chatHistory[chatHistory.length - 1];
    const prefix = last.senderId === currentUser.id ? 'Bạn: ' : '';
    return `${prefix}${last.content}`;
  };

  return (
    <div id="messages-container" className="max-w-5xl mx-auto py-6 px-4 pb-24 md:pb-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-[calc(100vh-180px)] min-h-[450px] flex">
        
        {/* LEFT COLUMN: FRIENDS CHAT LIST (Hidden on mobile when conversation is active) */}
        <div 
          id="chat-list-sidebar"
          className={`${
            activeChatFriendId ? 'hidden md:flex' : 'flex'
          } flex-col w-full md:w-80 border-r border-slate-200 flex-shrink-0 bg-slate-50/20`}
        >
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <MessageSquare size={16} className="text-blue-600" />
              <span>Hộp thư cá nhân</span>
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Trò chuyện thời gian thực với bạn bè</p>
          </div>

          <div className="flex-1 overflow-y-auto space-y-px p-2 scrollbar-thin">
            {friends.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 italic">
                Bạn chưa kết nối với thành viên nào. Hãy vào mục <span className="font-semibold text-blue-700">Bạn bè</span> để kết bạn trước nhé!
              </div>
            ) : (
              friends.map((friend) => {
                const isActive = friend.id === activeChatFriendId;
                const unreadCount = getUnreadCount(friend.id);
                const lastPreview = getLastMessagePreview(friend.id);
                
                return (
                  <button
                    id={`chat-item-friend-${friend.id}`}
                    key={friend.id}
                    onClick={() => setActiveChatFriendId(friend.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left mb-1 cursor-pointer ${
                      isActive 
                        ? 'bg-blue-50 text-blue-900 border-l-4 border-blue-600 pl-2' 
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Avatar avatarId={friend.avatar} name={friend.username} size="sm" />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <p className="font-bold text-xs truncate text-slate-800">{friend.username}</p>
                        {unreadCount > 0 && (
                          <span className="bg-rose-500 text-white font-bold text-[8px] px-1.5 py-0.5 rounded-full flex-shrink-0">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      <p className={`text-[10px] truncate mt-0.5 ${unreadCount > 0 ? 'text-slate-950 font-semibold' : 'text-slate-400'}`}>
                        {lastPreview}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: CHAT WINDOW (Hidden on mobile when NO conversation is active) */}
        <div 
          id="chat-window-panel"
          className={`${
            !activeChatFriendId ? 'hidden md:flex' : 'flex'
          } flex-1 flex-col h-full bg-white relative`}
        >
          {activeFriend ? (
            <>
              {/* Active Header */}
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/10">
                <div className="flex items-center gap-3">
                  {/* Backward arrow on mobile layout */}
                  <button
                    id="btn-back-chat-list"
                    onClick={() => setActiveChatFriendId(null)}
                    className="md:hidden p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  
                  <Avatar avatarId={activeFriend.avatar} name={activeFriend.username} size="sm" />
                  
                  <div>
                    <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                      <span>{activeFriend.username}</span>
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-sm animate-pulse"></span>
                    </h4>
                    <p className="text-[9px] text-slate-400 font-mono">@{activeFriend.id}</p>
                  </div>
                </div>

                {/* Status Indicator */}
                <span className="hidden sm:inline-flex items-center text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  Trực tuyến
                </span>
              </div>

              {/* Chat Message List Flow */}
              <div id="chat-messages-flow" className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/20 scrollbar-thin">
                {activeMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-2">
                    <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                      <Sparkles size={18} />
                    </div>
                    <span className="block text-xs font-semibold text-slate-700">Khởi đầu câu chuyện</span>
                    <p className="text-[10px] text-slate-400 max-w-[220px]">
                      Hãy gửi lời chào đầu tiên đến {activeFriend.username} để thảo luận về các sở thích tuyệt vời nào!
                    </p>
                  </div>
                ) : (
                  activeMessages.map((msg) => {
                    const isSelf = msg.senderId === currentUser.id;
                    return (
                      <div
                        id={`chat-msg-row-${msg.id}`}
                        key={msg.id}
                        className={`flex gap-2.5 max-w-[85%] ${isSelf ? 'ml-auto flex-row-reverse' : ''}`}
                      >
                        {!isSelf && (
                          <Avatar avatarId={activeFriend.avatar} name={activeFriend.username} size="sm" className="mt-0.5" />
                        )}
                        <div>
                          <div
                            className={`p-3 rounded-2xl text-xs leading-relaxed ${
                              isSelf
                                ? 'bg-blue-600 text-white rounded-tr-none shadow-sm shadow-blue-100/50'
                                : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
                            }`}
                          >
                            {msg.content}
                          </div>
                          <span
                            className={`block text-[8px] text-slate-400 mt-1 font-mono ${
                              isSelf ? 'text-right' : ''
                            }`}
                          >
                            {new Date(msg.timestamp).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex gap-2.5 max-w-[80%] items-center">
                    <Avatar avatarId={activeFriend.avatar} name={activeFriend.username} size="sm" className="mt-0.5" />
                    <div className="bg-slate-100/80 px-3 py-2.5 rounded-2xl rounded-tl-none flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce"></span>
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce delay-150"></span>
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce delay-300"></span>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <form 
                onSubmit={handleSendSubmit} 
                className="p-3 border-t border-slate-200 flex items-center gap-2 bg-white"
              >
                <input
                  id="input-chat-message"
                  type="text"
                  placeholder={`Gửi cuộc trò chuyện tới ${activeFriend.username.split(' ').pop()}...`}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50/30"
                />
                <button
                  id="btn-chat-send-submit"
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-300 text-white rounded-xl transition-all overflow-hidden flex items-center justify-center cursor-pointer shadow-sm shadow-blue-100/50"
                >
                  <Send size={14} />
                </button>
              </form>
            </>
          ) : (
            /* Blank Slate Chat Panel */
            <div id="chat-blank-slate" className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50/10 text-center space-y-3">
              <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                <MessageSquare size={22} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-800">Không có đoạn hội thoại nào đang mở</h4>
                <p className="text-xs text-slate-400 max-w-[280px] mx-auto mt-1 leading-normal">
                  Vui lòng chọn một người bạn từ hàng cột bên trái để bắt đầu nhắn tin thời gian thực!
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
