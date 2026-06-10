/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Hobby } from '../types';
import { supabase } from '../lib/supabase';
import { HOBBIES_LIST, INITIAL_USERS } from '../data';
import { Sparkles, Shield, User as UserIcon, Lock, Mail, ChevronRight, HelpCircle } from 'lucide-react';

interface AuthProps {
  onLogin: (user: User) => void;
  registeredUsers: User[];
  onRegister: (newUser: User) => void;
}

export default function Auth({ onLogin, registeredUsers, onRegister }: AuthProps) {
  const [isLoginView, setIsLoginView] = useState(true);
  const [error, setError] = useState('');

  // Login form states
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');

  // Register form states
  const [regId, setRegId] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [avatar, setAvatar] = useState('AV_DEFAULT');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const query = loginId.trim().toLowerCase();
    const cleanQuery = query.startsWith('@') ? query.slice(1) : query;

    const { data: user, error: loginError } = await supabase
  .from('users')
  .select('*')
  .or(`id.eq.${cleanQuery},email.eq.${query}`)
  .single();

if (loginError || !user) {
  setError('Tài khoản không tồn tại');
  return;
}

if (user.is_banned) {
  setError('Tài khoản đã bị khóa');
  return;
}

if (password !== user.password) {
  setError('Sai mật khẩu');
  return;
}

onLogin({
  ...user,
  isBanned: user.is_banned
});

}; 
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!regId || !username || !email || !regPassword || !regConfirmPassword) {
      setError('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setError('Mật khẩu và Xác nhận mật khẩu không trùng khớp.');
      return;
    }

    const cleanId = regId.trim().toLowerCase().replace(/\s+/g, '_');
    
    // Check duplication
    const { data: existingUser } = await supabase
  .from('users')
  .select('id')
  .eq('id', cleanId)
  .maybeSingle();

if (existingUser) {
  setError('ID người dùng này đã tồn tại');
  return;
}
    if (duplicate) {
      setError('ID người dùng này đã tồn tại, vui lòng chọn một ID khác.');
      return;
    }

    const newUser: User = {
      id: cleanId,
      username: username.trim(),
      email: email.trim(),
      avatar: avatar,
      bio: bio.trim() || 'Thành viên mới của Đại gia đình Gia Bảo.',
      hobbies: [], // Removed as hobbies can be edited in Profile page after login
      role: 'user', // Closed system: Admin is not self-appointed
      createdAt: new Date().toISOString(),
      password: regPassword,
    };

    const { error: insertError } = await supabase
  .from('users')
  .insert([
    {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      avatar: newUser.avatar,
      bio: newUser.bio,
      hobbies: [],
      role: 'user',
      password: newUser.password,
      is_banned: false
    }
  ]);

if (insertError) {
  setError(insertError.message);
  return;
}

onRegister(newUser);
onLogin(newUser);
  };

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

  return (
    <div id="auth-page-container" className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div id="auth-header" className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold text-2xl shadow-md uppercase">
            GB
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 tracking-tight text-slate-800">
          Đại gia đình Gia Bảo
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Mạng xã hội gia đình - Tấn tới, Văn minh, Gắn kết yêu thương
        </p>
      </div>

      <div id="auth-box" className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-4 shadow-sm border border-slate-200 sm:rounded-2xl sm:px-10 overflow-hidden">
          {/* Header Switcher */}
          <div className="flex border-b border-slate-200 pb-4 mb-6">
            <button
               id="btn-switch-login"
               type="button"
               onClick={() => { setIsLoginView(true); setError(''); }}
               className={`flex-1 text-center py-2 font-medium text-sm transition-colors cursor-pointer ${
                 isLoginView
                   ? 'text-blue-600 border-b-2 border-blue-600 font-bold'
                   : 'text-slate-400 hover:text-slate-600'
               }`}
             >
               Đăng nhập
             </button>
             <button
               id="btn-switch-register"
               type="button"
               onClick={() => { setIsLoginView(false); setError(''); }}
               className={`flex-1 text-center py-2 font-medium text-sm transition-colors cursor-pointer ${
                 !isLoginView
                   ? 'text-blue-600 border-b-2 border-blue-600 font-bold'
                   : 'text-slate-400 hover:text-slate-600'
               }`}
             >
              Tạo tài khoản mới
            </button>
          </div>

          {error && (
            <div id="auth-error" className="mb-4 p-3 bg-rose-50 border border-rose-100 text-rose-600 text-sm rounded-xl">
              {error}
            </div>
          )}

          {isLoginView ? (
            /* LOGIN FORM */
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Mã ID người dùng hoặc Email
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <UserIcon size={18} />
                  </div>
                  <input
                    id="input-login-id"
                    type="text"
                    required
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all bg-white"
                    placeholder="Ví dụ: hoang_tech hoặc admin"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Mật khẩu
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock size={16} />
                  </div>
                  <input
                    id="input-login-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                    placeholder="Nhập mật khẩu..."
                  />
                </div>
              </div>

              <div>
                <button
                  id="btn-login-submit"
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors cursor-pointer"
                >
                  Đăng nhập ngay
                </button>
              </div>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    ID người dùng (Viết liền, không dấu) <span className="text-rose-500">*</span>
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-bold text-sm">
                      @
                    </div>
                    <input
                      id="input-reg-id"
                      type="text"
                      required
                      value={regId}
                      onChange={(e) => setRegId(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      className="block w-full pl-8 pr-3 py-2 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="ví_dụ: nam_99"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Tên hiển thị (Họ tên đầy đủ) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="input-reg-name"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Ví dụ: Nguyễn Văn Nam"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Địa chỉ Email <span className="text-rose-500">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail size={16} />
                  </div>
                  <input
                    id="input-reg-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="username@gmail.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Mật khẩu <span className="text-rose-500">*</span>
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock size={16} />
                    </div>
                    <input
                      id="input-reg-password"
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="block w-full pl-9 pr-3 py-2 border border-slate-100 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                      placeholder="Mật khẩu..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Xác nhận mật khẩu <span className="text-rose-500">*</span>
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock size={16} />
                    </div>
                    <input
                      id="input-reg-confirm-password"
                      type="password"
                      required
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      className="block w-full pl-9 pr-3 py-2 border border-slate-100 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                      placeholder="Xác nhận..."
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  id="btn-register-submit"
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors cursor-pointer"
                >
                  Tạo tài khoản và tham gia
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
