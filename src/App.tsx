/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, Post, Friendship, Message, Notification, Report, Hobby } from './types';
import { 
  INITIAL_USERS, 
  INITIAL_POSTS, 
  INITIAL_FRIENDSHIPS, 
  INITIAL_MESSAGES, 
  INITIAL_NOTIFICATIONS,
  SIMULATION_REPLIES
} from './data';

// Component imports
import Auth from './components/Auth';
import Sidebar from './components/Sidebar';
import Feed from './components/Feed';
import Friends from './components/Friends';
import Messages from './components/Messages';
import Notifications from './components/Notifications';
import Profile from './components/Profile';
import Admin from './components/Admin';
import PushNotification from './components/PushNotification';

export default function App() {
  // Helper storage routines
  const getStorageItem = <T,>(key: string, initialValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (e) {
      return initialValue;
    }
  };

  const setStorageItem = <T,>(key: string, value: T) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(e);
    }
  };

  // --- CORE SYSTEM STATE ---
  const [currentUser, setCurrentUser] = useState<User | null>(() => 
    getStorageItem<User | null>('kn_current_user', null)
  );

  const [allUsers, setAllUsers] = useState<User[]>(() => {
    const loaded = getStorageItem<User[]>('kn_all_users', INITIAL_USERS);
    const filtered = loaded.filter(u => u.id !== 'hoang_tech' && u.id !== 'vy_acoustic' && u.id !== 'nam_sport' && u.id !== 'thao_cinema');
    const hasAdmin = filtered.some(u => u.id === 'admin');
    if (!hasAdmin) {
      const defaultAdmin = INITIAL_USERS.find(u => u.id === 'admin');
      if (defaultAdmin) {
        filtered.push(defaultAdmin);
      }
    } else {
      return filtered.map(u => u.id === 'admin' ? {
        ...u,
        username: 'Quản Trị Viên (Admin)',
        email: 'admin@giabao.vn',
        role: 'admin',
        password: 'admin'
      } as User : u);
    }
    return filtered;
  });

  const [posts, setPosts] = useState<Post[]>(() => {
    const loaded = getStorageItem<Post[]>('kn_posts', INITIAL_POSTS);
    return loaded
      .filter(p => p.authorId !== 'hoang_tech' && p.authorId !== 'vy_acoustic' && p.authorId !== 'nam_sport' && p.authorId !== 'thao_cinema' && p.authorId !== 'admin')
      .map(p => ({
        ...p,
        comments: p.comments ? p.comments.filter(c => c.authorId !== 'hoang_tech' && c.authorId !== 'vy_acoustic' && c.authorId !== 'nam_sport' && c.authorId !== 'thao_cinema' && c.authorId !== 'admin') : [],
        likes: p.likes ? p.likes.filter(lId => lId !== 'hoang_tech' && lId !== 'vy_acoustic' && lId !== 'nam_sport' && lId !== 'thao_cinema' && lId !== 'admin') : []
      }));
  });

  const [friendships, setFriendships] = useState<Friendship[]>(() => {
    const loaded = getStorageItem<Friendship[]>('kn_friendships', INITIAL_FRIENDSHIPS);
    return loaded.filter(f => 
      f.user1Id !== 'hoang_tech' && f.user1Id !== 'vy_acoustic' && f.user1Id !== 'nam_sport' && f.user1Id !== 'thao_cinema' &&
      f.user2Id !== 'hoang_tech' && f.user2Id !== 'vy_acoustic' && f.user2Id !== 'nam_sport' && f.user2Id !== 'thao_cinema'
    );
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    const loaded = getStorageItem<Message[]>('kn_messages', INITIAL_MESSAGES);
    return loaded.filter(m => 
      m.senderId !== 'hoang_tech' && m.senderId !== 'vy_acoustic' && m.senderId !== 'nam_sport' && m.senderId !== 'thao_cinema' &&
      m.receiverId !== 'hoang_tech' && m.receiverId !== 'vy_acoustic' && m.receiverId !== 'nam_sport' && m.receiverId !== 'thao_cinema'
    );
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const loaded = getStorageItem<Notification[]>('kn_notifications', INITIAL_NOTIFICATIONS);
    return loaded.filter(n => 
      n.senderId !== 'hoang_tech' && n.senderId !== 'vy_acoustic' && n.senderId !== 'nam_sport' && n.senderId !== 'thao_cinema'
    );
  });

  const [reports, setReports] = useState<Report[]>(() => 
    getStorageItem<Report[]>('kn_reports', [])
  );

  // Layout UI states
  const [currentTab, setCurrentTab] = useState<string>('feed');
  const [activeChatFriendId, setActiveChatFriendId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<any[]>([]);

  // Synchronize state changes with custom LocalStorage persistent containers
  useEffect(() => {
    setStorageItem('kn_current_user', currentUser);
  }, [currentUser]);

  useEffect(() => {
    setStorageItem('kn_all_users', allUsers);
  }, [allUsers]);

  useEffect(() => {
    setStorageItem('kn_posts', posts);
  }, [posts]);

  useEffect(() => {
    setStorageItem('kn_friendships', friendships);
  }, [friendships]);

  useEffect(() => {
    setStorageItem('kn_messages', messages);
  }, [messages]);

  useEffect(() => {
    setStorageItem('kn_notifications', notifications);
  }, [notifications]);

  useEffect(() => {
    setStorageItem('kn_reports', reports);
  }, [reports]);

  // Handle auto synchronization check across tab viewports
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && e.key.startsWith('kn_')) {
        // Reload states
        setCurrentUser(getStorageItem<User | null>('kn_current_user', null));
        
        const rawUsers = getStorageItem<User[]>('kn_all_users', INITIAL_USERS);
        const filteredUsers = rawUsers.filter(u => u.id !== 'hoang_tech' && u.id !== 'vy_acoustic' && u.id !== 'nam_sport' && u.id !== 'thao_cinema');
        const hasAdmin = filteredUsers.some(u => u.id === 'admin');
        if (!hasAdmin) {
          const defaultAdmin = INITIAL_USERS.find(u => u.id === 'admin');
          if (defaultAdmin) filteredUsers.push(defaultAdmin);
        } else {
          filteredUsers.forEach((u, idx) => {
            if (u.id === 'admin') {
              filteredUsers[idx] = {
                ...u,
                username: 'Quản Trị Viên (Admin)',
                email: 'admin@giabao.vn',
                role: 'admin',
                password: 'admin'
              };
            }
          });
        }
        setAllUsers(filteredUsers);
        
        const rawPosts = getStorageItem<Post[]>('kn_posts', INITIAL_POSTS);
        setPosts(rawPosts
          .filter(p => p.authorId !== 'hoang_tech' && p.authorId !== 'vy_acoustic' && p.authorId !== 'nam_sport' && p.authorId !== 'thao_cinema' && p.authorId !== 'admin')
          .map(p => ({
            ...p,
            comments: p.comments ? p.comments.filter(c => c.authorId !== 'hoang_tech' && c.authorId !== 'vy_acoustic' && c.authorId !== 'nam_sport' && c.authorId !== 'thao_cinema' && c.authorId !== 'admin') : [],
            likes: p.likes ? p.likes.filter(lId => lId !== 'hoang_tech' && lId !== 'vy_acoustic' && lId !== 'nam_sport' && lId !== 'thao_cinema' && lId !== 'admin') : []
          }))
        );
        
        const rawFriendships = getStorageItem<Friendship[]>('kn_friendships', INITIAL_FRIENDSHIPS);
        setFriendships(rawFriendships.filter(f => 
          f.user1Id !== 'hoang_tech' && f.user1Id !== 'vy_acoustic' && f.user1Id !== 'nam_sport' && f.user1Id !== 'thao_cinema' &&
          f.user2Id !== 'hoang_tech' && f.user2Id !== 'vy_acoustic' && f.user2Id !== 'nam_sport' && f.user2Id !== 'thao_cinema'
        ));
        
        const rawMessages = getStorageItem<Message[]>('kn_messages', INITIAL_MESSAGES);
        setMessages(rawMessages.filter(m => 
          m.senderId !== 'hoang_tech' && m.senderId !== 'vy_acoustic' && m.senderId !== 'nam_sport' && m.senderId !== 'thao_cinema' &&
          m.receiverId !== 'hoang_tech' && m.receiverId !== 'vy_acoustic' && m.receiverId !== 'nam_sport' && m.receiverId !== 'thao_cinema'
        ));

        const rawNotifications = getStorageItem<Notification[]>('kn_notifications', INITIAL_NOTIFICATIONS);
        setNotifications(rawNotifications.filter(n => 
          n.senderId !== 'hoang_tech' && n.senderId !== 'vy_acoustic' && n.senderId !== 'nam_sport' && n.senderId !== 'thao_cinema'
        ));
        
        setReports(getStorageItem<Report[]>('kn_reports', []));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Compute unread elements
  const unreadMessagesCount = currentUser
    ? messages.filter((m) => m.receiverId === currentUser.id && !m.isRead).length
    : 0;

  const unreadNotificationsCount = currentUser
    ? notifications.filter((n) => n.userId === currentUser.id && !n.isRead).length
    : 0;

  // --- ACTIONS ---

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentTab('feed');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentTab('feed');
    setActiveChatFriendId(null);
  };
