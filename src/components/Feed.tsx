/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Post, Comment } from '../types';
import Avatar from './Avatar';
import { 
  Heart, 
  MessageSquare, 
  Send, 
  Globe2, 
  Lock, 
  Image, 
  Trash2, 
  AlertTriangle, 
  Search, 
  X,
  Share2
} from 'lucide-react';

interface FeedProps {
  currentUser: User;
  posts: Post[];
  onAddPost: (content: string, image: string, visibility: 'public' | 'private') => void;
  onLikePost: (postId: string) => void;
  onAddComment: (postId: string, content: string) => void;
  onDeletePost: (postId: string) => void;
  onReportPost: (postId: string, reason: string) => void;
}

export default function Feed({
  currentUser,
  posts,
  onAddPost,
  onLikePost,
  onAddComment,
  onDeletePost,
  onReportPost,
}: FeedProps) {
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  
  // Comment states mapped by postId
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  
  // Custom dialogs or state for reporting
  const [reportingPostId, setReportingPostId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('');

  // Handle uploaded local file and read as Base64 for instant preview in feed
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImage('');
    setImagePreview(null);
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !image) return;
    
    onAddPost(content, image, visibility);
    setContent('');
    setImage('');
    setImagePreview(null);
  };

  const handleCommentSubmit = (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    const commentText = commentInputs[postId];
    if (!commentText || !commentText.trim()) return;

    onAddComment(postId, commentText.trim());
    setCommentInputs({ ...commentInputs, [postId]: '' });
  };

  const handleCancelReport = () => {
    setReportingPostId(null);
    setReportReason('');
  };

  const handleSubmitReport = () => {
    if (reportingPostId && reportReason.trim()) {
      onReportPost(reportingPostId, reportReason.trim());
      setReportingPostId(null);
      setReportReason('');
    }
  };

  // Filter posts keeping visibility in account:
  // - Public posts from anyone are visible to everyone
  // - Private posts are ONLY visible if they belong to the current user
  const visiblePosts = posts.filter((post) => {
    const hasAccess = post.visibility === 'public' || post.authorId === currentUser.id;
    if (!hasAccess) return false;

    // Search query matches
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const contentMatch = post.content.toLowerCase().includes(query);
      const nameMatch = post.authorName.toLowerCase().includes(query);
      return contentMatch || nameMatch;
    }
    return true;
  });

  return (
    <div id="feed-container" className="max-w-2xl mx-auto py-6 px-4 space-y-6 pb-24 md:pb-6">
      
      {/* SEARCH AND FEED STATUS HEADER */}
      <div id="feed-search-header" className="bg-white p-4 rounded-2xl border border-slate-100 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Search size={16} />
          </span>
          <input
            id="input-search-feed"
            type="text"
            placeholder="Tìm kiếm bài viết hoặc tác giả..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-9 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
          />
          {searchQuery && (
            <button
              id="btn-clear-search"
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* POST COMPOSER */}
      <div id="post-composer-card" className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex gap-3">
          <Avatar avatarId={currentUser.avatar} name={currentUser.username} size="md" />
          <div className="flex-1">
            <form onSubmit={handleCreatePost}>
              <textarea
                id="input-post-content"
                rows={3}
                placeholder={`Chào ${currentUser.username.split(' ').pop()}! Hôm nay bạn có chia sẻ điều gì mới không?`}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full text-slate-800 placeholder-slate-400 border-0 focus:ring-0 focus:outline-none text-sm resize-none"
              />

              {/* Dynamic Image Preview */}
              {imagePreview && (
                <div id="composer-image-preview-container" className="relative mt-3 rounded-2xl overflow-hidden border border-slate-100 group">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    referrerPolicy="no-referrer"
                    className="max-h-60 w-full object-cover"
                  />
                  <button
                    id="btn-composer-clear-image"
                    type="button"
                    onClick={clearImage}
                    className="absolute top-2 right-2 p-1.5 bg-slate-900/70 text-white rounded-full hover:bg-slate-900 transition-colors cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Actions & Settings Toolbar */}
              <div className="flex items-center justify-between border-t border-slate-50 pt-4 mt-3">
                <div className="flex items-center gap-2">
                  
                  {/* Photo Upload Trigger */}
                  <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-500 hover:bg-slate-50 text-xs font-medium cursor-pointer transition-colors">
                    <Image size={15} className="text-emerald-500" />
                    <span>Thêm ảnh</span>
                    <input
                      id="input-composer-file"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>

                  {/* Public/Private visibility Selector */}
                  <div className="relative">
                    <button
                      id="btn-composer-visibility-toggle"
                      type="button"
                      onClick={() => setVisibility(visibility === 'public' ? 'private' : 'public')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-500 hover:bg-slate-50 text-xs font-medium cursor-pointer transition-colors"
                    >
                      {visibility === 'public' ? (
                        <>
                          <Globe2 size={15} className="text-blue-500" />
                          <span>Công khai</span>
                        </>
                      ) : (
                        <>
                          <Lock size={15} className="text-amber-500" />
                          <span>Riêng tư</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <button
                  id="btn-composer-submit"
                  type="submit"
                  disabled={!content.trim() && !image}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 shadow-sm shadow-blue-100 cursor-pointer"
                >
                  <span>Chia sẻ</span>
                  <Send size={12} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* FEED TIMELINE */}
      <div id="feed-timeline-list" className="space-y-4">
        {visiblePosts.length === 0 ? (
          <div className="bg-white py-12 px-4 rounded-2xl text-center border border-slate-200">
            <span className="text-slate-400 block text-sm font-medium mb-1">
              {searchQuery ? 'Không tìm thấy kết quả phù hợp' : 'Không có bài đăng nào mới'}
            </span>
            <p className="text-xs text-slate-400">
              {searchQuery ? 'Hãy thay đổi từ khóa tìm kiếm khác.' : 'Trở thành người đầu tiên tương tác đăng bài viết nha!'}
            </p>
          </div>
        ) : (
          visiblePosts.map((post) => {
            const isLiked = post.likes.includes(currentUser.id);
            return (
              <article
                id={`article-post-${post.id}`}
                key={post.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 transition-all hover:border-slate-300"
              >
                {/* Post Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar avatarId={post.authorAvatar} name={post.authorName} size="md" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-slate-800">{post.authorName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">@{post.authorId}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-medium mt-0.5">
                        <span>{new Date(post.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} • {new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                        <span>•</span>
                        {post.visibility === 'public' ? (
                          <span className="flex items-center gap-0.5"><Globe2 size={10} /> Công khai</span>
                        ) : (
                          <span className="flex items-center gap-0.5 text-amber-500"><Lock size={10} /> Riêng tư</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions dropdown/buttons */}
                  <div className="flex items-center gap-1">
                    {/* Delete button option */}
                    {(post.authorId === currentUser.id || currentUser.role === 'admin') && (
                      <button
                        id={`btn-delete-${post.id}`}
                        onClick={() => onDeletePost(post.id)}
                        title="Xóa bài viết"
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}

                    {/* Report button option */}
                    {post.authorId !== currentUser.id && (
                      <button
                        id={`btn-open-report-${post.id}`}
                        onClick={() => setReportingPostId(post.id)}
                        title="Báo cáo bài viết vi phạm"
                        className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors cursor-pointer"
                      >
                        <AlertTriangle size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Post Main Body */}
                <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </div>

                {/* Attached illustrative image */}
                {post.image && (
                  <div className="rounded-2xl overflow-hidden border border-slate-50 bg-slate-50 max-h-96 flex items-center justify-center">
                    <img
                      src={post.image}
                      alt="Hình ảnh bài đăng"
                      referrerPolicy="no-referrer"
                      className="w-full object-cover max-h-96"
                    />
                  </div>
                )}

                {/* Social Actions Panel */}
                <div className="flex items-center gap-6 pt-3 border-t border-slate-50 text-xs font-semibold text-slate-500">
                  <button
                    id={`btn-like-${post.id}`}
                    onClick={() => onLikePost(post.id)}
                    className={`flex items-center gap-1.5 p-1 hover:text-rose-600 transition-colors cursor-pointer ${
                      isLiked ? 'text-rose-600' : ''
                    }`}
                  >
                    <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
                    <span>{post.likes.length} Thích</span>
                  </button>

                  <div className="flex items-center gap-1.5 py-1">
                    <MessageSquare size={16} className="text-slate-400" />
                    <span>{post.comments.length} Bình luận</span>
                  </div>
                </div>

                {/* COMMENTS SECTION */}
                <div className="space-y-3 bg-slate-50/50 p-3.5 rounded-2xl border border-slate-50/70">
                  {post.comments.length > 0 && (
                    <div className="space-y-2.5">
                      {post.comments.map((comment) => (
                        <div id={`comment-${comment.id}`} key={comment.id} className="flex gap-2.5 text-xs">
                          <Avatar avatarId={comment.authorAvatar} name={comment.authorName} size="sm" />
                          <div className="flex-1 bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm leading-normal">
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="font-bold text-slate-700">{comment.authorName}</span>
                              <span className="text-[9px] text-slate-400">
                                {new Date(comment.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-slate-600">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Comment Input Box */}
                  <form onSubmit={(e) => handleCommentSubmit(post.id, e)} className="flex gap-2.5 items-center mt-2 pt-2 border-t border-slate-100/50">
                    <Avatar avatarId={currentUser.avatar} name={currentUser.username} size="sm" />
                    <input
                      id={`input-comment-text-${post.id}`}
                      type="text"
                      placeholder="Viết phản hồi hoặc bình luận..."
                      value={commentInputs[post.id] || ''}
                      onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    />
                    <button
                      id={`btn-comment-submit-${post.id}`}
                      type="submit"
                      disabled={!(commentInputs[post.id] || '').trim()}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl disabled:text-slate-300 disabled:hover:bg-transparent cursor-pointer transition-colors"
                    >
                      <Send size={13} />
                    </button>
                  </form>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* MODAL BÁO CÁO VI PHẠM (REPORT SYSTEM) */}
      {reportingPostId && (
        <div id="report-modal-overlay" className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div id="report-modal-content" className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-slate-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2 text-amber-500 font-bold text-sm">
              <AlertTriangle size={20} />
              <span>Báo cáo bài viết này</span>
            </div>
            
            <p className="text-xs text-slate-500 leading-normal">
              Chúng tôi luôn nỗ lực xây dựng một môi trường văn minh, tôn trọng. Vui lòng cho biết lý do bạn muốn báo cáo bài viết này:
            </p>

            <textarea
              id="input-report-reason"
              rows={3}
              placeholder="Ví dụ: Spam, Từ ngữ thù ghét, thông tin sai sự thật..."
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full text-slate-800 placeholder-slate-400 border border-slate-200 rounded-xl p-2.5 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                id="btn-report-cancel"
                onClick={handleCancelReport}
                className="px-3.5 py-1.5 border border-slate-200 text-slate-500 text-xs font-semibold rounded-xl hover:bg-slate-50 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                id="btn-report-submit"
                onClick={handleSubmitReport}
                disabled={!reportReason.trim()}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white text-xs font-semibold rounded-xl cursor-pointer"
              >
                Gửi báo cáo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
