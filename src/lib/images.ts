/** Ảnh minh họa từ Unsplash — dùng cho hero, inbox, sections */
export const ILLUSTRATIONS = {
  heroBooks:
    'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80&auto=format&fit=crop',
  reading:
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80&auto=format&fit=crop',
  library:
    'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=600&q=80&auto=format&fit=crop',
  exchange:
    'https://images.unsplash.com/photo-1524995998253-2314e69e3641?w=600&q=80&auto=format&fit=crop',
  community:
    'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=600&q=80&auto=format&fit=crop',
} as const

export const DEMO_CHATS = [
  {
    name: 'Lan Anh',
    avatar: '📚',
    book: 'Đắc Nhân Tâm',
    preview: 'Mình có thể đổi với "Nhà Giả Kim" được không?',
    time: '2 phút',
    unread: 2,
  },
  {
    name: 'Minh Tuấn',
    avatar: '📖',
    book: 'Sapiens',
    preview: 'Ok, hẹn gặp ở thư viện lúc 5h chiều nhé!',
    time: '15 phút',
    unread: 0,
  },
  {
    name: 'Thu Hà',
    avatar: '✨',
    book: 'Atomic Habits',
    preview: 'Sách còn rất mới, mình cho mượn 2 tuần nha.',
    time: '1 giờ',
    unread: 1,
  },
] as const