const handleRegister = (newUser: User) => {
  setAllUsers((prev) => [...prev, newUser]);
  setCurrentUser(newUser);
};

 

  const addToast = (toast: any) => {
    setToasts((prev) => [...prev, toast]);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // 1. Post Creation Action
  const handleAddPost = (content: string, image: string, visibility: 'public' | 'private') => {
    if (!currentUser) return;

    const newPost: Post = {
      id: `p_${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.username,
      authorAvatar: currentUser.avatar,
      content,
      image: image || undefined,
      visibility,
      likes: [],
      comments: [],
      createdAt: new Date().toISOString()
    };

    setPosts((prev) => [newPost, ...prev]);

    // AI Auto-Comment Simulation triggered after 6 seconds for public posts!
    if (visibility === 'public') {
      const commentators = allUsers.filter(u => u.id !== currentUser.id && !u.isBanned && u.id !== 'admin');
      if (commentators.length > 0) {
        setTimeout(() => {
          // Select a random friend to comment
          const randomAuthor = commentators[Math.floor(Math.random() * commentators.length)];
          const friendlyComments = [
            'Dòng trạng thái này của bạn chia sẻ hay quá! Thật nhiều năng lượng tích cực 🌟',
            'Cảm ơn bạn đã phản hồi chia sẻ thông điệp ý nghĩa này nha. Chúc bạn ngày mới tốt lành!',
            'Bài viết hình ảnh đẹp mê mẩn luôn á! Có dịp hân hạnh làm quen nhé bạn mình ơi.',
            'Cái nhìn rất sâu sắc về vấn đề này! Hẹn gặp lại bạn ở các cuộc thảo luận thú vị kế tiếp.'
          ];
          const randomCommentText = friendlyComments[Math.floor(Math.random() * friendlyComments.length)];

          const newComment = {
            id: `c_${Date.now()}`,
            postId: newPost.id,
            authorId: randomAuthor.id,
            authorName: randomAuthor.username,
            authorAvatar: randomAuthor.avatar,
            content: randomCommentText,
            createdAt: new Date().toISOString()
          };

          setPosts((currentPosts) => 
            currentPosts.map((p) => {
              if (p.id === newPost.id) {
                return { ...p, comments: [...p.comments, newComment] };
              }
              return p;
            })
          );

          // Add comment notification for the post architect (currentUser)
          const newNotif: Notification = {
            id: `n_${Date.now()}`,
            userId: currentUser.id,
            senderId: randomAuthor.id,
            senderName: randomAuthor.username,
            senderAvatar: randomAuthor.avatar,
            type: 'comment',
            postId: newPost.id,
            content: 'đã bình luận về bài viết mới của bạn.',
            isRead: false,
            createdAt: new Date().toISOString()
          };

          setNotifications((prev) => [newNotif, ...prev]);

          // Push floating toast alert
          addToast({
            id: `toast_com_${Date.now()}`,
            senderName: randomAuthor.username,
            senderAvatar: randomAuthor.avatar,
            content: 'đã bình luận về bài viết mới của bạn.',
            type: 'comment',
            onClick: () => {
              setCurrentTab('notifications');
            }
          });

        }, 6000);
      }
    }
  };

  // 2. Like Toggle Action
  const handleLikePost = (postId: string) => {
    if (!currentUser) return;

    setPosts((currentPosts) => 
      currentPosts.map((p) => {
        if (p.id === postId) {
          const liked = p.likes.includes(currentUser.id);
          const newLikes = liked 
            ? p.likes.filter(id => id !== currentUser.id)
            : [...p.likes, currentUser.id];

          // Trigger notification to original author if liking (not unliking)
          if (!liked && p.authorId !== currentUser.id) {
            const newNotif: Notification = {
              id: `n_${Date.now()}`,
              userId: p.authorId,
              senderId: currentUser.id,
              senderName: currentUser.username,
              senderAvatar: currentUser.avatar,
              type: 'like',
              postId: p.id,
              content: 'đã thích một bài viết của bạn.',
              isRead: false,
              createdAt: new Date().toISOString()
            };
            setNotifications((prev) => [newNotif, ...prev]);
          }

          return { ...p, likes: newLikes };
        }
        return p;
      })
    );
  };

  // 3. Comment Addition Action
  const handleAddComment = (postId: string, contentText: string) => {
    if (!currentUser) return;

    const newComment = {
      id: `c_${Date.now()}`,
      postId,
      authorId: currentUser.id,
      authorName: currentUser.username,
      authorAvatar: currentUser.avatar,
      content: contentText,
      createdAt: new Date().toISOString()
    };

    setPosts((currentPosts) => 
      currentPosts.map((p) => {
        if (p.id === postId) {
          // Trigger notification to author
          if (p.authorId !== currentUser.id) {
            const newNotif: Notification = {
              id: `n_${Date.now()}`,
              userId: p.authorId,
              senderId: currentUser.id,
              senderName: currentUser.username,
              senderAvatar: currentUser.avatar,
              type: 'comment',
              postId: p.id,
              content: 'đã bình luận về bài viết của bạn.',
              isRead: false,
              createdAt: new Date().toISOString()
            };
            setNotifications((prev) => [newNotif, ...prev]);
          }
          return { ...p, comments: [...p.comments, newComment] };
        }
        return p;
      })
    );
  };

  // 4. Delete Post Action (Self/Admin)
  const handleDeletePost = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  // 5. Report Content Action
  const handleReportPost = (postId: string, reasonText: string) => {
    if (!currentUser) return;
    const postObj = posts.find(p => p.id === postId);
    if (!postObj) return;

    const newReport: Report = {
      id: `rep_${Date.now()}`,
      postId,
      reportedUserId: postObj.authorId,
      reporterId: currentUser.id,
      reason: reasonText,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setReports((prev) => [newReport, ...prev]);

    // Send visual toast confirming report dispatch
    addToast({
      id: `toast_rep_${Date.now()}`,
      senderName: 'Bộ phận kiểm duyệt',
      senderAvatar: 'AV_ADMIN',
      content: 'Báo cáo của bạn đã được tiếp nhận thành công. Ban quản trị sẽ nhanh chóng xem xét bài viết này.',
      type: 'system',
      onClick: () => {}
    });
  };

  // 6. Admin: Remove flagged post and resolve report
  const handleDeletePostAdmin = (postId: string, reportId?: string) => {
    // Delete post globally
    setPosts((prev) => prev.filter((p) => p.id !== postId));

    // Resolve specific report if provided
    if (reportId) {
      setReports((prev) => 
        prev.map((r) => r.id === reportId ? { ...r, status: 'resolved' } : r)
      );
    }

    addToast({
      id: `toast_adm_del_${Date.now()}`,
      senderName: 'Quản Trị Viên',
      senderAvatar: 'AV_ADMIN',
      content: 'Đã xử phạt xóa bài viết vi phạm tiêu chuẩn cộng đồng diện rộng.',
      type: 'system',
      onClick: () => {}
    });
  };

  const handleResolveReport = (reportId: string) => {
    setReports((prev) => 
      prev.map((r) => r.id === reportId ? { ...r, status: 'resolved' } : r)
    );
    
    addToast({
      id: `toast_adm_res_${Date.now()}`,
      senderName: 'Quản Trị Viên',
      senderAvatar: 'AV_ADMIN',
      content: 'Đã từ chối đơn thỉnh cầu báo cáo sai sự thật.',
      type: 'system',
      onClick: () => {}
    });
  };

  // 7. Admin: Ban / Unban Toggle Action
  const handleToggleBanUser = (userId: string) => {
    if (userId === 'admin' || userId === currentUser?.id) return; // Prevent self-harm or banning primary system admins

    setAllUsers((currentUsers) => 
      currentUsers.map((u) => {
        if (u.id === userId) {
          const nextBanned = !u.isBanned;
          
          if (nextBanned) {
            // Log out user if current active switches later
            addToast({
              id: `toast_ban_${Date.now()}`,
              senderName: 'Quản Trị Viên',
              senderAvatar: 'AV_ADMIN',
              content: `Đã khóa thành công tài khoản @${userId} vì vi phạm chính sách cộng đồng.`,
              type: 'system',
              onClick: () => {}
            });
          } else {
            addToast({
              id: `toast_unban_${Date.now()}`,
              senderName: 'Quản Trị Viên',
              senderAvatar: 'AV_ADMIN',
              content: `Đã dỡ bỏ lệnh hạn chế tài khoản @${userId}.`,
              type: 'system',
              onClick: () => {}
            });
          }
          return { ...u, isBanned: nextBanned };
        }
        return u;
      })
    );
  };

  // 8. Friends: Send Invitation Action
  const handleSendFriendRequest = (receiverId: string) => {
    if (!currentUser) return;

    const request: Friendship = {
      id: `freq_${Date.now()}`,
      user1Id: currentUser.id,
      user2Id: receiverId,
      status: 'pending',
      senderId: currentUser.id,
      createdAt: new Date().toISOString()
    };

    setFriendships((prev) => [...prev, request]);

    // AI Auto-Acceptance Simulation triggered 3.5 seconds later!
    const receiver = allUsers.find(u => u.id === receiverId);
    if (receiver) {
      setTimeout(() => {
        setFriendships((currentFriends) => 
          currentFriends.map((f) => {
            if (f.id === request.id) {
              return { ...f, status: 'accepted' };
            }
            return f;
          })
        );

        // Add accepted invitation notification for currentUser
        const newNotif: Notification = {
          id: `n_acc_${Date.now()}`,
          userId: currentUser.id,
          senderId: receiver.id,
          senderName: receiver.username,
          senderAvatar: receiver.avatar,
          type: 'friend_accept',
          content: 'đã đồng ý kết bạn với bạn. Hãy cùng nhau trò chuyện nhé!',
          isRead: false,
          createdAt: new Date().toISOString()
        };

        setNotifications((prev) => [newNotif, ...prev]);

        // Trigger dynamic Toast banner
        addToast({
          id: `toast_acc_${Date.now()}`,
          senderName: receiver.username,
          senderAvatar: receiver.avatar,
          content: 'đã đồng ý kết bạn với bạn. Trò chuyện ngay!',
          type: 'friend_accept',
          onClick: () => {
            setActiveChatFriendId(receiver.id);
            setCurrentTab('messages');
          }
        });

      }, 3500);
    }
  };

  // 9. Friends: Accept Incoming Invite Action
  const handleAcceptRequest = (friendshipId: string) => {
    if (!currentUser) return;

    setFriendships((prev) => 
      prev.map((f) => {
        if (f.id === friendshipId) {
          // Send notification back to original requester (f.user1Id)
          const newNotif: Notification = {
            id: `n_acc_back_${Date.now()}`,
            userId: f.user1Id,
            senderId: currentUser.id,
            senderName: currentUser.username,
            senderAvatar: currentUser.avatar,
            type: 'friend_accept',
            content: 'đã chấp nhận lời mời kết bạn của bạn. Làm quen nhau ngay nào!',
            isRead: false,
            createdAt: new Date().toISOString()
          };
          setNotifications((currentNotifs) => [newNotif, ...currentNotifs]);

          return { ...f, status: 'accepted' };
        }
        return f;
      })
    );
  };

  // 10. Friends: Decline Invitation Action
  const handleDeclineRequest = (friendshipId: string) => {
    setFriendships((prev) => prev.filter((f) => f.id !== friendshipId));
  };

  // 11. Messaging: Send Message Action
  const handleSendMessage = (receiverId: string, contentText: string) => {
    if (!currentUser) return;

    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      senderId: currentUser.id,
      receiverId,
      content: contentText,
      timestamp: new Date().toISOString(),
      isRead: false
    };

    setMessages((prev) => [...prev, newMsg]);

    // AI Interactive Automated Response Simulation matching custom bio keywords triggered after 2 seconds!
    const partnerId = receiverId;
    const repliesTemplates = SIMULATION_REPLIES[partnerId];
    if (repliesTemplates && repliesTemplates.length > 0) {
      setTimeout(() => {
        const randomReply = repliesTemplates[Math.floor(Math.random() * repliesTemplates.length)];
        const aiMsg: Message = {
          id: `msg_ai_${Date.now()}`,
          senderId: partnerId,
          receiverId: currentUser.id,
          content: randomReply,
          timestamp: new Date().toISOString(),
          isRead: false
        };

        setMessages((currentMsgs) => [...currentMsgs, aiMsg]);

        // Incoming messages trigger notifications if user has closed chat window or is browsing elsewhere
        const partner = allUsers.find(u => u.id === partnerId);
        if (partner) {
          const newNotif: Notification = {
            id: `n_msg_${Date.now()}`,
            userId: currentUser.id,
            senderId: partner.id,
            senderName: partner.username,
            senderAvatar: partner.avatar,
            type: 'message',
            content: `vừa gửi tin nhắn mới cho bạn: "${randomReply.slice(0, 15)}..."`,
            isRead: false,
            createdAt: new Date().toISOString()
          };
          setNotifications((prev) => [newNotif, ...prev]);

          // Fire floating Toast alert
          addToast({
            id: `toast_msg_${Date.now()}`,
            senderName: partner.username,
            senderAvatar: partner.avatar,
            content: `đã gửi tin nhắn: "${randomReply.slice(0, 20)}..."`,
            type: 'message',
            onClick: () => {
              setActiveChatFriendId(partner.id);
              setCurrentTab('messages');
            }
          });
        }

      }, 2000);
    }
  };

  // 12. Profile Tweak update
  const handleUpdateUser = (updated: User) => {
    setAllUsers((currentUsers) => 
      currentUsers.map((u) => u.id === updated.id ? updated : u)
    );
    // Sync current logged User
    setCurrentUser(updated);

    // Alert toast
    addToast({
      id: `toast_prof_up_${Date.now()}`,
      senderName: updated.username,
      senderAvatar: updated.avatar,
      content: 'Đã hoàn tất lưu cập nhật hồ sơ cá nhân và sở thích của bạn!',
      type: 'system',
      onClick: () => {}
    });
  };

  // 13. Notifications: Read & Clean management
  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) => 
      prev.map((n) => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const handleMarkAllAsRead = () => {
    if (!currentUser) return;
    setNotifications((prev) => 
      prev.map((n) => n.userId === currentUser.id ? { ...n, isRead: true } : n)
    );
  };

  const handleClearAllNotifications = () => {
    if (!currentUser) return;
    setNotifications((prev) => prev.filter((n) => n.userId !== currentUser.id));
  };

  // Navigation callbacks
  const handleNavigateToPost = (postId: string) => {
    setCurrentTab('feed');
    // Set search query inside feed automatically
    const element = document.getElementById('input-search-feed') as HTMLInputElement;
    if (element) {
      element.value = postId;
      // dispatch virtual input change
      const event = new Event('input', { bubbles: true });
      element.dispatchEvent(event);
    }
  };

  const handleNavigateToChat = (friendId: string) => {
    setActiveChatFriendId(friendId);
    setCurrentTab('messages');
    
    // Mark messages from this friend as read when entering chat
    if (currentUser) {
      setMessages((prev) => 
        prev.map((m) => 
          m.senderId === friendId && m.receiverId === currentUser.id 
            ? { ...m, isRead: true } 
            : m
        )
      );
    }
  };

  // Mark messages read whenever conversation becomes active
  useEffect(() => {
    if (currentUser && activeChatFriendId && currentTab === 'messages') {
      setMessages((prev) => 
        prev.map((m) => 
          m.senderId === activeChatFriendId && m.receiverId === currentUser.id 
            ? { ...m, isRead: true } 
            : m
        )
      );
    }
  }, [activeChatFriendId, currentTab, currentUser]);


  // Ensure current user is not banned in real-time, otherwise log out instantly
  useEffect(() => {
    if (currentUser) {
      const activeState = allUsers.find(u => u.id === currentUser.id);
      if (activeState && activeState.isBanned) {
        handleLogout();
        alert('Tài khoản của bạn đã bị khóa bởi quản trị lý kiểm duyệt.');
      }
    }
  }, [allUsers, currentUser]);

  // --- RENDERING ROUTER INTERFACES ---

  if (!currentUser) {
    return (
      <Auth 
        onLogin={handleLogin} 
        registeredUsers={allUsers} 
        onRegister={handleRegister} 
      />
    );
  }

  return (
    <div id="application-layout" className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <Sidebar
        currentTab={currentTab}
        onChangeTab={setCurrentTab}
        currentUser={currentUser}
        onLogout={handleLogout}
        unreadMessagesCount={unreadMessagesCount}
        unreadNotificationsCount={unreadNotificationsCount}
      />

      {/* PRIMARY FLOW CONTAINER ACCESSIBILITY */}
      <main id="app-viewport-flow" className="flex-1 overflow-x-hidden md:h-screen md:overflow-y-auto">
        <h1 className="sr-only">Đại gia đình Gia Bảo - Mạng xã hội gia đình</h1>
        
        {currentTab === 'feed' && (
          <Feed
            currentUser={currentUser}
            posts={posts}
            onAddPost={handleAddPost}
            onLikePost={handleLikePost}
            onAddComment={handleAddComment}
            onDeletePost={handleDeletePost}
            onReportPost={handleReportPost}
          />
        )}

        {currentTab === 'messages' && (
          <Messages
            currentUser={currentUser}
            allUsers={allUsers}
            messages={messages}
            friendships={friendships}
            onSendMessage={handleSendMessage}
            activeChatFriendId={activeChatFriendId}
            setActiveChatFriendId={setActiveChatFriendId}
          />
        )}

        {currentTab === 'friends' && (
          <Friends
            currentUser={currentUser}
            allUsers={allUsers}
            friendships={friendships}
            onSendRequest={handleSendFriendRequest}
            onAcceptRequest={handleAcceptRequest}
            onDeclineRequest={handleDeclineRequest}
            onNavigateToChat={handleNavigateToChat}
          />
        )}

        {currentTab === 'notifications' && (
          <Notifications
            currentUser={currentUser}
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
            onClearAll={handleClearAllNotifications}
            onNavigateToPost={handleNavigateToPost}
          />
        )}

        {currentTab === 'profile' && (
          <Profile
            currentUser={currentUser}
            posts={posts}
            onUpdateUser={handleUpdateUser}
            onLikePost={handleLikePost}
            onDeletePost={handleDeletePost}
          />
        )}

        {currentTab === 'admin' && currentUser.role === 'admin' && (
          <Admin
            currentUser={currentUser}
            allUsers={allUsers}
            posts={posts}
            reports={reports}
            onToggleBanUser={handleToggleBanUser}
            onResolveReport={handleResolveReport}
            onDeletePostAdmin={handleDeletePostAdmin}
          />
        )}
      </main>

      {/* FLOATING PUSH TOASTS OVERLAY */}
      <PushNotification toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}
