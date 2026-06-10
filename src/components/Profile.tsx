/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Post, Hobby } from '../types';
import { HOBBIES_LIST } from '../data';
import Avatar from './Avatar';
import { 
  User as UserIcon, 
  Mail, 
  MapPin, 
  Sparkles, 
  Edit2, 
  Check, 
  X, 
  Globe2, 
  Lock, 
  Heart, 
  MessageSquare, 
  CalendarDays,
  FileEdit,
  Camera
} from 'lucide-react';

interface ProfileProps {
  currentUser: User;
  posts: Post[];
  onUpdateUser: (updatedUser: User) => void;
  onLikePost: (postId: string) => void;
  onDeletePost: (postId: string) => void;
}

export default function Profile({
  currentUser,
  posts,
  onUpdateUser,
  onLikePost,
  onDeletePost,
}: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(currentUser.username);
  const [bio, setBio] = useState(currentUser.bio);
  const [hobbies, setHobbies] = useState<Hobby[]>(currentUser.hobbies);
  const [avatar, setAvatar] = useState(currentUser.avatar);

  // Filter posts created exclusively by the current user
  const myPosts = posts.filter((post) => post.authorId === currentUser.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleHobby = (hobby: Hobby) => {
    if (hobbies.includes(hobby)) {
      setHobbies(hobbies.filter((h) => h !== hobby));
    } else {
      setHobbies([...hobbies, hobby]);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: User = {
      ...currentUser,
      username: username.trim(),
      bio: bio.trim(),
      hobbies: hobbies,
      avatar: avatar,
    };
    onUpdateUser(updated);
    setIsEditing(false);
  };

  return (
    <div id="profile-view-container" className="max-w-3xl mx-auto py-6 px-4 space-y-6 pb-24 md:pb-6 animate-in fade-in duration-200">
      
      {/* PROFILE COVER BOX */}
      <div id="profile-card-cover" className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Modern styled mesh-like gradient cover background */}
        <div id="profile-cover-mesh" className="h-32 bg-gradient-to-r from-blue-500 via-sky-500 to-blue-600 relative opacity-90" />

        <div className="px-6 pb-6 relative">
          
          {/* Cover Profile pic overlapping */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between -mt-12 sm:gap-4 mb-4">
            <div className="relative group">
              <Avatar avatarId={avatar} name={currentUser.username} size="xl" className="border-4 border-white shadow-md bg-white" />
              {isEditing && (
                <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white cursor-pointer group-hover:bg-black/50 transition-colors">
                  <Camera size={18} />
                  <input
                    id="input-avatar-profile"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Edit / Cancel Profile button toggles */}
            <div className="mt-4 sm:mt-0">
              {!isEditing ? (
                <button
                  id="btn-edit-profile-toggle"
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-blue-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Edit2 size={13} />
                  <span>Sửa trang cá nhân</span>
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    id="btn-cancel-profile-edit"
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setUsername(currentUser.username);
                      setBio(currentUser.bio);
                      setHobbies(currentUser.hobbies);
                      setAvatar(currentUser.avatar);
                    }}
                    className="px-3.5 py-2 border border-slate-200 text-slate-500 text-xs font-semibold rounded-xl hover:bg-slate-50 cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    id="btn-save-profile-edit"
                    type="button"
                    onClick={handleSaveProfile}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                  >
                    <Check size={13} />
                    <span>Lưu lại</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* MAIN BIO CONTENT */}
          {!isEditing ? (
            <div className="space-y-4">
              <div>
                <h2 id="profile-display-name" className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span>{currentUser.username}</span>
                  {currentUser.role === 'admin' && (
                    <span className="bg-blue-100 text-blue-700 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                      Admin
                    </span>
                  )}
                </h2>
                <p id="profile-display-id" className="text-xs text-slate-400 font-mono mt-0.5">@{currentUser.id}</p>
              </div>

              <p id="profile-display-bio" className="text-xs text-slate-600 leading-relaxed max-w-xl">
                {currentUser.bio}
              </p>

              {/* Sub items */}
              <div id="profile-sub-details" className="flex flex-wrap items-center gap-4 text-[10px] text-slate-400 font-medium">
                <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg">
                  <Mail size={12} className="text-slate-400" />
                  <span>{currentUser.email}</span>
                </span>
                <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg">
                  <CalendarDays size={12} className="text-slate-400" />
                  <span>Tham gia từ: {new Date(currentUser.createdAt).toLocaleDateString('vi-VN')}</span>
                </span>
              </div>

              {/* Interests list */}
              <div id="profile-interests-display" className="space-y-2 pt-3 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  Sở thích cá nhân
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {currentUser.hobbies.length === 0 ? (
                    <span className="text-xs text-slate-400 italic">Chưa khai báo sở thích cá nhân.</span>
                  ) : (
                    currentUser.hobbies.map((hobby) => (
                      <span
                        key={hobby}
                        className="px-3 py-1 bg-blue-50 text-blue-700 font-medium text-[10px] rounded-full flex items-center gap-1 ring-1 ring-blue-105"
                      >
                        <Sparkles size={9} />
                        <span>{hobby}</span>
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* EDIT FORM INSIDE PROFILE SCREEN */
            <form onSubmit={handleSaveProfile} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Họ tên hiển thị</label>
                  <input
                    id="edit-profile-username-input"
                    type="text"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mã ID cá nhân (Vô hiệu chỉnh sửa)</label>
                  <input
                    type="text"
                    disabled
                    className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-400 bg-slate-50 font-mono"
                    value={`@${currentUser.id}`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tiểu sử cá nhân</label>
                <textarea
                  id="edit-profile-bio-input"
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>

              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Chỉnh sửa sở thích cá nhân</span>
                <div className="flex flex-wrap gap-1.5">
                  {HOBBIES_LIST.map((hobby) => {
                    const isSelected = hobbies.includes(hobby);
                    return (
                      <button
                        id={`btn-profile-edit-hobby-${hobby}`}
                        key={hobby}
                        type="button"
                        onClick={() => toggleHobby(hobby)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-sm shadow-blue-100/50'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {hobby}
                      </button>
                    );
                  })}
                </div>
              </div>
            </form>
          )}

        </div>
      </div>

      {/* OWN POSTS TIMELINE */}
      <div id="profile-posts-wrapper" className="space-y-4">
        <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">
          Bài đăng của bạn ({myPosts.length})
        </h3>

        {myPosts.length === 0 ? (
          <div className="bg-white py-12 px-4 rounded-3xl border border-slate-200 text-center shadow-sm">
            <span className="text-slate-400 block text-xs font-semibold mb-1">Bạn chưa viết bài đăng nào</span>
            <p className="text-[11px] text-slate-400">Hãy vào thẻ Trang chủ và chia sẻ những dòng nhật ký đầy ý nghĩa nào!</p>
          </div>
        ) : (
          myPosts.map((post) => (
            <article
              id={`profile-post-card-${post.id}`}
              key={post.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 transition-all hover:border-slate-300"
            >
              {/* Post Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar avatarId={currentUser.avatar} name={currentUser.username} size="sm" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-slate-800">{currentUser.username}</span>
                      <span className="text-[9px] text-slate-400 font-mono">@{currentUser.id}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[9px] text-slate-400 font-semibold mt-0.5">
                      <span>{new Date(post.createdAt).toLocaleTimeString('vi-VN')} • {new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                      <span>•</span>
                      {post.visibility === 'public' ? (
                        <span className="flex items-center gap-0.5"><Globe2 size={9} /> Công khai</span>
                      ) : (
                        <span className="flex items-center gap-0.5 text-amber-500"><Lock size={9} /> Riêng tư</span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  id={`btn-profile-delete-${post.id}`}
                  onClick={() => onDeletePost(post.id)}
                  title="Xóa bài đăng này"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                >
                  <Trash2Icon size={14} />
                </button>
              </div>

              {/* Body */}
              <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">{post.content}</p>

              {/* Photo attached */}
              {post.image && (
                <div className="rounded-2xl overflow-hidden border border-slate-50 max-h-80 flex items-center justify-center bg-slate-50">
                  <img
                    src={post.image}
                    alt="Bài đăng cá nhân"
                    referrerPolicy="no-referrer"
                    className="w-full object-cover max-h-80"
                  />
                </div>
              )}

              {/* Static Panel Stats summary */}
              <div className="flex items-center gap-4 pt-3 border-t border-slate-50 text-[10px] font-bold text-slate-400">
                <div className="flex items-center gap-1">
                  <Heart size={14} className="text-rose-500" fill="currentColor" />
                  <span>{post.likes.length} lượt thích</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare size={14} className="text-blue-500" />
                  <span>{post.comments.length} bình luận viết phản hồi</span>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

    </div>
  );
}

// Quick custom Garbage trash icon since Trash2 is in lucide, let's keep references correct
function Trash2Icon({ size, className = '' }: { size: number; className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}
