/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Post, Message, Friendship, Notification, Hobby } from './types';

export const HOBBIES_LIST: Hobby[] = [
  'Công nghệ',
  'Âm nhạc',
  'Thể thao',
  'Ẩm thực',
  'Du lịch',
  'Điện ảnh',
  'Đọc sách',
  'Nhiếp ảnh',
  'Game'
];

export const INITIAL_USERS: User[] = [
  {
    id: 'admin',
    username: 'Quản Trị Viên (Admin)',
    email: 'admin@giabao.vn',
    avatar: 'AV_ADMIN',
    bio: 'Quản trị viên hệ thống của Đại gia đình Gia Bảo. Chịu trách nhiệm kiểm duyệt nội dung và hỗ trợ thành viên.',
    hobbies: [],
    role: 'admin',
    createdAt: '2026-01-01T00:00:00Z',
    password: 'admin'
  }
];

export const INITIAL_POSTS: Post[] = [];

export const INITIAL_FRIENDSHIPS: Friendship[] = [];

export const INITIAL_MESSAGES: Message[] = [];

export const INITIAL_NOTIFICATIONS: Notification[] = [];

// Helper to provide context-aware automatic simulation replies when users chat with them.
export const SIMULATION_REPLIES: Record<string, string[]> = {
  hoang_tech: [
    "Công nghệ đúng là kì diệu thật đấy! Mình tin rằng tương lai con người sẽ tiến hóa vượt bậc nhờ AI.",
    "Cậu có hay code hay đọc sách gì không? Mình đang đọc quyển Designing Data-Intensive Applications hay lắm.",
    "Ý kiến này của bạn rất hay, để mình nghiên cứu thêm và tích hợp vào hệ thống xem sao!",
    "Hôm sau chúng ta hẹn nhau một buổi cà phê bóng tối nói chuyện công nghệ nha!"
  ],
  vy_acoustic: [
    "Âm nhạc chính là liều thuốc chữa lành tâm hồn tốt nhất đấy. Bạn thích thể loại nhạc gì?",
    "Dạo này mình vừa học được một vài hợp âm jazz mới, nghe lạ tai cực kỳ luôn.",
    "Hôm nào ghé bờ hồ nghe mình hát acoustic nhé, không khí tối thứ bảy ở hồ Tây chill cực.",
    "Chào bạn! Cùng kết nối và giao lưu âm nhạc nhé 💖"
  ],
  nam_sport: [
    "Chạy bộ thôi người anh em ơi! Khỏe khoắn tinh thần, sảng khoái cơ thể!",
    "Hôm nay bạn tập nhóm cơ nào rồi? Đừng quên uống đủ nước nha 💪",
    "Mình đang định lên kế hoạch đi leo núi Fansipan tháng tới, bạn có hứng thú tham gia cùng không?",
    "Một ngày tuyệt vời bắt đầu từ thói quen vận động sớm đó bạn!"
  ],
  thao_cinema: [
    "Điện ảnh là tấm gương phản chiếu tâm hồn con người một cách sâu sắc nhất.",
    "Hôm qua mình vừa xem lại bộ phim 'Cinema Paradiso', vẫn khóc rấm rứt như lần đầu.",
    "Mình đang lên ý tưởng kịch bản về tình bạn tri kỷ thời mạng xã hội chưa phát triển.",
    "Bạn có cuốn sách hay gợi ý phim nào hay ho chia sẻ với mình nhé ☕"
  ]
};
