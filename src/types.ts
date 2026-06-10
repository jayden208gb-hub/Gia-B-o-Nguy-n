/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Hobby = 
  | 'Công nghệ' 
  | 'Âm nhạc' 
  | 'Thể thao' 
  | 'Ẩm thực' 
  | 'Du lịch' 
  | 'Điện ảnh' 
  | 'Đọc sách' 
  | 'Nhiếp ảnh' 
  | 'Game';

export interface User {
  id: string; // Friendly unique ID like 'jayden208'
  username: string; // Full name or Display name
  email: string;
  avatar: string; // Base64 or URL
  bio: string;
  hobbies: Hobby[];
  role: 'user' | 'admin';
  createdAt: string;
  isBanned?: boolean;
  password?: string;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  image?: string; // Optional illustration or photo
  visibility: 'public' | 'private';
  likes: string[]; // List of userIds who liked
  comments: Comment[];
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface Friendship {
  id: string;
  user1Id: string;
  user2Id: string;
  status: 'pending' | 'accepted' | 'declined';
  senderId: string; // Who sent the request
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string; // Recipient
  senderId: string; // Instigator
  senderName: string;
  senderAvatar: string;
  type: 'like' | 'comment' | 'friend_request' | 'friend_accept' | 'message';
  postId?: string; // Relevant post if any
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface Report {
  id: string;
  postId?: string;
  reportedUserId: string;
  reporterId: string;
  reason: string;
  status: 'pending' | 'resolved';
  createdAt: string;
}
