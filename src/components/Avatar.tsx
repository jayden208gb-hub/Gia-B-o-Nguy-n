/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface AvatarProps {
  avatarId: string;
  name: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Avatar({ avatarId, name, className = '', size = 'md' }: AvatarProps) {
  const getInitials = (fullName: string) => {
    if (!fullName) return '?';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    const first = parts[0];
    const last = parts[parts.length - 1];
    return (first[0] + last[0]).toUpperCase();
  };

  const getGradient = (id: string) => {
    switch (id) {
      case 'AV_ADMIN':
        return 'from-red-500 to-rose-600 text-white';
      case 'AV_HOANG':
        return 'from-blue-400 to-blue-600 text-white';
      case 'AV_VY':
        return 'from-pink-500 to-rose-500 text-white';
      case 'AV_NAM':
        return 'from-orange-400 to-amber-500 text-white';
      case 'AV_THAO':
        return 'from-teal-400 to-emerald-500 text-white';
      default:
        // Hash the id to pick a pretty persistent gradient
        let sum = 0;
        for (let i = 0; i < id.length; i++) {
          sum += id.charCodeAt(i);
        }
        const gradients = [
          'from-violet-500 to-purple-600 text-white',
          'from-fuchsia-500 to-pink-600 text-white',
          'from-cyan-400 to-blue-500 text-white',
          'from-emerald-400 to-teal-500 text-white',
          'from-amber-400 to-orange-500 text-white',
        ];
        return gradients[sum % gradients.length];
    }
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-20 h-20 text-2xl font-bold',
  };

  const initials = getInitials(name);

  // If avatarId is a custom base64 image (starts with data:image)
  if (avatarId && avatarId.startsWith('data:image')) {
    return (
      <img
        src={avatarId}
        alt={name}
        referrerPolicy="no-referrer"
        className={`rounded-full object-cover border border-slate-100 ${sizeClasses[size]} ${className}`}
        id={`avatar-img-${avatarId.slice(-10)}`}
      />
    );
  }

  // Fallback to beautiful elegant initials CSS gradients
  const gradient = getGradient(avatarId || name);

  return (
    <div
      id={`avatar-fallback-${avatarId || name.replace(/\s+/g, '-')}`}
      className={`rounded-full flex items-center justify-center font-medium bg-gradient-to-br shadow-inner uppercase select-none ${sizeClasses[size]} ${gradient} ${className}`}
    >
      {initials}
    </div>
  );
}
