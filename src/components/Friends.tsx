/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Friendship, Hobby } from '../types';
import Avatar from './Avatar';
import { 
  UserPlus, 
  UserCheck, 
  UserX, 
  Clock, 
  Search, 
  Sparkles, 
  Check, 
  MessageSquare,
  Compass
} from 'lucide-react';

interface FriendsProps {
  currentUser: User;
  allUsers: User[];
  friendships: Friendship[];
  onSendRequest: (receiverId: string) => void;
  onAcceptRequest: (friendshipId: string) => void;
  onDeclineRequest: (friendshipId: string) => void;
  onNavigateToChat: (friendId: string) => void;
}

export default function Friends({
  currentUser,
  allUsers,
  friendships,
  onSendRequest,
  onAcceptRequest,
  onDeclineRequest,
  onNavigateToChat,
}: FriendsProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Get list of friends (accepted connections)
  const getFriendList = (): User[] => {
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

  // Get pending received requests
  const getPendingReceivedRequests = (): { friendshipId: string; user: User }[] => {
    return friendships
      .filter((f) => f.user2Id === currentUser.id && f.status === 'pending')
      .map((f) => {
        const user = allUsers.find((u) => u.id === f.user1Id);
        return { friendshipId: f.id, user: user! };
      })
      .filter((item) => item.user && !item.user.isBanned);
  };

  // Get pending sent requests
  const getPendingSentRequests = (): User[] => {
    return allUsers.filter((user) => {
      const relation = friendships.find(
        (f) =>
          f.user1Id === currentUser.id &&
          f.user2Id === user.id &&
          f.status === 'pending'
      );
      return !!relation && !user.isBanned;
    });
  };

  // Helpers to check status with an individual user
  const getFriendshipStatus = (userId: string): 'none' | 'pending_sent' | 'pending_received' | 'accepted' => {
    const relation = friendships.find(
      (f) =>
        (f.user1Id === currentUser.id && f.user2Id === userId) ||
        (f.user2Id === currentUser.id && f.user1Id === userId)
    );
    if (!relation) return 'none';
    if (relation.status === 'accepted') return 'accepted';
    if (relation.status === 'pending') {
      return relation.senderId === currentUser.id ? 'pending_sent' : 'pending_received';
    }
    return 'none';
  };

  // Smart Friend Recommendations System:
  // - Filters out current user, banned users, and anyone currently connected/pending
  // - Calculates matching score based on intersection over union of hobbies
  // - Displays shared hobbies and scores
  const getSmartRecommendations = (): { user: User; matchScore: number; commonHobbies: Hobby[] }[] => {
    return allUsers
      .filter((user) => {
        if (user.id === currentUser.id || user.isBanned) return false;
        // Exclude precompiled mock users so recommendations only contain real/new accounts
        if (['admin', 'hoang_tech', 'vy_acoustic', 'nam_sport', 'thao_cinema'].includes(user.id)) return false;
        const status = getFriendshipStatus(user.id);
        return status === 'none'; // Only suggest people with absolutely no social request in progress
      })
      .map((user) => {
        const commonHobbies = user.hobbies ? user.hobbies.filter((h) => currentUser.hobbies ? currentUser.hobbies.includes(h) : false) : [];
        const allUniqueHobbies = Array.from(new Set([...(currentUser.hobbies || []), ...(user.hobbies || [])]));
        
        let matchScore = 0;
        if (allUniqueHobbies.length > 0) {
          matchScore = Math.round((commonHobbies.length / allUniqueHobbies.length) * 100);
        }

        return { user, matchScore, commonHobbies };
      })
      // Sort: highest matching percentage first.
      // If score is 0, give some default seed ranking, let's keep it sorted by score descending
      .sort((a, b) => b.matchScore - a.matchScore);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Search Results
  // Filter all users by name or unique ID
  const searchResults = allUsers.filter((user) => {
    if (user.id === currentUser.id || user.isBanned) return false;
    // Exclude precompiled mock users
    if (['admin', 'hoang_tech', 'vy_acoustic', 'nam_sport', 'thao_cinema'].includes(user.id)) return false;
    if (!searchQuery.trim()) return false;
    const query = searchQuery.toLowerCase();
    return (
      user.username.toLowerCase().includes(query) ||
      user.id.toLowerCase().includes(query)
    );
  });

  const friends = getFriendList();
  const pendingReceived = getPendingReceivedRequests();
  const pendingSent = getPendingSentRequests();
  const recommendations = getSmartRecommendations();

  return (
    <div id="friends-view-container" className="max-w-4xl mx-auto py-6 px-4 space-y-6 pb-24 md:pb-6">
      
      {/* SEARCH BAR PANEL */}
      <div id="friends-search-panel" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3.5">
        <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
          <Search size={16} className="text-blue-600" />
          <span>Tìm kiếm bạn bè</span>
        </h3>
        <p className="text-xs text-slate-500 leading-normal">
          Kết nối với bạn bè xung quanh bạn bằng cách tìm kiếm Tên hiển thị đầy đủ hoặc mã ID cá nhân (ví dụ: <code className="bg-slate-100 text-blue-700 px-1 py-0.5 rounded font-mono text-[10px]">@hoang_tech</code>).
        </p>

        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
            <Search size={16} />
          </span>
          <input
            id="input-friends-search"
            type="text"
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
            placeholder="Nhập tên đăng nhập hoặc ID..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>

        {/* Search Results Display */}
        {searchQuery.trim() && (
          <div id="search-results-list" className="pt-3 border-t border-slate-50 space-y-3">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Kết quả tìm kiếm ({searchResults.length})
            </h4>
            {searchResults.length === 0 ? (
              <p className="text-xs text-slate-500 italic">Không mỉm thấy người dùng nào khớp với kết quả tìm kiếm của bạn.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {searchResults.map((user) => {
                  const status = getFriendshipStatus(user.id);
                  return (
                    <div 
                      id={`search-card-${user.id}`}
                      key={user.id} 
                      className="flex items-center justify-between p-3 bg-blue-50/20 border border-blue-100/30 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar avatarId={user.avatar} name={user.username} size="sm" />
                        <div className="overflow-hidden">
                          <p className="font-bold text-slate-800 text-xs truncate">{user.username}</p>
                          <p className="text-[10px] text-slate-400 font-mono">@{user.id}</p>
                        </div>
                      </div>

                      {/* Action buttons based on social relationship status */}
                      <div className="flex-shrink-0">
                        {status === 'none' && (
                          <button
                            id={`btn-add-friend-search-${user.id}`}
                            onClick={() => onSendRequest(user.id)}
                            className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs cursor-pointer flex items-center gap-1 transition-all"
                          >
                            <UserPlus size={12} />
                            <span>Kết bạn</span>
                          </button>
                        )}
                        {status === 'pending_sent' && (
                          <span className="text-[10px] text-amber-600 font-semibold bg-amber-50 px-2 py-1 rounded-lg flex items-center gap-1">
                            <Clock size={11} /> Đã gửi
                          </span>
                        )}
                        {status === 'pending_received' && (
                          <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-2 py-1 rounded-lg">
                            Chờ bạn đồng ý
                          </span>
                        )}
                        {status === 'accepted' && (
                          <button
                            id={`btn-chat-search-${user.id}`}
                            onClick={() => onNavigateToChat(user.id)}
                            className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1 transition-all"
                          >
                            <MessageSquare size={12} />
                            <span>Nhắn tin</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* TWO-COLUMN GRID FOR RECOMMENDATIONS & PENDING REQUESTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* RECOMMENDATIONS (SMART SYSTEM) - COLUMN LEFT/CENTER (Takes 2 span) */}
        <div id="smart-recommendations-panel" className="lg:col-span-2 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <Compass size={16} className="text-blue-500 animate-pulse" />
                <span>Gợi ý kết bạn</span>
              </h3>
            </div>
            
            <p className="text-xs text-slate-500 leading-normal">
              Danh sách gợi ý thành viên trong gia đình đang hoạt động trên hệ thống. Hãy gửi lời mời kết nối để trò chuyện và cập nhật các khoảnh khắc chia sẻ của nhau!
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recommendations.length === 0 ? (
                <div className="col-span-2 py-8 text-center text-slate-400 text-xs italic">
                  Không còn gợi ý mới nào phù hợp hiện tại! Bạn đã kết nối với tất cả mọi người.
                </div>
              ) : (
                recommendations.map(({ user, matchScore, commonHobbies }) => (
                  <div
                    id={`recommendation-card-${user.id}`}
                    key={user.id}
                    className="border border-slate-200 hover:border-blue-100/80 p-4 rounded-xl flex flex-col justify-between bg-slate-50/20 hover:bg-blue-50/5 transition-all"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Avatar avatarId={user.avatar} name={user.username} size="sm" />
                          <div className="overflow-hidden">
                            <div className="flex items-center gap-1">
                              <p className="font-bold text-slate-800 text-xs truncate">{user.username}</p>
                              {user.role === 'admin' && (
                                <span className="bg-blue-100 text-blue-800 text-[8px] font-bold px-1.5 py-0.2 rounded">Admin</span>
                              )}
                            </div>
                            <p className="text-[9px] text-slate-400 font-mono">@{user.id}</p>
                          </div>
                        </div>
                      </div>

                      {/* Small bio snippet */}
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {user.bio}
                      </p>

                      {/* Shared interest tags */}
                      {commonHobbies.length > 0 ? (
                        <div className="space-y-1">
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Sở thích chung:</span>
                          <div className="flex flex-wrap gap-1">
                            {commonHobbies.map((hobby) => (
                              <span 
                                key={hobby} 
                                className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-[9px] font-medium"
                              >
                                {hobby}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        user.hobbies && user.hobbies.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Sở thích:</span>
                            <div className="flex flex-wrap gap-1">
                              {user.hobbies.slice(0, 3).map((hobby) => (
                                <span 
                                  key={hobby} 
                                  className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[9px] font-medium"
                                >
                                  {hobby}
                                </span>
                              ))}
                            </div>
                          </div>
                        )
                      )}
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-150 flex justify-end">
                      <button
                        id={`btn-add-friend-rec-${user.id}`}
                        onClick={() => onSendRequest(user.id)}
                        className="w-full flex items-center justify-center gap-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                      >
                        <UserPlus size={11} />
                        <span>Gửi lời mời kết bạn</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* PENDING RECEIVED & SENT REQUESTS - COLUMN RIGHT (Takes 1 span) */}
        <div id="pending-requests-column" className="space-y-4">
          
          {/* LIST RECEIVED REQUESTS */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-800">Lời mời kết bạn ({pendingReceived.length})</h3>
            {pendingReceived.length === 0 ? (
              <p className="text-xs text-slate-400 py-2 italic text-center">Không có lời mời kết bạn mới.</p>
            ) : (
              <div className="space-y-3.5">
                {pendingReceived.map(({ friendshipId, user }) => (
                  <div 
                    id={`received-invite-${user.id}`}
                    key={friendshipId} 
                    className="flex flex-col gap-2.5 p-3 bg-blue-50/10 border border-blue-100/20 rounded-xl"
                  >
                    <div className="flex items-center gap-2">
                       <Avatar avatarId={user.avatar} name={user.username} size="sm" />
                      <div className="overflow-hidden">
                        <p className="font-bold text-slate-800 text-xs truncate">{user.username}</p>
                        <p className="text-[9px] text-slate-400 font-mono">@{user.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        id={`btn-accept-request-${user.id}`}
                        onClick={() => onAcceptRequest(friendshipId)}
                        className="flex-1 py-1 px-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors flex items-center justify-center gap-1"
                      >
                        <Check size={11} /> Chấp nhận
                      </button>
                      <button
                        id={`btn-decline-request-${user.id}`}
                        onClick={() => onDeclineRequest(friendshipId)}
                        className="py-1 px-2.5 border border-slate-200 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-lg text-[10px] font-medium cursor-pointer transition-colors"
                      >
                        Từ chối
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* LIST SENT REQUESTS */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-800">Yêu cầu đã gửi ({pendingSent.length})</h3>
            {pendingSent.length === 0 ? (
              <p className="text-xs text-slate-400 py-2 italic text-center">Không có yêu cầu kết bạn nào đang chờ phản hồi.</p>
            ) : (
              <div className="space-y-3">
                {pendingSent.map((user) => (
                  <div id={`sent-invite-${user.id}`} key={user.id} className="flex items-center justify-between p-2.5 bg-slate-50/50 rounded-xl border border-slate-50">
                    <div className="flex items-center gap-2">
                      <Avatar avatarId={user.avatar} name={user.username} size="sm" />
                      <div className="overflow-hidden">
                        <p className="font-bold text-slate-700 text-xs truncate">{user.username}</p>
                        <p className="text-[9px] text-slate-400 font-mono">@{user.id}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Clock size={10} /> Đợi duyệt
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* REGULAR ACCEPTED FRIENDS LIST PANEL */}
      <div id="active-friends-list-panel" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-slate-800">Danh sách bạn bè ({friends.length})</h3>
        {friends.length === 0 ? (
          <div className="py-10 text-center">
            <span className="text-slate-400 block text-xs font-semibold mb-1">Chưa có bạn bè nào</span>
            <p className="text-[11px] text-slate-400">
              Hãy tham khảo danh sách thành viên bên trên hoặc tìm kiếm để tạo nên những kết nối bạn bè mới nhé!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {friends.map((user) => (
              <div
                id={`friend-card-${user.id}`}
                key={user.id}
                className="p-4 border border-slate-200 rounded-xl flex items-center justify-between bg-slate-50/25 group transition-colors hover:border-slate-300"
              >
                <div className="flex items-center gap-3">
                  <Avatar avatarId={user.avatar} name={user.username} size="sm" />
                  <div className="overflow-hidden">
                    <p className="font-bold text-slate-800 text-xs truncate">{user.username}</p>
                    <p className="text-[9px] text-slate-400 font-mono">@{user.id}</p>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5 max-w-[150px]">{user.bio}</p>
                  </div>
                </div>

                <div className="flex-shrink-0 ml-2">
                  <button
                    id={`btn-friend-chat-action-${user.id}`}
                    onClick={() => onNavigateToChat(user.id)}
                    title="Mở cuộc trò chuyện thời gian thực"
                    className="p-2 bg-blue-50 group-hover:bg-blue-600 group-hover:text-white text-blue-700 rounded-xl transition-all cursor-pointer"
                  >
                    <MessageSquare size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
