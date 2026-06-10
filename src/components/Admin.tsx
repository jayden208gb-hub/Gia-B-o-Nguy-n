/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Post, Report } from '../types';
import Avatar from './Avatar';
import { 
  ShieldCheck, 
  Users, 
  FileText, 
  MessageSquare, 
  AlertOctagon, 
  CheckCircle2, 
  Slash,
  TrendingUp,
  XCircle,
  Eye,
  Trash2
} from 'lucide-react';

interface AdminProps {
  currentUser: User;
  allUsers: User[];
  posts: Post[];
  reports: Report[];
  onToggleBanUser: (userId: string) => void;
  onResolveReport: (reportId: string) => void;
  onDeletePostAdmin: (postId: string, reportId?: string) => void;
}

export default function Admin({
  currentUser,
  allUsers,
  posts,
  reports,
  onToggleBanUser,
  onResolveReport,
  onDeletePostAdmin,
}: AdminProps) {
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'reports'>('stats');

  // Calculate high level metrics
  const totalUsers = allUsers.length;
  const bannedUsers = allUsers.filter(u => u.isBanned).length;
  const totalPosts = posts.length;
  const pendingReports = reports.filter(r => r.status === 'pending').length;

  // Compile data for interest (hobbies) popularity chart
  // This calculates how many users have checked each hobby
  const hobbyCounts: Record<string, number> = {};
  allUsers.forEach((user) => {
    user.hobbies.forEach((hobby) => {
      hobbyCounts[hobby] = (hobbyCounts[hobby] || 0) + 1;
    });
  });

  const hobbyChartData = Object.entries(hobbyCounts).map(([hobby, count]) => ({
    name: hobby,
    value: count,
  })).sort((a, b) => b.value - a.value);

  // Custom Inline SVG Bar Chart Renderer for high-fidelity responsive charts
  const renderHobbyChart = () => {
    if (hobbyChartData.length === 0) return <p className="text-xs text-slate-400 italic">Chưa đủ dữ liệu biểu phân tích.</p>;
    
    const maxValue = Math.max(...hobbyChartData.map(d => d.value), 1);
    
    return (
      <div className="space-y-3.5">
        <h4 className="text-xs font-bold text-slate-700">Phân bố sở thích thành viên (Dữ liệu thực tế)</h4>
        <div className="space-y-2.5">
          {hobbyChartData.map((data, idx) => {
            const percentage = (data.value / maxValue) * 100;
            return (
              <div key={data.name} className="space-y-1">
                <div className="flex justify-between text-xs text-slate-600 font-medium">
                  <span>{data.name}</span>
                  <span className="font-mono text-[11px] text-blue-700">{data.value} thành viên</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    style={{ width: `${percentage}%` }}
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div id="admin-view-container" className="max-w-5xl mx-auto py-6 px-4 space-y-6 pb-24 md:pb-6 animate-in fade-in duration-200">
      
      {/* HEADER ROW */}
      <div id="admin-header-card" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-800 tracking-tight flex items-center gap-2">
              <span>Bàn quản trị hệ thống (Admin Console)</span>
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Kiểm duyệt nội dung, quản lý người dùng và theo dõi chỉ số tăng trưởng</p>
          </div>
        </div>

        {/* Tab switcher navigation internal to Admin panel */}
        <div className="flex p-0.5 bg-slate-100 rounded-xl border border-slate-200/50">
          <button
            id="btn-admin-tab-stats"
            onClick={() => setActiveTab('stats')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              activeTab === 'stats' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            Chỉ số thống kê
          </button>
          <button
            id="btn-admin-tab-users"
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              activeTab === 'users' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            Thành viên ({totalUsers})
          </button>
          <button
            id="btn-admin-tab-reports"
            onClick={() => setActiveTab('reports')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer relative transition-all ${
              activeTab === 'reports' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            Báo cáo vi phạm
            {pendingReports > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white h-4 w-4 rounded-full text-[8px] font-bold flex items-center justify-center">
                {pendingReports}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* METRICS SUMMARY CARDS */}
      <div id="admin-metrics-row" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users size={18} />
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400">Thành viên</span>
            <span className="text-sm font-extrabold text-slate-800">{totalUsers}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <FileText size={18} />
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400">Số bài viết</span>
            <span className="text-sm font-extrabold text-slate-800">{totalPosts}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertOctagon size={18} />
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400">Báo cáo mới</span>
            <span className="text-sm font-extrabold text-slate-800">{pendingReports}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <XCircle size={18} />
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400">Đã khóa</span>
            <span className="text-sm font-extrabold text-slate-800">{bannedUsers} tài khoản</span>
          </div>
        </div>
      </div>

      {/* CORE ADMIN VIEW CONTENTS */}
      {activeTab === 'stats' && (
        <div id="admin-stats-flow" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Hobby Chart Bar section */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-blue-600" />
              <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Xu hướng & Sở thích</h3>
            </div>
            {renderHobbyChart()}
          </div>

          {/* Quick instructions and security audit lists */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Nguyên tắc kiểm duyệt nội dung</h3>
            <div className="space-y-3.5 text-xs text-slate-500 leading-normal">
              <div className="p-3 bg-blue-50/20 border border-blue-100/20 rounded-xl">
                <span className="font-bold text-slate-800 block mb-1">1. Tôn trọng cá nhân</span>
                <p>Khóa các tài khoản xúc phạm danh dự của thành viên khác hoặc chia sẻ ngôn ngữ kỳ thị thù ghét.</p>
              </div>
              <div className="p-3 bg-blue-50/20 border border-blue-100/20 rounded-xl">
                <span className="font-bold text-slate-800 block mb-1">2. Bài đăng giả mạo hoặc Spam</span>
                <p>Duyên duyệt kỹ các tin nhắn rác hoặc quảng cáo mạo danh lừa đảo để xóa bài viết và bảo vệ an toàn tối đa cho hệ thống.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div id="admin-users-flow" className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Danh sách thành viên đăng ký</h3>
          </div>
          
          <div className="divide-y divide-slate-100">
            {allUsers.map((user) => {
              const isAdmin = user.role === 'admin';
              return (
                <div 
                  id={`admin-user-row-${user.id}`}
                  key={user.id} 
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-medium"
                >
                  <div className="flex items-center gap-3">
                    <Avatar avatarId={user.avatar} name={user.username} size="sm" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-800 text-sm">{user.username}</span>
                        <span className="text-[10px] text-slate-400 font-mono">@{user.id}</span>
                        {isAdmin && (
                          <span className="bg-blue-100 text-blue-700 text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase">
                            Admin
                          </span>
                        )}
                        {user.isBanned && (
                          <span className="bg-rose-50 text-rose-600 text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase">
                            Đã khóa
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-[10px] font-mono mt-0.5">{user.email} • Đăng ký ngày: {new Date(user.createdAt).toLocaleDateString('vi-VN')}</p>
                    </div>
                  </div>

                  {/* Operational controls */}
                  <div className="flex-shrink-0">
                    {isAdmin ? (
                      <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">Không thể cấm Admin</span>
                    ) : (
                      <button
                        id={`btn-toggle-ban-${user.id}`}
                        onClick={() => onToggleBanUser(user.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                          user.isBanned
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                        }`}
                      >
                        {user.isBanned ? 'Xem xét mở khóa' : 'Khóa tài khoản'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div id="admin-reports-flow" className="space-y-4">
          {reports.length === 0 ? (
            <div className="bg-white py-14 p-4 rounded-3xl border border-slate-200 shadow-sm text-center">
              <span className="text-slate-400 block text-xs font-semibold mb-1">Hộp thư báo cáo trống</span>
              <p className="text-[11px] text-slate-400">Các báo động từ người dùng về nội dung vi phạm sẽ truyền tải tới bàn làm việc này.</p>
            </div>
          ) : (
            reports.map((report) => {
              // Find associated reported post details
              const reportPost = posts.find(p => p.id === report.postId);
              const reportedUser = allUsers.find(u => u.id === report.reportedUserId);
              const reporterUser = allUsers.find(u => u.id === report.reporterId);

              return (
                <div
                  id={`admin-report-card-${report.id}`}
                  key={report.id}
                  className="bg-white rounded-2xl border border-rose-100/50 p-5 shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${report.status === 'pending' ? 'bg-rose-500 animate-pulse' : 'bg-slate-300'}`}></span>
                      <span className="font-extrabold text-xs text-slate-800 uppercase">
                        BÁO CÁO VI PHẠM • {report.status === 'pending' ? 'Chưa giải quyết' : 'Đã phản hồi'}
                      </span>
                    </div>

                    {report.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          id={`btn-dismiss-report-${report.id}`}
                          onClick={() => onResolveReport(report.id)}
                          className="px-2.5 py-1.5 border border-slate-200 text-slate-500 rounded-xl text-[10px] font-bold hover:bg-slate-50 cursor-pointer transition-colors flex items-center gap-1"
                        >
                          <Slash size={11} /> <span>Bỏ qua báo cáo</span>
                        </button>
                        {reportPost && (
                          <button
                            id={`btn-enforce-delete-${report.id}`}
                            onClick={() => onDeletePostAdmin(reportPost.id, report.id)}
                            className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[10px] font-bold cursor-pointer transition-colors flex items-center gap-1"
                          >
                            <Trash2 size={11} /> <span>Xóa bài viết vi phạm</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Summary context */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-500 leading-normal">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Đối tượng bị báo cáo:</span>
                      <div className="flex items-center gap-2 text-slate-800">
                        <Avatar avatarId={reportedUser?.avatar || ''} name={reportedUser?.username || 'Thành viên'} size="sm" />
                        <div>
                          <p className="font-bold">{reportedUser?.username}</p>
                          <p className="text-[9px] font-mono text-slate-400">@{report.reportedUserId}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Người gửi đơn báo cáo:</span>
                      <div className="flex items-center gap-2 text-slate-800">
                        <Avatar avatarId={reporterUser?.avatar || ''} name={reporterUser?.username || 'Thành viên'} size="sm" />
                        <div>
                          <p className="font-bold">{reporterUser?.username}</p>
                          <p className="text-[9px] font-mono text-slate-400">@{report.reporterId}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Reason text */}
                  <div className="p-3.5 bg-rose-50/30 border border-rose-100/30 rounded-xl leading-relaxed">
                    <span className="text-[10px] uppercase font-bold text-rose-500 block mb-1">Lý do báo cáo vi phạm:</span>
                    <p className="text-slate-700 text-xs font-medium italic">“ {report.reason} ”</p>
                  </div>

                  {/* Content of post preview if available */}
                  {reportPost ? (
                    <div className="p-3.5 bg-slate-50/50 border border-slate-150/50 rounded-xl leading-relaxed text-slate-600 text-xs">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">Xem nội dung bài viết gốc:</span>
                      <p className="font-medium">{reportPost.content}</p>
                      {reportPost.image && (
                        <div className="mt-2.5 max-h-40 overflow-hidden rounded-xl border border-slate-100/50">
                          <img src={reportPost.image} alt="Reported attachment" referrerPolicy="no-referrer" className="w-full object-cover max-h-40" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-3.5 bg-slate-50 rounded-xl text-center text-slate-400 italic text-xs leading-normal">
                      Bài viết gốc liên quan đã bị ẩn hoặc xóa khỏi hệ thống.
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

    </div>
  );
}
